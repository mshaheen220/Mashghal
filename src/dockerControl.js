const docker = require("./dockerClient");

// Starts/stops an already-created container by name. This only works on
// containers that exist (i.e. `docker compose up` has been run for that
// app at least once) - it can't create one from scratch, since that needs
// that app's own compose file and build context, which Mashghal doesn't
// have access to. Use ./scripts/start.sh for that case instead.
async function startContainer(name) {
  try {
    await docker.getContainer(name).start();
  } catch (err) {
    if (err.statusCode === 304) return; // already running
    throw err;
  }
}

async function stopContainer(name) {
  try {
    await docker.getContainer(name).stop();
  } catch (err) {
    if (err.statusCode === 304) return; // already stopped
    if (err.statusCode === 404) return; // nothing to stop
    throw err;
  }
}

async function startApp(appConfig) {
  await Promise.all(appConfig.containers.map(startContainer));
}

async function stopApp(appConfig) {
  await Promise.all(appConfig.containers.map(stopContainer));
}

module.exports = { startApp, stopApp };
