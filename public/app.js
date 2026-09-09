const STATUS_LABELS = {
  running: "Online",
  partial: "Partially running",
  stopped: "Stopped",
  "not-found": "Not started",
  unknown: "Unknown",
};

// The last real (non-"disabled") status seen for each app. Turning
// monitoring off stops the checks, but the status line should keep
// showing what it last knew rather than switching to some "off" state -
// the eye-off icon already communicates that monitoring is paused.
const lastKnownById = {};

function resolveDisplayApp(app) {
  if (app.status !== "disabled") {
    lastKnownById[app.id] = app;
    return app;
  }
  const cached = lastKnownById[app.id];
  return cached ? { ...app, status: cached.status, stats: cached.stats, containerStates: cached.containerStates } : { ...app, status: "unknown" };
}

const ICONS = {
  eye: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12C2 12 5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12C2 12 5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="21" x2="21" y2="3"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>`,
  // Link-type badges: external site, internal/local-network site, native app.
  externalLink: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  internalLink: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>`,
  localApp: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  free: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8"/><path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8"/></svg>`,
};

// Classifies a link so it can be badged with an icon showing what clicking
// it actually does: hand off to a native app, hit something on this host/
// LAN, or leave to a public site. mashghal-launch:// is its own scheme (see
// the "Design Tools" card); everything else is judged by hostname.
function linkKind(url) {
  if (url.startsWith("mashghal-launch://")) return "local-app";
  try {
    const { hostname } = new URL(url, window.location.origin);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local")) return "internal";
  } catch {
    // Relative/unparsable URL - same-origin, so treat as internal.
    return "internal";
  }
  return "external";
}

const LINK_KIND_ICON = { external: ICONS.externalLink, internal: ICONS.internalLink, "local-app": ICONS.localApp };
const LINK_KIND_TITLE = { external: "Opens an external site", internal: "Opens on this host/network", "local-app": "Launches a local app" };

// `cost` is "free" or a run of 1-3 "$" - free gets its own icon, the rest
// just render the literal $ run so cost reads as intensity at a glance.
function costBadge(cost) {
  if (!cost) return "";
  if (cost === "free") return `<span class="link-cost link-cost-free" title="Free" aria-label="Free">${ICONS.free}</span>`;
  return `<span class="link-cost" title="Cost: ${cost}">${cost}</span>`;
}

const DISABLED_KEY = "mashghal:disabledMonitoring";

function getDisabledIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISABLED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function setDisabledIds(ids) {
  try {
    localStorage.setItem(DISABLED_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable (private browsing, etc) - preference just won't persist.
  }
}

async function loadApps() {
  try {
    const disabled = [...getDisabledIds()].join(",");
    const query = disabled ? `?disabled=${encodeURIComponent(disabled)}` : "";
    const res = await fetch(`/api/apps${query}`);
    const apps = await res.json();
    render(apps);
  } catch (err) {
    console.error("Failed to load app status", err);
  }
}

function cardBody(app, isDisabled) {
  const links = app.links
    .map((l) => {
      const kind = linkKind(l.url);
      const icon = `<span class="link-icon" aria-hidden="true">${LINK_KIND_ICON[kind]}</span>`;
      const cost = costBadge(l.cost);
      // `description` and `category` (optional, per-link metadata) surface
      // as the hover tooltip rather than taking up card space - there's no
      // room for tags on a pill this small.
      const title = [
        l.description,
        Array.isArray(l.category) && l.category.length ? `Category: ${l.category.join(", ")}` : null,
        LINK_KIND_TITLE[kind],
      ]
        .filter(Boolean)
        .join(" — ");
      // A local-app link hands off to mashghal-launch:// (see the "Design
      // Tools" card), not a website - opened in the same tab, so the
      // browser doesn't pop an empty blank tab for a scheme it can't
      // actually navigate to.
      return kind === "local-app"
        ? `<a href="${l.url}" title="${title}">${icon}${l.label}${cost}</a>`
        : `<a href="${l.url}" target="_blank" rel="noopener" title="${title}">${icon}${l.label}${cost}</a>`;
    })
    .join("");

  const stats = app.stats
    ? `<div class="stats">${app.stats.spoolCount} spools &middot; ${app.stats.remainingWeightKg} kg remaining</div>`
    : "";

  const icon = app.icon ? `<img class="icon" src="${app.icon}" alt="" />` : "";

  const isUp = app.status === "running" || app.status === "partial";
  const notCreated = app.status === "not-found" || app.status === "unknown";
  const powerButton = Array.isArray(app.containers)
    ? isUp
      ? `<button class="icon-button power-toggle stop" data-id="${app.id}" data-action="stop" title="Stop ${app.name}" aria-label="Stop ${app.name}">${ICONS.stop}</button>`
      : `<button class="icon-button power-toggle start" data-id="${app.id}" data-action="start" title="${notCreated ? "Container doesn't exist yet - run ./scripts/start.sh to create it" : "Start " + app.name}" aria-label="Start ${app.name}" ${notCreated ? "disabled" : ""}>${ICONS.play}</button>`
    : "";

  // Apps with neither `containers` nor `healthUrl` (a plain collection of
  // external links) have nothing for Mashghal to monitor, so the
  // status/check-now/monitoring UI - all meaningless for them - is skipped.
  const monitored = Array.isArray(app.containers) || Boolean(app.healthUrl);
  const footer = monitored
    ? `
    <div class="card-footer">
      <div class="status-text"><span class="dot"></span>${STATUS_LABELS[app.status] || app.status}</div>
      <div class="card-actions">
        ${powerButton}
        <button class="icon-button check-now" data-id="${app.id}" title="Check now" aria-label="Check ${app.name} now">${ICONS.refresh}</button>
        <button class="icon-button monitor-toggle" data-id="${app.id}" title="${isDisabled ? "Turn monitoring on" : "Turn monitoring off"}" aria-label="${isDisabled ? "Turn monitoring on for " + app.name : "Turn monitoring off for " + app.name}">${isDisabled ? ICONS.eyeOff : ICONS.eye}</button>
      </div>
    </div>`
    : "";

  return `
    <div class="card-header">
      ${icon}
      <h2>${app.name}</h2>
    </div>
    <p class="desc">${app.description}</p>
    ${stats}
    <div class="links">${links}</div>
    ${footer}
  `;
}

function render(apps) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  const disabledIds = getDisabledIds();

  for (const app of apps) {
    const displayApp = resolveDisplayApp(app);
    const card = document.createElement("div");
    card.className = displayApp.status ? `card status-${displayApp.status}` : "card";
    card.dataset.id = app.id;
    card.innerHTML = cardBody(displayApp, disabledIds.has(app.id));
    grid.appendChild(card);
  }
}

async function loadVersion() {
  try {
    const res = await fetch("/api/version");
    const { version } = await res.json();
    document.getElementById("version").textContent = `v${version}`;
  } catch (err) {
    console.error("Failed to load version", err);
  }
}

async function checkNow(id, button) {
  button.disabled = true;
  try {
    const res = await fetch(`/api/apps/${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const app = resolveDisplayApp(await res.json());
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;
    card.className = `card status-${app.status}`;
    card.innerHTML = cardBody(app, getDisabledIds().has(id));
  } catch (err) {
    console.error("Failed to check app status", err);
  } finally {
    button.disabled = false;
  }
}

async function powerToggle(id, action, button) {
  button.disabled = true;
  try {
    const res = await fetch(`/api/apps/${encodeURIComponent(id)}/${action}`, { method: "POST" });
    if (!res.ok) return;
    const app = resolveDisplayApp(await res.json());
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;
    card.className = `card status-${app.status}`;
    card.innerHTML = cardBody(app, getDisabledIds().has(id));
  } catch (err) {
    console.error(`Failed to ${action} app`, err);
  } finally {
    button.disabled = false;
  }
}

document.getElementById("grid").addEventListener("click", (e) => {
  const powerButton = e.target.closest(".power-toggle");
  if (powerButton) {
    if (powerButton.disabled) return;
    powerToggle(powerButton.dataset.id, powerButton.dataset.action, powerButton);
    return;
  }

  const checkButton = e.target.closest(".check-now");
  if (checkButton) {
    checkNow(checkButton.dataset.id, checkButton);
    return;
  }

  const toggleButton = e.target.closest(".monitor-toggle");
  if (toggleButton) {
    const disabledIds = getDisabledIds();
    const { id } = toggleButton.dataset;
    if (disabledIds.has(id)) {
      disabledIds.delete(id);
    } else {
      disabledIds.add(id);
    }
    setDisabledIds(disabledIds);
    loadApps();
  }
});

loadApps();
setInterval(loadApps, 60000 * 15);
loadVersion();
