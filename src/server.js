const express = require("express");
const path = require("path");
const pkg = require("../package.json");
const apps = require("./config/apps");
const { statusFor } = require("./dockerStatus");
const { startApp, stopApp } = require("./dockerControl");
const { fetchSpoolmanStats } = require("./integrations/spoolman");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

async function checkApp(appConfig) {
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

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/version", (_req, res) => res.json({ version: pkg.version }));

app.listen(PORT, () => {
  console.log(`Mashghal dashboard listening on http://localhost:${PORT}`);
});
