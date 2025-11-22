-- Migration: Add street address to ambassadors
-- Description: Add street_address column to store full street address with house number

-- Add street_address column to ambassadors table
ALTER TABLE ambassadors
ADD COLUMN IF NOT EXISTS street_address TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN ambassadors.street_address IS 'Full street address including house number (e.g., "K Meteoru 759/22")';
