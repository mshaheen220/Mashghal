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
  },
  {
    id: "platesmith",
    name: "Platesmith",
    description: "Turns an image into a stacked multi-color 3D print plate.",
    icon: "icons/platesmith.svg",
    links: [{ label: "Open", url: "http://localhost:8001" }],
    containers: ["platesmith-app-1"],
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
  },
  {
    id: "octoprint",
    name: "OctoPrint",
    description: "3D printer control and monitoring for the forge.",
    icon: "icons/octoprint.svg",
    links: [{ label: "Open", url: "http://theforge.local:5000/" }],
    healthUrl: "http://theforge.local:5000/",
  },
];
