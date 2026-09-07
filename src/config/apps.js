// Static registry of the workshop's apps. Entries backed by containers on
// this Docker host list the `containers` Mashghal inspects via the Docker
// socket; entries for devices elsewhere on the network (no local container
// to inspect) set `healthUrl` instead and are checked over plain HTTP.
module.exports = [
  {
    id: "chocolate-mold-factory",
    name: "Chocolate Mold Factory",
    description: "Design and generate custom chocolate mold STL files.",
    links: [{ label: "Open", url: "http://localhost:3000" }],
    containers: ["chocolate-mold-factory-app-1"],
  },
  {
    id: "platesmith",
    name: "Platesmith",
    description: "Turns an image into a stacked multi-color 3D print plate.",
    links: [{ label: "Open", url: "http://localhost:8001" }],
    containers: ["platesmith-app-1"],
  },
  {
    id: "spoolman",
    name: "Spoolman",
    description: "Filament inventory tracker for the 3D printer.",
    links: [{ label: "Open", url: "http://localhost:18000" }],
    containers: ["spoolman-local"],
  },
  {
    id: "octoprint",
    name: "OctoPrint",
    description: "3D printer control and monitoring for the forge.",
    links: [{ label: "Open", url: "http://theforge.local:5000/" }],
    healthUrl: "http://theforge.local:5000/",
  },
];
