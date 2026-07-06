ALTER TABLE applicant
ADD COLUMN IF NOT EXISTS brother_age VARCHAR(100) NULL AFTER number_of_brother,
ADD COLUMN IF NOT EXISTS sister_age VARCHAR(100) NULL AFTER number_of_sister;
