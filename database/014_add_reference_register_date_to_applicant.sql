ALTER TABLE applicant
ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100) NULL AFTER category_id,
ADD COLUMN IF NOT EXISTS register_date DATE NULL AFTER reference_no;
