const pool = require('./config/db');

async function fix() {
  try {
    console.log("Adding missing columns...");
    await pool.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'stable'");
    console.log("Success!");
  } catch (e) {
    console.error("Fix Error:", e.message);
  } finally {
    process.exit();
  }
}
fix();
