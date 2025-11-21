-- Migration: Add Geolocation Fields to Ambassadors
-- Description: Adds latitude and longitude fields for distance-based search using Google Maps API

-- Add latitude and longitude columns to ambassadors table
ALTER TABLE ambassadors
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create an index for efficient geolocation queries
-- This will speed up distance calculations when searching for nearby ambassadors
CREATE INDEX IF NOT EXISTS idx_ambassadors_location
ON ambassadors (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add a comment explaining the columns
COMMENT ON COLUMN ambassadors.latitude IS 'Latitude coordinate from Google Maps Geocoding API';
COMMENT ON COLUMN ambassadors.longitude IS 'Longitude coordinate from Google Maps Geocoding API';

-- Note: These fields will be populated when users:
-- 1. Create their profile using Google Places Autocomplete
-- 2. Update their address in profile settings
-- 3. Existing ambassadors will need to update their profile to get coordinates

/*
ROLLBACK:
To roll back this migration, run:

ALTER TABLE ambassadors
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude;

DROP INDEX IF EXISTS idx_ambassadors_location;
*/
