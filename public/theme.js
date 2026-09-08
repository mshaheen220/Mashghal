// Dark/light toggle. The actual [data-theme] attribute is set as early as
// possible by the inline script in index.html's <head> (to avoid a flash
// of the wrong theme); this just wires up the button and keeps it in
// sync, and persists a change for next time.

const THEME_KEY = "mashghal:theme";

const THEME_ICONS = {
  sun: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`,
};

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage unavailable (private browsing, etc) - preference just won't persist.
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  const next = theme === "light" ? "dark" : "light";
  button.innerHTML = theme === "light" ? THEME_ICONS.moon : THEME_ICONS.sun;
  button.title = `Switch to ${next} theme`;
  button.setAttribute("aria-label", `Switch to ${next} theme`);
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = getTheme() === "light" ? "dark" : "light";
  setStoredTheme(next);
  applyTheme(next);
});

applyTheme(getTheme());
