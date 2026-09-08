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
};

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
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label} &#8599;</a>`)
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

  return `
    <div class="card-header">
      ${icon}
      <h2>${app.name}</h2>
    </div>
    <p class="desc">${app.description}</p>
    ${stats}
    <div class="links">${links}</div>
    <div class="card-footer">
      <div class="status-text"><span class="dot"></span>${STATUS_LABELS[app.status] || app.status}</div>
      <div class="card-actions">
        ${powerButton}
        <button class="icon-button check-now" data-id="${app.id}" title="Check now" aria-label="Check ${app.name} now">${ICONS.refresh}</button>
        <button class="icon-button monitor-toggle" data-id="${app.id}" title="${isDisabled ? "Turn monitoring on" : "Turn monitoring off"}" aria-label="${isDisabled ? "Turn monitoring on for " + app.name : "Turn monitoring off for " + app.name}">${isDisabled ? ICONS.eyeOff : ICONS.eye}</button>
      </div>
    </div>
  `;
}

function render(apps) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  const disabledIds = getDisabledIds();

  for (const app of apps) {
    const displayApp = resolveDisplayApp(app);
    const card = document.createElement("div");
    card.className = `card status-${displayApp.status}`;
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
