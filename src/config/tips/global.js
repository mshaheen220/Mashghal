// Tips not tied to any single app - general practice across the whole
// crafting/printing workshop (materials, file organization, safety,
// production workflow). Shown in the rotating bar under the "Mashghal"
// source rather than any one app.
module.exports = [
  // --- Materials ---
  {
    category: "materials",
    text: "A PLA printed positive is not food-safe on its own — for chocolate work, it should only ever be a mold master for casting food-grade silicone, never a mold you pour chocolate into directly.",
  },
  {
    category: "materials",
    text: "Store filament in sealed containers with desiccant, especially PETG and nylon-adjacent materials — humidity shows up as stringing and pockmarked surfaces well before it's obvious from touch.",
  },
  {
    category: "materials",
    text: "Keep a small swatch/spool-end library of every color and material you've used — matching a repeat order to the exact original filament is much easier with a physical reference than a screen color guess.",
  },
  {
    category: "materials",
    text: "Different filament brands calibrate slightly differently even at the 'same' nominal temperature — when you switch brands for a color you print often, expect to re-tune before trusting the first result.",
  },

  // --- Organization ---
  {
    category: "organization",
    text: "Keep one folder per product line (lightboxes, molds, keychains, ornaments) with a consistent version suffix — 'which file is the one I actually printed and shipped' is the question you'll ask most often.",
  },
  {
    category: "organization",
    text: "Name exported files with a date or version number, not just the product name — 'ornament-star-v3-final-FINAL' is a signal you needed this system two versions ago.",
  },
  {
    category: "organization",
    text: "If a design gets a one-off tweak for a particular order, save it as a new version rather than overwriting the original — you'll likely want the original again for the next order.",
  },

  // --- Safety ---
  {
    category: "safety",
    text: "Resin, solvents, and mold-release agents used across these projects want real ventilation — a small fan pointed out a window is a low-effort habit that pays off over hundreds of prints.",
  },
  {
    category: "safety",
    text: "A print running unattended overnight is common in this kind of batch work — a smoke detector near the printer and a non-flammable surface underneath it are worth the five minutes to set up once.",
  },

  // --- Production ---
  {
    category: "production",
    text: "Before committing to a batch run of any product, print one full-scale test piece first — scaling errors and fit issues are far cheaper to catch on a single part than across a plate of twelve.",
  },
  {
    category: "production",
    text: "Track how long each product actually takes start-to-finish (print + post-process + packaging), not just print time — post-processing is usually where a 'quick' product quietly stops being quick.",
  },
  {
    category: "production",
    text: "When a product line is popular enough to reorder, keep the exact print settings, not just the file — nozzle temp, speed, and support settings drift between print sessions unless you write them down.",
  },
  {
    category: "production",
    text: "For anything gifted or sold, a small consistent packaging/finishing pass (deburring, cleaning stray strings, a repeatable presentation) reads as far more polished than the print quality difference alone would suggest.",
  },
];
