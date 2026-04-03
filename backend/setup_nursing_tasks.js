const pool = require('./config/db');

async function setupNursingTasks() {
    try {
        console.log("🛠️  Setting up Nursing Rounds & Task Management...");

        // 1. Nursing Tasks Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nursing_tasks (
                id              SERIAL PRIMARY KEY,
                title           VARCHAR(100) NOT NULL,
                task_type       VARCHAR(50), -- Scan, Medication, Wound Care, Discharge
                patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                nurse_id        INTEGER NOT NULL REFERENCES nurses(id) ON DELETE CASCADE,
                doctor_id       INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
                hospital_id     INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
                status          VARCHAR(30) DEFAULT 'pending', -- pending, in_progress, completed
                current_step    INTEGER DEFAULT 0,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Nursing Task Steps (Milestones)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nursing_task_steps (
                id              SERIAL PRIMARY KEY,
                task_id         INTEGER NOT NULL REFERENCES nursing_tasks(id) ON DELETE CASCADE,
                step_name       VARCHAR(100) NOT NULL,
                status          VARCHAR(30) DEFAULT 'pending', -- pending, completed
                completed_at    TIMESTAMP,
                notes           TEXT,
                sort_order      INTEGER NOT NULL
            )
        `);

        console.log("✅ Nursing Rounds schema synchronized successfully!");
    } catch (err) {
        console.error("❌ Schema sync failed:", err.message);
    } finally {
        process.exit();
    }
}

setupNursingTasks();
