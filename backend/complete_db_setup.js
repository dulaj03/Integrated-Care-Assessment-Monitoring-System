const pool = require('./config/db');

async function setup() {
  try {
    console.log('🛠️ Starting database synchronization...');

    // 1. Fix patients table (add profile fields)
    await pool.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'stable'");
    await pool.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_vital_check TIMESTAMP');
    await pool.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
    await pool.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER');
    await pool.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender VARCHAR(20)');
    await pool.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT');
    await pool.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)');
    
    // 2. Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id              SERIAL PRIMARY KEY,
        patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id       INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        hospital_id     INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        reason          TEXT NOT NULL,
        status          VARCHAR(30) DEFAULT 'requested',
        doctor_notes    TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create lab_results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_results (
        id              SERIAL PRIMARY KEY,
        patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        hospital_id     INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
        doctor_id       INTEGER NOT NULL REFERENCES doctors(id) ON DELETE SET NULL,
        nurse_id        INTEGER REFERENCES nurses(id) ON DELETE SET NULL,
        test_name       VARCHAR(100) NOT NULL,
        test_type       VARCHAR(50) NOT NULL,
        result_summary  TEXT,
        result_data     JSONB,
        file_url        VARCHAR(255),
        status          VARCHAR(30) DEFAULT 'ordered', -- ordered, processing, ready, reviewed
        collected_at    TIMESTAMP,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id              SERIAL PRIMARY KEY,
        sender_id       INTEGER NOT NULL,
        sender_role     VARCHAR(20) NOT NULL,
        receiver_id     INTEGER NOT NULL,
        receiver_role   VARCHAR(20) NOT NULL,
        message_text    TEXT NOT NULL,
        is_read         BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables synchronized successfully!');
  } catch (err) {
    console.error('❌ Synchronization failed:', err.message);
  } finally {
    process.exit();
  }
}
setup();
