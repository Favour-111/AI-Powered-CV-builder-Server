let app;
let db;
let schemaPromise;
const debugMode = process.env.DEBUG_ERRORS === "true";

async function loadDependencies() {
  if (!app || !db) {
    try {
      app = require("../app");
      db = require("../db");
    } catch (err) {
      console.error("Failed to load server dependencies:", err);
      throw err;
    }
  }
}

function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = db.ensureSchema();
  }

  return schemaPromise;
}

function respondWithError(res, status, message, err) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  const payload = { error: message };
  if (debugMode && err) {
    payload.details = err.message || String(err);
    payload.stack = err.stack;
  }

  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.end();
  }

  try {
    await loadDependencies();
  } catch (err) {
    return respondWithError(res, 500, "Server startup error", err);
  }

  try {
    await ensureSchema();
  } catch (err) {
    console.error("Warning: failed to ensure DB schema, continuing without blocking request:", err?.message || err);
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error("Error handling request in Express app:", err);
    return respondWithError(res, 500, "Internal Server Error", err);
  }
};
