const Docker = require("dockerode");

module.exports = new Docker({ socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock" });
