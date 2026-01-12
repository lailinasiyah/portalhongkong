CREATE TABLE IF NOT EXISTS document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    type VARCHAR(30) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    INDEX (applicant_id),
    FOREIGN KEY (applicant_id) REFERENCES applicant(id)
        ON DELETE CASCADE
);

ALTER TABLE document
ADD UNIQUE KEY uniq_applicant_type (applicant_id, type);

