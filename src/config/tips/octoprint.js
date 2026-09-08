// OctoPrint has no tips API of its own (it's a device on the network, not
// an app in this workshop's codebase) - these are stored locally instead
// and served from Mashghal's own backend. Grouped around the project
// types the forge actually prints: lightboxes, chocolate mold positives,
// keychains, and Christmas ornaments, plus general printer operation.
module.exports = [
  // --- Lightboxes ---
  {
    category: "lightboxes",
    text: "Large flat lightbox plates are the classic warping candidate — use OctoPrint's webcam feed to watch the first few layers for corner lift before walking away.",
  },
  {
    category: "lightboxes",
    text: "Set up a pause-at-height script (or the Pause at Height plugin) for filament swaps on multi-layer lightbox prints, so a swap point never gets missed while you're not standing at the printer.",
  },
  {
    category: "lightboxes",
    text: "A big flat lightbox base has a lot of surface touching the bed — bump adhesion (glue stick, hairspray, or a textured PEI sheet) before a print you can't babysit start to finish.",
  },
  {
    category: "lightboxes",
    text: "Time-lapse a lightbox print in OctoPrint — a vertical shot works well for a foreshortened flat plate, and it's a nice preview clip for a piece someone's waiting on.",
  },

  // --- Chocolate mold positives ---
  {
    category: "chocolate-molds",
    text: "Mold positives are surface-finish-sensitive — every printed layer line telegraphs into the silicone mold and then into the chocolate. Slow the outer perimeter speed for these specifically.",
  },
  {
    category: "chocolate-molds",
    text: "Print mold positives in a distinct filament color from everyday prints so OctoPrint's file list stays easy to scan for 'is this the mold master or a keeper piece.'",
  },
  {
    category: "chocolate-molds",
    text: "If you're printing in PETG or ABS for extra heat resistance during the silicone cure, update OctoPrint's temperature presets for that filament before queuing — don't reuse a PLA profile by habit.",
  },
  {
    category: "chocolate-molds",
    text: "Small vented details on a mold positive are easy to lose on a quick monitoring glance — zoom OctoPrint's webcam (or use a close-focus lens) if you're checking fine detail remotely.",
  },

  // --- Keychains ---
  {
    category: "keychains",
    text: "Keychains are small enough to batch — queue a full-plate job in OctoPrint and let one print run do a dozen at once instead of babysitting individual short prints.",
  },
  {
    category: "keychains",
    text: "For a big flat plate of many keychains, uneven bed mesh becomes obvious fast — run a fresh bed level before queuing a full plate, not just before the first print of the day.",
  },
  {
    category: "keychains",
    text: "OctoPrint's estimated time remaining is rough on a first pass with an unfamiliar keychain design — check back around 50% actual elapsed rather than trusting the early estimate.",
  },
  {
    category: "keychains",
    text: "Small parts can be knocked loose by a moving gantry if they detach mid-print — keep an eye on the first layer via webcam, since a lost keychain early on rarely finishes cleanly.",
  },

  // --- Christmas ornaments ---
  {
    category: "ornaments",
    text: "Ornaments are classic gift-deadline prints — start seasonal batches well before you need them. A failed overnight print two days before a gift exchange is a bad surprise.",
  },
  {
    category: "ornaments",
    text: "If a design needs a thin hanger loop or eyelet, watch that specific feature on the webcam during its layer — thin loops are the most likely failure point on an otherwise fine print.",
  },
  {
    category: "ornaments",
    text: "Group similar-sized ornaments onto one plate and let OctoPrint queue them back-to-back overnight — small items add up to real downtime between manual restarts if you don't batch them.",
  },
  {
    category: "ornaments",
    text: "Metallic or glitter PLA is more abrasive than standard filament — watch extrusion consistency in the webcam feed, since a worn nozzle shows up as gradually thinner extrusion.",
  },

  // --- General OctoPrint operation ---
  {
    category: "octoprint",
    text: "Set up failure detection (Spaghetti Detective or similar) once and it quietly covers every project type above — no reason to only add it after a wasted overnight print.",
  },
  {
    category: "octoprint",
    text: "Keep the plugin list lean — each active plugin is one more thing that can conflict after an update. Audit it occasionally rather than installing and forgetting.",
  },
  {
    category: "octoprint",
    text: "A cheap PSU/relay controlled through OctoPrint (PSU Control plugin) means you can walk away from a finished print without leaving the printer powered and idle for hours.",
  },
  {
    category: "octoprint",
    text: "Back up OctoPrint's settings and plugin list before a Raspberry Pi SD card ages out — a corrupted card resetting everything mid-project is more disruptive than losing a single print.",
  },
];
