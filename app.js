require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const cvRoutes = require("./routes/cv");

const app = express();

app.set("trust proxy", 1);

const clientOrigin = process.env.CLIENT_ORIGIN || true;

const corsOptions = {
  origin: clientOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
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
