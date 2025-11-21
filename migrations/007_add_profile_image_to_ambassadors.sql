-- Migration: Add profile image URL to ambassadors
-- Description: Add profile_image_url column to store ambassador profile pictures

-- Add profile_image_url column to ambassadors table
ALTER TABLE ambassadors
ADD COLUMN profile_image_url TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN ambassadors.profile_image_url IS 'URL to ambassador profile picture stored in Supabase Storage';
