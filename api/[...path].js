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
  await ensureSchema();
  return app(req, res);
};
