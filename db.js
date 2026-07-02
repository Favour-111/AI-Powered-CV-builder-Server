const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || null;
const poolConfig = {};
if (connectionString) {
  poolConfig.connectionString = connectionString;
}

// Enable SSL for providers (Render, Heroku, etc.) when appropriate.
// Defaults to enabling SSL in production or when DB_SSL=true or when the
// connection string contains sslmode=require.
const needsSSL =
  process.env.DB_SSL === "true" ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("sslmode=require")) ||
  process.env.NODE_ENV === "production";

if (needsSSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cvs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NULL REFERENCES users(id) ON DELETE CASCADE,
      content JSONB NOT NULL,
      profile_image_url TEXT,
      show_profile_image BOOLEAN DEFAULT FALSE,
      template_id TEXT,
      label TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(
    `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS template_id TEXT;`,
  );
  await pool.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS label TEXT;`);
}

module.exports = {
  ensureSchema,
  query: (text, params) => pool.query(text, params),
  pool,
};
