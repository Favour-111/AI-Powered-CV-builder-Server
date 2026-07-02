require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const cvRoutes = require("./routes/cv");

const app = express();

app.set("trust proxy", 1);

const clientOriginEnv = process.env.CLIENT_ORIGIN || "";
const allowedOrigins = clientOriginEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    return res.status(403).json({ error: `Origin ${origin} not allowed by CORS` });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,Accept",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadDir =
  process.env.UPLOAD_DIR || (process.env.VERCEL ? "/tmp/uploads" : "uploads");

app.use("/api/uploads", express.static(path.resolve(uploadDir)));
// Mount routes both with and without the `/api` prefix to be compatible with different deployments
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/cv", cvRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AI CV Builder Backend is running." });
});

module.exports = app;
