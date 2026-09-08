module.exports = [
  {
    "category": "inventory",
    "text": "Weigh every empty spool (tare weight) as soon as you finish one and log it under the vendor profile — accurate net remaining calculations depend entirely on a precise spool tare."
  },
  {
    "category": "inventory",
    "text": "Weigh newly unboxed spools before the first print and record the gross weight in the notes or initial field to instantly verify manufacturer fill consistency and catch underfilled rolls early."
  },
  {
    "category": "labels & tracking",
    "text": "Use Spoolman's built-in label designer to print compact QR labels with the Spool ID directly onto the spool flange so you can quickly scan and select it from your phone or mobile browser."
  },
  {
    "category": "labels & tracking",
    "text": "If you use reusable spool masters or swap cardboard spool cores, attach your QR label to a removable tag or clip rather than the permanent flange to avoid identifier collisions."
  },
  {
    "category": "workflow & integration",
    "text": "Link Spoolman directly to your print server (OctoPrint, Moonraker/Mainsail/Fluidd) so active spool usage decrements automatically as prints finish without requiring manual math."
  },
  {
    "category": "workflow & integration",
    "text": "Set up a default spool selection check in your print start macro or slicer pre-print routine so jobs pause or alert if no active spool is selected in the server."
  },
  {
    "category": "storage & locations",
    "text": "Use the 'Location' field strictly for distinct physical zones (e.g., 'Drybox 1', 'Shelf B', 'Active AMS/Toolhead') so you can drag-and-drop spools across cards in the dashboard view as you move them."
  },
  {
    "category": "storage & locations",
    "text": "Add a custom field for 'First Opened Date' or 'Last Dried Date' to prioritize hygroscopic filaments like PETG, TPU, and nylon before moisture affects print quality."
  },
  {
    "category": "database & maintenance",
    "text": "Check the community SpoolmanDB before manually entering filament specs to automatically pull verified manufacturer density, spool weight, and recommended print temperatures."
  },
  {
    "category": "database & maintenance",
    "text": "Archive or mark depleted spools as archived rather than deleting them immediately so historical print logs, past project filament tracking, and usage metrics stay intact."
  },
  {
    "category": "multi-material",
    "text": "When running multi-color prints or filament swaps, assign each active slot or toolhead to its respective Spoolman ID before starting to prevent cross-deducting filament from the wrong spool."
  },
  {
    "category": "slicer integration",
    "text": "Sync your Spoolman inventory directly to OrcaSlicer using spoolman2slicer (`spoolman2slicer -s orcaslicer -u http://localhost:7912 -d ~/Library/Application\\ Support/OrcaSlicer/user/default/filament/`) to automatically generate matching slicer filament presets."
  },
  {
    "category": "slicer integration",
    "text": "Automate or alias your spoolman2slicer CLI command so your slicer filament presets update whenever you add new spools, keeping flow rates, temps, and color swatches aligned with inventory."
  }
];