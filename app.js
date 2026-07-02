require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const cvRoutes = require("./routes/cv");

const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

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
