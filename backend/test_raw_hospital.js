const pool = require('./config/db');

async function test() {
  try {
    const res = await pool.query(
      `INSERT INTO hospitals (name, email, password, registration_number, address, phone, type, specialties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['T', `t${Date.now()}@t.com`, 'p', 'r', 'a', 'p', 'P', JSON.stringify(['A'])]
    );
    console.log("SUCCESS");
  } catch (e) {
    console.error("FAIL:", e.message);
  } finally {
    process.exit();
  }
}
test();
