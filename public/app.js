const STATUS_LABELS = {
  running: "Online",
  partial: "Partially running",
  stopped: "Stopped",
  "not-found": "Not started",
  unknown: "Unknown",
};

async function loadApps() {
  try {
    const res = await fetch("/api/apps");
    const apps = await res.json();
    render(apps);
  } catch (err) {
    console.error("Failed to load app status", err);
  }
}

function render(apps) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (const app of apps) {
    const card = document.createElement("div");
    card.className = `card status-${app.status}`;

    const links = app.links
      .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label} &#8599;</a>`)
      .join("");

    card.innerHTML = `
      <div class="card-header">
        <span class="dot"></span>
        <h2>${app.name}</h2>
      </div>
      <p class="desc">${app.description}</p>
      <div class="links">${links}</div>
      <div class="status-text">${STATUS_LABELS[app.status] || app.status}</div>
    `;

    grid.appendChild(card);
  }
}

loadApps();
setInterval(loadApps, 60000);
