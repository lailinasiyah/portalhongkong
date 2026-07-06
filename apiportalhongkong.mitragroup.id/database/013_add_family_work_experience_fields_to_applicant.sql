ALTER TABLE applicant
ADD COLUMN IF NOT EXISTS number_of_brother INT NULL AFTER children_age,
ADD COLUMN IF NOT EXISTS number_of_sister INT NULL AFTER number_of_brother,
ADD COLUMN IF NOT EXISTS father_name VARCHAR(150) NULL AFTER number_of_sister,
ADD COLUMN IF NOT EXISTS father_age INT NULL AFTER father_name,
ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(150) NULL AFTER father_age,
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150) NULL AFTER father_occupation,
ADD COLUMN IF NOT EXISTS mother_age INT NULL AFTER mother_name,
ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(150) NULL AFTER mother_age,
ADD COLUMN IF NOT EXISTS family_rank VARCHAR(50) NULL AFTER mother_occupation,
ADD COLUMN IF NOT EXISTS work_experience LONGTEXT NULL AFTER family_rank;
