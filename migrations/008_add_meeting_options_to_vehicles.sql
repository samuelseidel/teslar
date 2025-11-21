-- Add meeting_options column to vehicles table
-- This allows ambassadors to specify what types of meetings they offer:
-- - test_drive: Let the prospect drive the car
-- - ride_along: Take the prospect for a ride
-- - coffee_chat: Meet for coffee and discussion

ALTER TABLE vehicles
ADD COLUMN meeting_options TEXT[] DEFAULT ARRAY['test_drive', 'ride_along', 'coffee_chat'];

COMMENT ON COLUMN vehicles.meeting_options IS 'Array of meeting types offered: test_drive, ride_along, coffee_chat';

-- Update existing vehicles to have all options by default
UPDATE vehicles
SET meeting_options = ARRAY['test_drive', 'ride_along', 'coffee_chat']
WHERE meeting_options IS NULL;
