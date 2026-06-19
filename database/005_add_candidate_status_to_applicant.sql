ALTER TABLE applicant
ADD COLUMN candidate_status VARCHAR(100) NULL DEFAULT 'Available for Application'
AFTER last_education;
