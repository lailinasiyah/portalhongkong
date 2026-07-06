ALTER TABLE applicant
ADD COLUMN IF NOT EXISTS passport_note TEXT NULL AFTER reserved;
