CREATE TABLE IF NOT EXISTS applicant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    birth_date DATE NULL,
    sex ENUM('M','F') NULL,
    candidate_status VARCHAR(100) NULL DEFAULT 'Available for Application',
    reserved VARCHAR(20) NULL DEFAULT 'Not Available',
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    created_by INT NULL
);
