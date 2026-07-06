ALTER TABLE applicant
ADD COLUMN IF NOT EXISTS job_description TEXT NULL AFTER experience,
ADD COLUMN IF NOT EXISTS from_date DATE NULL AFTER job_description,
ADD COLUMN IF NOT EXISTS to_date DATE NULL AFTER from_date;
