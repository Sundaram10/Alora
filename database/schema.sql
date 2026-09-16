-- ==========================================================
-- ALORA: Smart Campus Complaint Intelligence & Management Platform
-- Database: MySQL (alora_db)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS alora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alora_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    contact_email VARCHAR(150),
    head_name VARCHAR(100),
    sla_target_hours INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT', -- STUDENT, FACULTY, ADMIN, TECHNICIAN
    department_id BIGINT NULL,
    phone_number VARCHAR(20),
    campus_unit VARCHAR(100), -- e.g., 'Hostel Block A', 'Computer Science Dept'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location_building VARCHAR(100) NOT NULL,
    location_floor VARCHAR(50),
    location_room VARCHAR(50),
    category VARCHAR(80), -- Electrical, Plumbing, IT & Network, HVAC, Carpentry, Sanitation, Infrastructure
    department_id BIGINT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, AI_TRIAGED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    assigned_technician_id BIGINT NULL,
    estimated_resolution_hours DOUBLE DEFAULT 12.0,
    actual_resolution_hours DOUBLE NULL,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of_id BIGINT NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_technician FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_duplicate FOREIGN KEY (duplicate_of_id) REFERENCES complaints(id) ON DELETE SET NULL,
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_category (category),
    INDEX idx_complaints_created_at (created_at)
);

-- 4. ML Predictions & Triage History
CREATE TABLE IF NOT EXISTS ml_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    predicted_category VARCHAR(80) NOT NULL,
    category_confidence DOUBLE NOT NULL,
    predicted_department VARCHAR(100) NOT NULL,
    department_confidence DOUBLE NOT NULL,
    predicted_severity VARCHAR(20) NOT NULL,
    severity_confidence DOUBLE NOT NULL,
    predicted_resolution_hours DOUBLE NOT NULL,
    is_duplicate_flag BOOLEAN DEFAULT FALSE,
    duplicate_similarity_score DOUBLE DEFAULT 0.0,
    matched_complaint_id BIGINT NULL,
    action_recommendations JSON NULL,
    raw_response JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ml_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 5. User Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    satisfaction_level VARCHAR(30), -- VERY_SATISFIED, SATISFIED, NEUTRAL, DISSATISFIED
    is_used_for_training BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Audit & Status Logs
CREATE TABLE IF NOT EXISTS complaint_status_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    changed_by_user_id BIGINT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    note VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_logs_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
