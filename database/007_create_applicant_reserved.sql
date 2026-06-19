CREATE TABLE IF NOT EXISTS applicant_reserved (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    status_reserved VARCHAR(50) NOT NULL DEFAULT 'Reserved',
    reserved_date DATE NULL,
    job_order_number VARCHAR(50) NULL,
    job_order_date DATE NULL,
    job_position VARCHAR(100) NULL,
    required_count INT NULL,
    company_name VARCHAR(150) NULL,
    work_location VARCHAR(150) NULL,
    hongkong_agency_name VARCHAR(150) NULL,
    interview_date DATE NULL,
    estimated_contract_date DATE NULL,
    reserved_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_applicant_reserved_applicant (applicant_id),
    CONSTRAINT fk_applicant_reserved_applicant
        FOREIGN KEY (applicant_id) REFERENCES applicant(id)
        ON DELETE CASCADE
);
