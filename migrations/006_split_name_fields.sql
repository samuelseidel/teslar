-- Migration: Split full_name into first_name and last_name
-- Description: Add separate fields for first name and last name for better privacy on public pages

-- Add new columns
ALTER TABLE ambassadors
ADD COLUMN first_name TEXT NULL,
ADD COLUMN last_name TEXT NULL;

-- Migrate existing data (split full_name on first space)
UPDATE ambassadors
SET
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
WHERE full_name IS NOT NULL AND full_name != '';

-- Handle single-name cases
UPDATE ambassadors
SET last_name = ''
WHERE full_name IS NOT NULL
  AND POSITION(' ' IN full_name) = 0
  AND last_name IS NULL;

-- Make fields NOT NULL after migration
ALTER TABLE ambassadors
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN ambassadors.first_name IS 'Ambassador first name';
COMMENT ON COLUMN ambassadors.last_name IS 'Ambassador last name (surname)';
COMMENT ON COLUMN ambassadors.full_name IS 'DEPRECATED: Use first_name and last_name instead';
