-- ============================================================
-- I-CAMS Database Schema
-- PostgreSQL 18
-- ============================================================


-- ============================================================
-- TABLE: admin_users
-- Stores admin portal login credentials
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

-- ============================================================
-- INITIAL DATA: admin_users
-- ============================================================
INSERT INTO admin_users (username, email, password, full_name)
VALUES (
    'dulaj',
    'admin@icams.lk',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator'
);

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE patients (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    hospital_id     VARCHAR(50), 
    doctor_id       VARCHAR(50), 
    status          VARCHAR(20) DEFAULT 'ACTIVE', -- Patients are active by default
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    status              VARCHAR(20) DEFAULT 'PENDING',
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
    status              VARCHAR(20) DEFAULT 'PENDING',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

