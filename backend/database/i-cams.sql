-- ============================================================
-- I-CAMS Database Schema
-- PostgreSQL 15+
-- ============================================================

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS lab_results CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS health_logs CASCADE;
DROP TABLE IF EXISTS patient_nurse_assignments CASCADE;
DROP TABLE IF EXISTS nurse_hospitals CASCADE;
DROP TABLE IF EXISTS doctor_hospitals CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS nurses CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ============================================================
-- TABLE: admin_users
-- ============================================================
CREATE TABLE admin_users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hashed
    full_name   VARCHAR(100) NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- INITIAL ADMIN (dulaj / dulaj123)
INSERT INTO admin_users (username, email, password, full_name)
VALUES (
    'dulaj',
    'admin@icams.lk',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator'
);

-- ============================================================
-- TABLE: hospitals
-- ============================================================
CREATE TABLE hospitals (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(100) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    address             TEXT NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    type                VARCHAR(50),             -- e.g., Public, Private
    specialties         TEXT[],                  -- Array of specialties
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: doctors
-- ============================================================
CREATE TABLE doctors (
    id                  SERIAL PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(100) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    license_number      VARCHAR(50) NOT NULL,
    specialization      VARCHAR(100) NOT NULL,
    years_of_experience INTEGER NOT NULL,
    institution_name    VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    license_document    VARCHAR(255), 
    hospital_ids        INTEGER[],               -- Kept for performance/simplicity as JSON/Array
    status              VARCHAR(30) DEFAULT 'pendingadminapproval',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: nurses
-- ============================================================
CREATE TABLE nurses (
    id                  SERIAL PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(100) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    license_number      VARCHAR(50) NOT NULL,
    qualification       VARCHAR(100) NOT NULL,
    years_of_experience INTEGER NOT NULL,
    institution_name    VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    license_document    VARCHAR(255), 
    hospital_ids        INTEGER[],
    status              VARCHAR(30) DEFAULT 'pendingadminapproval',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE patients (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    hospital_id     INTEGER REFERENCES hospitals(id) ON DELETE SET NULL, 
    doctor_id       INTEGER REFERENCES doctors(id) ON DELETE SET NULL, 
    status          VARCHAR(30) DEFAULT 'ACTIVE',
    condition       VARCHAR(50) DEFAULT 'stable', -- stable, monitoring, critical
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: patient_nurse_assignments (Care Team)
-- ============================================================
CREATE TABLE patient_nurse_assignments (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    nurse_id        INTEGER NOT NULL REFERENCES nurses(id) ON DELETE CASCADE,
    assigned_by     INTEGER NOT NULL REFERENCES doctors(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, nurse_id)
);

-- ============================================================
-- TABLE: health_logs
-- ============================================================
CREATE TABLE health_logs (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    systolic_bp     INTEGER NOT NULL,
    diastolic_bp    INTEGER NOT NULL,
    heart_rate      INTEGER NOT NULL,
    temperature     DECIMAL(4,2) NOT NULL,
    oxygen_level    INTEGER NOT NULL,
    mood            VARCHAR(20),
    symptoms        JSONB,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE appointments (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id       INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id     INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason          TEXT NOT NULL,
    status          VARCHAR(30) DEFAULT 'requested', -- requested, hospital_approved, confirmed, completed, cancelled
    doctor_notes    TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: lab_results
-- ============================================================
CREATE TABLE lab_results (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    hospital_id     INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id       INTEGER NOT NULL REFERENCES doctors(id) ON DELETE SET NULL,
    test_name       VARCHAR(100) NOT NULL,
    test_type       VARCHAR(50) NOT NULL, -- blood, scan, xray, etc.
    result_summary  TEXT,
    result_data     JSONB, -- detailed values (vitals, flags)
    file_url        VARCHAR(255), -- link to PDF/image
    status          VARCHAR(30) DEFAULT 'ready',
    collected_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE messages (
    id              SERIAL PRIMARY KEY,
    sender_id       INTEGER NOT NULL,
    sender_role     VARCHAR(20) NOT NULL,
    receiver_id     INTEGER NOT NULL,
    receiver_role   VARCHAR(20) NOT NULL,
    message_text    TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    user_role       VARCHAR(20) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(20) DEFAULT 'info',
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
