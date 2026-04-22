const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const { OpenAI } = require("openai");
const db = require("../db");
const Groq = require("groq-sdk");
const { optionalAuth, requireAuth } = require("../middleware/auth");

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

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

function normalizeArray(values) {
  return (values || []).filter(Boolean);
}

function buildMasterPrompt({ cvData, mode, selectedTemplate }) {
  const mainPrompt = `You are an expert CV writer.
- Write like a human (not robotic)
- Use action verbs (Developed, Led, Built)
- Include measurable results where possible
- Avoid repetition
- Use only information supported by the input
- If data is sparse, infer structure and wording quality, not fake employers, schools, or awards
- Prefer ATS-friendly wording with concise, high-value bullets

Adapt tone based on experience:
0–1 → student
2–5 → junior
5–10 → mid-level
10+ → senior

MODE: ${mode}
SELECTED_TEMPLATE: ${selectedTemplate || "classic-serif"}

Given the following user CV payload, generate a filled CV in strict JSON, with every section not empty. If manual mode, refine existing text; do not invent falsities.

Instructions for better quality:
- Convert free-text notes into polished experience, project, education, and skills sections.
- Highlight domain keywords, tools, certifications, and quantified impact when the input supports them.
- If achievements are provided, turn them into bullet points with business value.
- Use the target role, years of experience, industry focus, and tone preferences when present.
- Keep contact details exact.

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

function buildSavedCvResponse(row) {
  return {
    id: row.id,
    cv: row.content,
    profileImage: row.profile_image_url,
    showProfileImage: row.show_profile_image,
    selectedTemplate: row.template_id,
    label: row.label,
    createdAt: row.created_at,
  };
}

router.post(
  "/generate",
  optionalAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const cvData = req.body.cvData ? JSON.parse(req.body.cvData) : req.body;
      const mode = req.body.mode || "AI";
      const selectedTemplate = req.body.selectedTemplate || null;
      const userId = req.user?.id || cvData.user_id || null;
      const cvLabel =
        req.body.cvLabel ||
        cvData.title ||
        `${cvData.fullName || "Untitled"} CV`;

      if (req.file) {
        cvData.profileImage = `${req.protocol}://${req.get("host")}/${UPLOAD_DIR}/${req.file.filename}`;
      }

      let aiCv;
      if (mode === "Manual") {
        aiCv = { ...cvData };
        delete aiCv.profileImage;
        delete aiCv.profileImagePreview;
        delete aiCv.showProfileImage;
      } else {
        const prompt = buildMasterPrompt({ cvData, mode, selectedTemplate });
        const groq = getGroqClient();

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

        aiCv = safeParseJSON(text);
        if (!aiCv) {
          return res
            .status(500)
            .json({ error: "Failed to parse AI JSON output", raw: text });
        }
      }

      const profileImageUrl = cvData.profileImage || null;
      const showProfileImage =
        req.body.showProfileImage === "true" ||
        req.body.showProfileImage === true;

      aiCv.skills = {
        technical: normalizeArray(aiCv.skills?.technical),
        tools: normalizeArray(aiCv.skills?.tools),
        soft: normalizeArray(aiCv.skills?.soft),
      };
      aiCv.experience = normalizeArray(aiCv.experience);
      aiCv.projects = normalizeArray(aiCv.projects);
      aiCv.education = normalizeArray(aiCv.education);
      aiCv.extras = {
        certifications: normalizeArray(aiCv.extras?.certifications),
        awards: normalizeArray(aiCv.extras?.awards),
        languages: normalizeArray(aiCv.extras?.languages),
      };

      const insertSQL = `INSERT INTO cvs (
        user_id,
        content,
        profile_image_url,
        show_profile_image,
        template_id,
        label,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;
      const result = await db.query(insertSQL, [
        userId,
        aiCv,
        profileImageUrl,
        showProfileImage,
        selectedTemplate,
        cvLabel,
      ]);

      res.json({
        cv: aiCv,
        profileImage: profileImageUrl,
        showProfileImage,
        selectedTemplate,
        savedCv: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

router.post("/enhance", async (req, res) => {
  try {
    const { text, field } = req.body;
    const prompt = `Improve the following CV content in a human, professional tone. Do not add unsupported facts. Field: ${field || "general"} \n\nText:\n${text}`;
    const groq = getGroqClient();
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

router.post("/save", requireAuth, async (req, res) => {
  try {
    const cv = req.body.cv;
    const selectedTemplate = req.body.selectedTemplate || null;
    const profileImageUrl = req.body.profileImage || null;
    const showProfileImage = Boolean(req.body.showProfileImage);
    const label =
      req.body.label ||
      req.body.cv?.title ||
      `${req.body.cv?.fullName || "Untitled"} CV`;

    if (!cv) {
      return res.status(400).json({ error: "cv is required" });
    }

    const result = await db.query(
      `INSERT INTO cvs (
        user_id,
        content,
        profile_image_url,
        show_profile_image,
        template_id,
        label,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [
        req.user.id,
        cv,
        profileImageUrl,
        showProfileImage,
        selectedTemplate,
        label,
      ],
    );

    res.status(201).json({ savedCv: buildSavedCvResponse(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/saved", requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, content, profile_image_url, show_profile_image, template_id, label, created_at
       FROM cvs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    res.json({ cvs: result.rows.map(buildSavedCvResponse) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/saved/:id", requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, content, profile_image_url, show_profile_image, template_id, label, created_at
       FROM cvs
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Saved CV not found" });
    }

    res.json({ savedCv: buildSavedCvResponse(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/saved/:id", requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM cvs
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Saved CV not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
