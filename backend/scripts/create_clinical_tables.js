/**
 * Migration: Create missing clinical tables
 * Tables: clinical_orders, clinical_notes, nurse_reports, health_logs
 */
require('dotenv').config();
const pool = require('../config/db');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_logs (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        systolic_bp INTEGER,
        diastolic_bp INTEGER,
        heart_rate INTEGER,
        temperature DECIMAL(4,1),
        oxygen_level INTEGER,
        mood VARCHAR(20) DEFAULT 'good',
        symptoms JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ health_logs table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinical_orders (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        order_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        details TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ clinical_orders table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinical_notes (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        assessment TEXT NOT NULL,
        plan TEXT,
        request_to_nurse TEXT,
        nurse_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ clinical_notes table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS nurse_reports (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        nurse_id INTEGER NOT NULL,
        title VARCHAR(200) DEFAULT 'Shift Report',
        summary TEXT NOT NULL,
        recommendations TEXT,
        steps JSONB DEFAULT '[]',
        vitals_snapshot JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ nurse_reports table ready');

    console.log('\n🎉 All clinical tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
