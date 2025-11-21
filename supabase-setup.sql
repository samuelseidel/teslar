-- ============================================================================
-- Tesla Ambassador Platform - Complete Database Setup (Czech Version)
-- ============================================================================
-- Fresh setup script for Czech Tesla Ambassador Platform with multi-vehicle support
-- Run this in your Supabase SQL Editor to create all tables and policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: ambassadors
-- ============================================================================
-- Tesla owners who want to share their experience with potential buyers

CREATE TABLE ambassadors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL,  -- Czech regions (kraje)
  country TEXT DEFAULT 'Česká republika',
  zip_code TEXT,
  bio TEXT,
  referral_code TEXT,  -- Tesla referral code
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for ambassadors
CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX idx_ambassadors_region ON ambassadors(region);
CREATE INDEX idx_ambassadors_city ON ambassadors(city);
CREATE INDEX idx_ambassadors_available ON ambassadors(available);

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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
-- SEED DATA (Optional - Czech Regions Reference)
-- ============================================================================
-- These are the valid Czech regions (kraje) for the platform
-- Users will select from this list when creating their profile

COMMENT ON COLUMN ambassadors.region IS
'Valid Czech regions (kraje):
- Praha
- Středočeský kraj
- Jihočeský kraj
- Plzeňský kraj
- Karlovarský kraj
- Ústecký kraj
- Liberecký kraj
- Královéhradecký kraj
- Pardubický kraj
- Vysočina
- Jihomoravský kraj
- Olomoucký kraj
- Zlínský kraj
- Moravskoslezský kraj';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

SELECT 'Database setup completed successfully!' as status,
       'Tables created: ambassadors, vehicles, contact_requests' as tables,
       'RLS policies enabled and configured' as security,
       'Ready for use!' as next_step;

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Set up Supabase Storage for vehicle images
--    See STORAGE_SETUP_GUIDE.md for detailed instructions
--    - Create bucket: 'vehicle-images'
--    - Configure RLS policies for uploads
--
-- 2. Configure your .env.local file with:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--
-- 3. Test the platform:
--    - Sign up as a new user
--    - Create ambassador profile
--    - Add vehicle with images
--    - Submit a contact request
-- ============================================================================
