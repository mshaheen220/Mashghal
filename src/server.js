const express = require("express");
const path = require("path");
const apps = require("./config/apps");
const { statusFor } = require("./dockerStatus");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/apps", async (_req, res) => {
  const results = await Promise.all(apps.map(statusFor));
  res.json(results);
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Mashghal dashboard listening on http://localhost:${PORT}`);
});
