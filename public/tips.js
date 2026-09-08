// Rotating tips bar, aggregating each app's own /api/tips endpoint (they
// stay opaque data sources - Mashghal doesn't know or assume their
// category vocabulary). Mirrors platesmith's own tips panel
// (client/src/tips.ts + TipsPanel.tsx): tour every tip once in a shuffled
// order before reshuffling, rather than picking randomly with replacement.

const TIPS_AUTOPLAY_INTERVAL_MS = 9000;

const TIP_ICONS = {
  chevronLeft: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  bulb: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z"/></svg>`,
};

// Tip text/category/app name can come from another app's API, not just
// this one's own config, so it goes through here before landing in
// innerHTML or an attribute (the title="..." below in particular would
// otherwise let a stray `"` in a tip's text break out of the attribute).
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Category is an opaque, per-app string (see the file header) - rather
// than maintain a color lookup that'd need updating every time an app
// adds a new one, derive a stable hue straight from the string itself, so
// any category from any app gets a consistent, distinct-ish color for
// free. Not cryptographic - just needs to spread strings across the
// color wheel and stay the same across renders/reloads for a given name.
function hueForCategory(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash << 5) - hash + category.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

// Fisher-Yates shuffle of [0, length) - tours every tip exactly once in a
// random order before repeating, instead of picking randomly with
// replacement (which can stall on a few tips and never reach others).
function shuffleIndices(length) {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

let allTips = [];
let order = [];
let position = 0;
let autoplay = true;
let isOpen = true;
let timer = null;

async function loadTips() {
  try {
    const res = await fetch("/api/tip-sources");
    const sources = await res.json();

    const perSource = await Promise.all(
      sources.map(async (source) => {
        try {
          const r = await fetch(source.tipsUrl);
          if (!r.ok) return [];
          const data = await r.json();
          return (data.tips || []).map((tip) => ({
            ...tip,
            appId: source.id,
            appName: source.name,
            appIcon: source.icon,
          }));
        } catch (err) {
          console.error(`Failed to load tips from ${source.name}`, err);
          return [];
        }
      })
    );

    allTips = perSource.flat();
    order = shuffleIndices(allTips.length);
    position = 0;
    renderTips();
    restartAutoplay();
  } catch (err) {
    console.error("Failed to load tip sources", err);
  }
}

function goNext() {
  position += 1;
  if (position >= order.length) {
    // Full tour complete - reshuffle for the next lap rather than looping
    // the same order, so it doesn't feel mechanically repetitive.
    order = shuffleIndices(allTips.length);
    position = 0;
  }
  renderTips();
}

function goPrev() {
  position = (position - 1 + order.length) % order.length;
  renderTips();
}

function stopAutoplay() {
  if (timer) clearInterval(timer);
  timer = null;
}

function restartAutoplay() {
  stopAutoplay();
  if (!autoplay || !isOpen || allTips.length === 0) return;
  timer = setInterval(goNext, TIPS_AUTOPLAY_INTERVAL_MS);
}

function renderTips() {
  const container = document.getElementById("tips");
  if (!container) return;

  if (allTips.length === 0) {
    container.innerHTML = "";
    return;
  }

  if (!isOpen) {
    container.innerHTML = `<button id="tips-open" class="tips-collapsed">${TIP_ICONS.bulb} Tips</button>`;
    return;
  }

  const tip = allTips[order[position]];
  const icon = tip.appIcon ? `<img class="tips-app-icon" src="${escapeHtml(tip.appIcon)}" alt="" />` : "";
  const appName = escapeHtml(tip.appName);
  const category = escapeHtml(tip.category);
  const text = escapeHtml(tip.text);
  const categoryHue = hueForCategory(tip.category);

  container.innerHTML = `
    <div class="tips-bar">
      <div class="tips-source" title="${appName}">
        <div class="tips-source-top">
          ${icon}
          <span class="tips-app-name">${appName}</span>
        </div>
        <span class="tips-category" style="--cat-hue: ${categoryHue}">${category}</span>
      </div>
      <div class="tips-text-wrap">
        <p class="tips-text" title="${text}">${text}</p>
      </div>
      <div class="tips-controls">
        <button id="tips-prev" aria-label="Previous tip">${TIP_ICONS.chevronLeft}</button>
        <button id="tips-next" aria-label="Next tip">${TIP_ICONS.chevronRight}</button>
        <button id="tips-autoplay" aria-pressed="${autoplay}" title="${autoplay ? "Stop autoplay" : "Autoplay through tips"}">${
          autoplay ? TIP_ICONS.pause : TIP_ICONS.play
        }</button>
        <button id="tips-close" aria-label="Collapse tips">${TIP_ICONS.close}</button>
      </div>
    </div>
  `;
}

document.getElementById("tips").addEventListener("click", (e) => {
  if (e.target.closest("#tips-open")) {
    isOpen = true;
    renderTips();
    restartAutoplay();
  } else if (e.target.closest("#tips-close")) {
    isOpen = false;
    renderTips();
    stopAutoplay();
  } else if (e.target.closest("#tips-prev")) {
    goPrev();
  } else if (e.target.closest("#tips-next")) {
    goNext();
  } else if (e.target.closest("#tips-autoplay")) {
    autoplay = !autoplay;
    renderTips();
    restartAutoplay();
  }
});

loadTips();
