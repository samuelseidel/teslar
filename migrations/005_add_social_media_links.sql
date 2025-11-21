-- Migration: Add social media links to ambassadors
-- Description: Add Instagram, Facebook, and X (Twitter) profile links

-- Add social media columns to ambassadors table
ALTER TABLE ambassadors
ADD COLUMN instagram_url TEXT NULL,
ADD COLUMN facebook_url TEXT NULL,
ADD COLUMN x_url TEXT NULL;

-- Add comments for documentation
COMMENT ON COLUMN ambassadors.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN ambassadors.facebook_url IS 'Facebook profile URL';
COMMENT ON COLUMN ambassadors.x_url IS 'X (Twitter) profile URL';
