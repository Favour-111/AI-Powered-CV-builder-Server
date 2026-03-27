const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const { OpenAI } = require("openai");
const db = require("../db");
const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({ storage });

function buildMasterPrompt({ cvData, mode }) {
  const mainPrompt = `You are an expert CV writer.
- Write like a human (not robotic)
- Use action verbs (Developed, Led, Built)
- Include measurable results where possible
- Avoid repetition

Adapt tone based on experience:
0–1 → student
2–5 → junior
5–10 → mid-level
10+ → senior

MODE: ${mode}

Given the following user CV payload, generate a filled CV in strict JSON, with every section not empty. If manual mode, refine existing text; do not invent falsities.

Input JSON:
${JSON.stringify(cvData, null, 2)}

Output JSON Schema exactly:
{
  "fullName": "",
  "title": "",
  "contact": { "email": "", "phone": "", "linkedin": "", "portfolio": "" },
  "summary": "",
  "skills": { "technical": [], "tools": [], "soft": [] },
  "experience": [{ "company": "", "role": "", "duration": "", "bullets": [] }],
  "projects": [{ "name": "", "description": "", "bullets": [] }],
  "education": [{ "school": "", "degree": "", "year": "" }],
  "extras": { "certifications": [], "awards": [], "languages": [] }
}`;
  return mainPrompt;
}

function safeParseJSON(input) {
  try {
    return JSON.parse(input);
  } catch {
    const match = input.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

router.post("/generate", upload.single("profileImage"), async (req, res) => {
  try {
    const cvData = req.body.cvData ? JSON.parse(req.body.cvData) : req.body;
    const mode = req.body.mode || "AI";

    if (req.file) {
      cvData.profileImage = `${req.protocol}://${req.get("host")}/${UPLOAD_DIR}/${req.file.filename}`;
    }

    const prompt = buildMasterPrompt({ cvData, mode });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1200,
      temperature: 0.8,
    });
    const text = response.choices?.[0]?.message?.content || "";

    const aiCv = safeParseJSON(text);
    if (!aiCv) {
      return res
        .status(500)
        .json({ error: "Failed to parse AI JSON output", raw: text });
    }

    const profileImageUrl = cvData.profileImage || null;
    const showProfileImage =
      req.body.showProfileImage === "true" ||
      req.body.showProfileImage === true;

    const insertSQL = `INSERT INTO cvs (user_id, content, profile_image_url, show_profile_image, created_at)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *`;
    const result = await db.query(insertSQL, [
      cvData.user_id || null,
      aiCv,
      profileImageUrl,
      showProfileImage,
    ]);

    res.json({
      cv: aiCv,
      profileImage: profileImageUrl,
      showProfileImage,
      savedCv: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/enhance", async (req, res) => {
  try {
    const { text, field } = req.body;
    const prompt = `Improve the following CV content in a human, professional tone. Do not add unsupported facts. Field: ${field || "general"} \n\nText:\n${text}`;
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // or "llama3-70b-8192"
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });
    const enhanced = response?.data?.choices[0]?.message?.content || "";
    res.json({ enhanced });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/analyze", async (req, res) => {
  const cv = req.body.cv;
  if (!cv) return res.status(400).json({ error: "cv required" });

  let score = 50;
  if (cv.summary?.length > 80) score += 15;
  score += (cv.experience?.length || 0) * 5;
  score += (cv.projects?.length || 0) * 4;
  score += (cv.skills?.technical?.length || 0) * 2;
  score = Math.min(100, score);
  res.json({ score, strengths: ["Clear sections", "Structured JSON"] });
});

module.exports = router;
