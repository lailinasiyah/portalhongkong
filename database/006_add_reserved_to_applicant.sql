ALTER TABLE applicant
ADD COLUMN reserved VARCHAR(20) NULL DEFAULT 'Not Available'
AFTER candidate_status;
