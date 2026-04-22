require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const authRoutes = require("./routes/auth");
const cvRoutes = require("./routes/cv");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")),
);
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);

app.get("/", (req, res) => {
  res.send({ message: "AI CV Builder Backend is running." });
});

db.ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database schema", error);
    process.exit(1);
  });
