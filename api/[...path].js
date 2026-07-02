const app = require("../app");
const db = require("../db");

let schemaPromise;

function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = db.ensureSchema();
  }

  return schemaPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureSchema();
  } catch (err) {
    console.error("Warning: failed to ensure DB schema, continuing without blocking request:", err?.message || err);
    // Don't block the request on DB init errors so that health checks and static responses still work.
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error("Error handling request in Express app:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    // Ensure CORS-safe fallback headers in case middleware wasn't reached
    const origin = req.headers.origin || process.env.CLIENT_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
