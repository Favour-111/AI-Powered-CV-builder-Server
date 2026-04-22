const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
