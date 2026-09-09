const express = require("express");
const path = require("path");
const pkg = require("../package.json");
const apps = require("./config/apps");
const { statusFor } = require("./dockerStatus");
const { startApp, stopApp } = require("./dockerControl");
const { fetchSpoolmanStats } = require("./integrations/spoolman");

// Tips stored locally in this app rather than fetched from another app's
// API - either because the source has no API to fetch from (OctoPrint is
// a device, not code we control) or because they aren't about any one app
// at all ("global"). Keyed by the id used in their /api/local-tips/:id URL.
const LOCAL_TIPS = {
  octoprint: require("./config/tips/octoprint"),
  global: require("./config/tips/global"),
  spoolman: require("./config/tips/spoolman"),
};

// Not tied to any app in `apps.js`, so it can't be discovered by filtering
// that list the way api-based tip sources are - listed here instead and
// merged into /api/tip-sources below.
const EXTRA_TIP_SOURCES = [{ id: "global", name: "Mashghal", icon: "favicon.svg", tipsUrl: "/api/local-tips/global" }];

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

async function checkApp(appConfig) {
  // Apps with neither `containers` nor `healthUrl` (e.g. a plain collection
  // of external links) have nothing to check - skip the status/health
  // lookup entirely rather than pinging an undefined URL.
  if (!appConfig.containers && !appConfig.healthUrl) return appConfig;

  const result = await statusFor(appConfig);
  if (appConfig.statsApiUrl && result.status === "running") {
    result.stats = await fetchSpoolmanStats(appConfig.statsApiUrl);
  }
  return result;
}

app.get("/api/apps", async (req, res) => {
  // Apps the browser has asked us not to check (a per-viewer preference
  // stored client-side, not shared state) skip the check entirely rather
  // than being checked and just hidden, so e.g. a known-offline OctoPrint
  // doesn't cost a timeout on every poll.
  const disabled = new Set(
    String(req.query.disabled || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );

  const results = await Promise.all(
    apps.map((appConfig) => (disabled.has(appConfig.id) ? { ...appConfig, status: "disabled" } : checkApp(appConfig)))
  );
  res.json(results);
});

// Always performs a live check, ignoring the disabled list - the "check
// now" button on a card with monitoring turned off still needs to reach
// the app itself, without flipping the stored monitoring preference.
app.get("/api/apps/:id", async (req, res) => {
  const appConfig = apps.find((a) => a.id === req.params.id);
  if (!appConfig) return res.status(404).json({ error: "not found" });
  res.json(await checkApp(appConfig));
});

function findControllableApp(req, res) {
  const appConfig = apps.find((a) => a.id === req.params.id);
  if (!appConfig) {
    res.status(404).json({ error: "not found" });
    return null;
  }
  if (!appConfig.containers) {
    res.status(400).json({ error: "this app isn't running on this Docker host, so it can't be started or stopped here" });
    return null;
  }
  return appConfig;
}

app.post("/api/apps/:id/start", async (req, res) => {
  const appConfig = findControllableApp(req, res);
  if (!appConfig) return;
  try {
    await startApp(appConfig);
  } catch (err) {
    return res.status(502).json({ error: "failed to start", detail: err.message });
  }
  res.json(await checkApp(appConfig));
});

app.post("/api/apps/:id/stop", async (req, res) => {
  const appConfig = findControllableApp(req, res);
  if (!appConfig) return;
  try {
    await stopApp(appConfig);
  } catch (err) {
    return res.status(502).json({ error: "failed to stop", detail: err.message });
  }
  res.json(await checkApp(appConfig));
});

// Static metadata for apps that expose their own tips API, for the browser
// to fetch tips from directly (see public/tips.js). Deliberately separate
// from /api/apps: that endpoint performs a live status check as a side
// effect (and would ignore a user's per-app monitoring-off preference,
// since this has no reason to pass the `disabled` list), neither of which
// tips discovery should trigger.
app.get("/api/tip-sources", (_req, res) => {
  const appSources = apps.filter((a) => a.tipsUrl).map(({ id, name, icon, tipsUrl }) => ({ id, name, icon, tipsUrl }));
  res.json([...appSources, ...EXTRA_TIP_SOURCES]);
});

// Serves this app's own locally-stored tip sets (see LOCAL_TIPS above),
// in the same { tips: [...] } shape a remote app's /api/tips/ returns, so
// public/tips.js can fetch every source the same way regardless of origin.
app.get("/api/local-tips/:id", (req, res) => {
  const tips = LOCAL_TIPS[req.params.id];
  if (!tips) return res.status(404).json({ error: "not found" });
  res.json({ tips });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/version", (_req, res) => res.json({ version: pkg.version }));

app.listen(PORT, () => {
  console.log(`Mashghal dashboard listening on http://localhost:${PORT}`);
});
