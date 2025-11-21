-- ============================================================================
-- Tesla Ambassador Platform - Multi-Country Database Setup
-- ============================================================================
-- Extensible setup script supporting multiple countries
-- Currently supports: Czech Republic, with easy addition of new countries
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: ambassadors
-- ============================================================================
-- Tesla owners who want to share their experience with potential buyers
-- Now supports multiple countries

CREATE TABLE ambassadors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,

  -- Location fields (country-agnostic)
  country TEXT NOT NULL,              -- ISO country name or local name (e.g., 'Česká republika', 'United States')
  country_code TEXT,                  -- Optional ISO 3166-1 alpha-2 code (e.g., 'CZ', 'US', 'DE')
  region TEXT NOT NULL,               -- Administrative division (state, kraj, Bundesland, etc.)
  city TEXT NOT NULL,
  zip_code TEXT,

  bio TEXT,
  referral_code TEXT,                 -- Tesla referral code
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_country CHECK (country IS NOT NULL AND length(trim(country)) > 0),
  CONSTRAINT valid_region CHECK (region IS NOT NULL AND length(trim(region)) > 0)
);

-- Indexes for ambassadors
CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX idx_ambassadors_country ON ambassadors(country);
CREATE INDEX idx_ambassadors_country_code ON ambassadors(country_code);
CREATE INDEX idx_ambassadors_region ON ambassadors(region);
CREATE INDEX idx_ambassadors_city ON ambassadors(city);
CREATE INDEX idx_ambassadors_available ON ambassadors(available);
CREATE INDEX idx_ambassadors_country_region ON ambassadors(country, region);

-- ============================================================================
-- TABLE: vehicles
-- ============================================================================
-- Vehicles owned by ambassadors (one ambassador can have multiple vehicles)

CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  tesla_model TEXT NOT NULL,           -- e.g., 'Model S', 'Model 3', 'Model X', 'Model Y'
  tesla_variant TEXT,                  -- e.g., 'Long Range AWD', 'Performance', 'Plaid'
  tesla_year INTEGER NOT NULL,
  description TEXT,
  profile_image_url TEXT,              -- Main vehicle photo (round icon for cards)
  images TEXT[],                       -- Array of additional image URLs (up to 5)
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_year CHECK (tesla_year >= 2008 AND tesla_year <= EXTRACT(YEAR FROM NOW()) + 2)
);

-- Indexes for vehicles
CREATE INDEX idx_vehicles_ambassador_id ON vehicles(ambassador_id);
CREATE INDEX idx_vehicles_tesla_model ON vehicles(tesla_model);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_vehicles_tesla_year ON vehicles(tesla_year);

-- ============================================================================
-- TABLE: contact_requests
-- ============================================================================
-- Contact requests from potential buyers to ambassadors/vehicles

CREATE TABLE contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,  -- Optional: specific vehicle
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',  -- 'new', 'contacted', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'completed', 'cancelled'))
);

-- Indexes for contact_requests
CREATE INDEX idx_contact_requests_ambassador_id ON contact_requests(ambassador_id);
CREATE INDEX idx_contact_requests_vehicle_id ON contact_requests(vehicle_id);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- AMBASSADORS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can view available ambassadors
CREATE POLICY "Anyone can view available ambassadors"
  ON ambassadors FOR SELECT
  USING (available = true);

-- Users can insert their own ambassador profile
CREATE POLICY "Users can insert their own ambassador profile"
  ON ambassadors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ambassador profile
CREATE POLICY "Users can update their own ambassador profile"
  ON ambassadors FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own profile even if not available
CREATE POLICY "Users can view their own profile"
  ON ambassadors FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- VEHICLES POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can view available vehicles
CREATE POLICY "Anyone can view available vehicles"
  ON vehicles FOR SELECT
  USING (available = true);

-- Ambassadors can insert their own vehicles
CREATE POLICY "Ambassadors can insert their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Ambassadors can update their own vehicles
CREATE POLICY "Ambassadors can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Ambassadors can delete their own vehicles
CREATE POLICY "Ambassadors can delete their own vehicles"
  ON vehicles FOR DELETE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Ambassadors can view all their own vehicles (even if not available)
CREATE POLICY "Ambassadors can view their own vehicles"
  ON vehicles FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- CONTACT_REQUESTS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can create contact requests
CREATE POLICY "Anyone can create contact requests"
  ON contact_requests FOR INSERT
  WITH CHECK (true);

-- Ambassadors can view contact requests for their profile
CREATE POLICY "Ambassadors can view their contact requests"
  ON contact_requests FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Ambassadors can update their contact requests (change status)
CREATE POLICY "Ambassadors can update their contact requests"
  ON contact_requests FOR UPDATE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ambassadors table
CREATE TRIGGER update_ambassadors_updated_at
  BEFORE UPDATE ON ambassadors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for vehicles table
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER VIEWS (Optional)
-- ============================================================================

-- View to get complete vehicle information with ambassador location
CREATE OR REPLACE VIEW vehicles_with_location AS
SELECT
  v.*,
  a.country,
  a.country_code,
  a.region,
  a.city,
  a.full_name as ambassador_name,
  a.email as ambassador_email,
  a.referral_code
FROM vehicles v
INNER JOIN ambassadors a ON v.ambassador_id = a.id
WHERE v.available = true AND a.available = true;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE ambassadors IS 'Tesla owners (ambassadors) who share their experience. Supports multiple countries.';
COMMENT ON TABLE vehicles IS 'Vehicles owned by ambassadors. One ambassador can own multiple vehicles.';
COMMENT ON TABLE contact_requests IS 'Contact requests from potential buyers to ambassadors.';

COMMENT ON COLUMN ambassadors.country IS 'Country name (localized or English). Examples: "Česká republika", "United States", "Deutschland"';
COMMENT ON COLUMN ambassadors.country_code IS 'Optional ISO 3166-1 alpha-2 country code. Examples: "CZ", "US", "DE"';
COMMENT ON COLUMN ambassadors.region IS 'Administrative division name. Examples: "Praha" (CZ), "California" (US), "Bayern" (DE)';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

SELECT
  'Multi-country database setup completed!' as status,
  'Tables: ambassadors, vehicles, contact_requests' as tables,
  'RLS policies enabled and configured' as security,
  'Supports multiple countries with flexible regions' as feature,
  'Ready for use!' as next_step;

-- ============================================================================
-- SUPPORTED COUNTRIES (Application Layer)
-- ============================================================================
-- The application will define supported countries and their regions in code
-- This keeps the database flexible while maintaining validation in the app
--
-- Current implementation:
-- - Czech Republic (Česká republika): 14 kraje
-- - Easy to add: United States, Germany, Austria, Poland, etc.
--
-- Each country configuration includes:
-- - Country name (localized)
-- - Country code (ISO)
-- - List of regions/states
-- - Localized region names
-- ============================================================================

-- ============================================================================
-- MIGRATION FROM SINGLE-COUNTRY SCHEMA
-- ============================================================================
-- If migrating from the Czech-only schema, run:
--
-- ALTER TABLE ambassadors
--   DROP CONSTRAINT IF EXISTS ambassadors_country_check,
--   ALTER COLUMN country DROP DEFAULT,
--   ADD COLUMN IF NOT EXISTS country_code TEXT;
--
-- UPDATE ambassadors SET country_code = 'CZ' WHERE country = 'Česká republika';
--
-- CREATE INDEX IF NOT EXISTS idx_ambassadors_country ON ambassadors(country);
-- CREATE INDEX IF NOT EXISTS idx_ambassadors_country_code ON ambassadors(country_code);
-- ============================================================================
