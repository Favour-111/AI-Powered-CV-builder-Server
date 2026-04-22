const express = require("express");
const db = require("../db");
const { hashPassword, signToken, verifyPassword } = require("../auth");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  };
}

router.post("/register", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Account already exists" });
    }

    const result = await db.query(
      `INSERT INTO users (email, password, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, email, created_at`,
      [email, hashPassword(password)],
    );

    const user = result.rows[0];
    res.status(201).json({
      token: signToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await db.query(
      `SELECT id, email, password, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      token: signToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
