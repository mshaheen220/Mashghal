// Static registry of the workshop's apps. Entries backed by containers on
// this Docker host list the `containers` Mashghal inspects via the Docker
// socket; entries for devices elsewhere on the network (no local container
// to inspect) set `healthUrl` instead and are checked over plain HTTP.
module.exports = [
  {
    id: "chocolate-mold-factory",
    name: "Chocolate Mold Factory",
    description: "Design and generate custom chocolate mold STL files.",
    icon: "icons/chocolate-mold-factory.svg",
    links: [{ label: "Open", url: "http://localhost:3000" }],
    containers: ["chocolate-mold-factory-app-1"],
    tipsUrl: "http://localhost:3000/api/tips/",
  },
  {
    id: "griptab",
    name: "GripTab",
    description: "Turns a 3D model into a custom 3D-printable can-tab opener.",
    icon: "icons/griptab.svg",
    links: [{ label: "Open", url: "http://localhost:8002" }],
    containers: ["griptab-app-1"],
    tipsUrl: "http://localhost:8002/api/tips/",
  },
  {
    id: "platesmith",
    name: "Platesmith",
    description: "Turns an image into a stacked multi-color 3D print plate.",
    icon: "icons/platesmith.svg",
    links: [{ label: "Open", url: "http://localhost:8001" }],
    containers: ["platesmith-app-1"],
    // Unlike statsApiUrl, this is fetched directly by the browser (that
    // app's CORS is open to any localhost origin for exactly this), not by
    // the server - so it's the same localhost URL as `links`, not
    // host.docker.internal.
    tipsUrl: "http://localhost:8001/api/tips/",
  },
  {
    id: "spoolman",
    name: "Spoolman",
    description: "Filament inventory tracker for the 3D printer.",
    icon: "icons/spoolman.svg",
    links: [{ label: "Open", url: "http://localhost:18000" }],
    containers: ["spoolman-local"],
    // host.docker.internal (not localhost) because this is fetched from
    // inside the dashboard's own container, not from the browser.
    statsApiUrl: "http://host.docker.internal:18000",
     tipsUrl: "/api/local-tips/spoolman",
  },
  {
    id: "octoprint",
    name: "OctoPrint",
    description: "3D printer control and monitoring for the forge.",
    icon: "icons/octoprint.svg",
    links: [{ label: "Open", url: "http://theforge.local:5000/" }],
    healthUrl: "http://theforge.local:5000/",
    // OctoPrint itself has no tips API to point at (it's a device, not an
    // app in this codebase) - these tips live locally in
    // src/config/tips/octoprint.js and are served from Mashghal's own
    // backend instead, at a same-origin path the browser can just fetch.
    tipsUrl: "/api/local-tips/octoprint",
  },
  {
    id: "maker-links",
    name: "Maker Sites",
    description: "A collection of useful maker sites with models, etc.",
    icon: "icons/maker-links.svg",
    // Long, growing link lists read better as a full-width row than
    // squeezed into a single grid column alongside the app cards.
    fullWidth: true,
    links: [
      {
        label: "MakerWorld",
        url: "https://makerworld.com/en",
        description: "Bambu Lab's model repository, with maker-reward points for popular uploads.",
        category: ["models", "3d-printing"],
        cost: "free",
      },
      {
        label: "Creality Cloud",
        url: "https://www.crealitycloud.com/",
        description: "Creality's model hub, with browser-based slicing built in.",
        category: ["models", "3d-printing", "slicer"],
        cost: "free",
      },
      {
        label: "Thingiverse",
        url: "https://www.thingiverse.com/",
        description: "One of the oldest and largest 3D model repositories.",
        category: ["models", "3d-printing"],
        cost: "free",
      },
      {
        label: "Sketchfab",
        url: "https://sketchfab.com/",
        description: "3D model viewer and marketplace; browsing and most downloads are free.",
        category: ["models", "3d-printing"],
        cost: "free",
      },
      {
        label: "MyMiniFactory",
        url: "https://www.myminifactory.com/",
        description: "Curated model repository, mostly free with some paid premium designs.",
        category: ["models", "3d-printing"],
        cost: "free",
      },
      {
        label: "Cults3D",
        url: "https://cults3d.com/",
        description: "Model marketplace - a large share of listings are paid.",
        category: ["models", "3d-printing", "marketplace"],
        cost: "$",
      },
      {
        label: "Hugging Face",
        url: "https://huggingface.co/",
        description: "Hub for open ML models and datasets - useful for AI-assisted design tools.",
        category: ["ai-models", "datasets"],
        cost: "free",
      },
    ],
  },
  {
    id: "design-tools",
    name: "Design Tools",
    description: "Local apps for CAD, slicing, and vector design.",
    icon: "icons/design-tools.svg",
    // Long, growing link lists read better as a full-width row than
    // squeezed into a single grid column alongside the app cards.
    fullWidth: true,
    // mashghal-launch:// is a custom URL scheme handled entirely by the
    // browser/host, not by Mashghal's own server - which runs inside a
    // Docker container (see ../../Dockerfile) and so has no way to launch a
    // native app on the host directly. The scheme is registered by the
    // "Mashghal Launch" helper app; see scripts/install-launch-handler.sh.
    links: [
      {
        label: "OpenSCAD",
        url: "mashghal-launch://OpenSCAD",
        description: "Script-based parametric 3D CAD modeler.",
        category: ["cad"],
        cost: "free",
      },
      {
        label: "OrcaSlicer",
        url: "mashghal-launch://OrcaSlicer",
        description: "Open-source slicer for FDM printing.",
        category: ["slicer"],
        cost: "free",
      },
      {
        label: "Inkscape",
        url: "mashghal-launch://Inkscape",
        description: "Open-source vector graphics editor.",
        category: ["vector"],
        cost: "free",
      },
      {
        label: "Photopea",
        url: "https://www.photopea.com/",
        description: "Browser-based Photoshop-style raster editor.",
        category: ["raster"],
        cost: "free",
      },
      {
        label: "BumpMesh",
        url: "https://bumpmesh.com/",
        description: "Turns images into height/bump-mapped 3D meshes for lithophanes and reliefs.",
        category: ["mesh-generation", "3d-printing"],
        cost: "free",
      },
      {
        label: "Canva",
        url: "https://www.canva.com/",
        description: "Drag-and-drop graphic design tool; core features are free, Pro is a subscription.",
        category: ["vector", "raster"],
        cost: "$",
      },
      {
        label: "Blender",
        url: "mashghal-launch://Blender",
        description: "Full 3D modeling, sculpting, and rendering suite.",
        category: ["3d-modeling", "cad"],
        cost: "free",
      },
      {
        label: "Silhouette Studio",
        url: "mashghal-launch://Silhouette%20Studio",
        description: "Cutting-machine design software - SVG import needs the paid Designer Edition.",
        category: ["vector", "cutting"],
        cost: "$$",
      },
    ],
  },
];
