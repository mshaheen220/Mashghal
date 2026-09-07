const Docker = require("dockerode");

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock" });

// Inspects one container by name and reduces it to a simple status string.
// Missing containers (never started, or the sibling app was never brought
// up) are reported as "not-found" rather than treated as an error.
async function containerState(name) {
  try {
    const info = await docker.getContainer(name).inspect();
    if (info.State.Health) return info.State.Health.Status; // healthy | unhealthy | starting
    return info.State.Running ? "running" : info.State.Status; // exited, created, ...
  } catch (err) {
    if (err.statusCode === 404) return "not-found";
    return "unknown";
  }
}

const UP_STATES = new Set(["running", "healthy", "starting"]);

function summarize(states) {
  if (states.every((s) => s === "not-found")) return "not-found";
  if (states.every((s) => UP_STATES.has(s))) return "running";
  if (states.some((s) => UP_STATES.has(s))) return "partial";
  return "stopped";
}

// For apps that aren't containers on this Docker host (e.g. a device
// elsewhere on the LAN), fall back to a plain HTTP reachability check.
async function httpState(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(url, { signal: controller.signal });
    return "running";
  } catch {
    return "stopped";
  } finally {
    clearTimeout(timeout);
  }
}

async function statusFor(app) {
  if (app.containers) {
    const containerStates = await Promise.all(app.containers.map(containerState));
    return { ...app, containerStates, status: summarize(containerStates) };
  }

  const status = await httpState(app.healthUrl);
  return { ...app, containerStates: [status], status };
}

module.exports = { statusFor };
