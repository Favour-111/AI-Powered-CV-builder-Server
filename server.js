require("dotenv").config();
const db = require("./db");
const app = require("./app");
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await db.ensureSchema();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database schema", error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
