// Pulls a small inventory summary from Spoolman's REST API
// (https://donkie.github.io/Spoolman/) to show on its dashboard card.
async function fetchSpoolmanStats(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${baseUrl}/api/v1/spool`, { signal: controller.signal });
    if (!res.ok) return null;

    const spools = await res.json();
    const active = spools.filter((s) => !s.archived);
    const remainingWeightKg = active.reduce((sum, s) => sum + s.remaining_weight, 0) / 1000;

    return {
      spoolCount: active.length,
      remainingWeightKg: Math.round(remainingWeightKg * 10) / 10,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchSpoolmanStats };
