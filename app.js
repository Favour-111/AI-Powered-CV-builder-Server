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
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadDir =
  process.env.UPLOAD_DIR || (process.env.VERCEL ? "/tmp/uploads" : "uploads");

app.use("/api/uploads", express.static(path.resolve(uploadDir)));
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AI CV Builder Backend is running." });
});

module.exports = app;
