-- Add VIN column and vehicle registry data to vehicles table
-- VIN (Vehicle Identification Number) is a unique 17-character code for each vehicle
-- This allows us to store and reference the VIN for future lookups and verification

ALTER TABLE vehicles
ADD COLUMN vin VARCHAR(17) NULL,
ADD COLUMN vehicle_registry_data JSONB NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN vehicles.vin IS 'Vehicle Identification Number (VIN) - 17-character unique identifier';
COMMENT ON COLUMN vehicles.vehicle_registry_data IS 'Complete vehicle data from Czech Vehicle Registry (MDČ Portal API) stored as JSON for reference';

-- Add an index for faster VIN lookups
CREATE INDEX idx_vehicles_vin ON vehicles(vin);

-- Add a unique constraint to prevent duplicate VINs
-- Note: Using a unique index that allows NULL values
CREATE UNIQUE INDEX idx_vehicles_vin_unique ON vehicles(vin) WHERE vin IS NOT NULL;

-- Add an index on the JSONB column for better query performance
CREATE INDEX idx_vehicles_registry_data ON vehicles USING GIN (vehicle_registry_data);
