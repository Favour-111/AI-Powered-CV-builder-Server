CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cvs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NULL,
  content JSONB NOT NULL,
  profile_image_url TEXT,
  show_profile_image BOOLEAN DEFAULT FALSE,
  template_id TEXT,
  label TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);