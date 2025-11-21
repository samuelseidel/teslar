-- Tesla Ambassador Platform Database Schema - Czech Market
-- Run this SQL in your Supabase SQL Editor to set up the database
-- This schema supports multiple vehicles per ambassador and Czech localization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and policies if they exist (for migration)
DROP TRIGGER IF EXISTS on_contact_request_created ON contact_requests;
DROP TRIGGER IF EXISTS update_ambassadors_updated_at ON ambassadors;
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
DROP FUNCTION IF EXISTS notify_ambassador_contact();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS contact_requests CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS ambassadors CASCADE;

-- Ambassadors Table (User Profile)
CREATE TABLE ambassadors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL, -- Czech regions (kraje)
  country TEXT NOT NULL DEFAULT 'Česká republika',
  zip_code TEXT,
  bio TEXT,
  profile_image_url TEXT,
  referral_code TEXT, -- Tesla referral code
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Vehicles Table (Multiple vehicles per ambassador)
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  tesla_model TEXT NOT NULL, -- e.g., 'Model S', 'Model 3'
  tesla_variant TEXT, -- e.g., 'Long Range AWD', 'P100D', 'Performance'
  tesla_year INTEGER NOT NULL,
  description TEXT, -- Specific details about this vehicle (color, features, etc.)
  profile_image_url TEXT, -- Main profile image (square/round) for listings
  images TEXT[], -- Array of additional image URLs (up to 5 total)
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Contact Requests Table (Linked to specific vehicles)
CREATE TABLE contact_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_ambassadors_location ON ambassadors(region, city);
CREATE INDEX idx_ambassadors_available ON ambassadors(available);
CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX idx_vehicles_ambassador ON vehicles(ambassador_id);
CREATE INDEX idx_vehicles_model ON vehicles(tesla_model);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_contact_requests_vehicle ON contact_requests(vehicle_id);
CREATE INDEX idx_contact_requests_ambassador ON contact_requests(ambassador_id);
CREATE INDEX idx_contact_requests_created ON contact_requests(created_at);

-- Enable Row Level Security
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Ambassadors
-- Anyone can view available ambassadors
CREATE POLICY "Anyone can view available ambassadors" ON ambassadors
  FOR SELECT USING (available = true);

-- Users can insert their own ambassador profile
CREATE POLICY "Users can create their own profile" ON ambassadors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON ambassadors
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON ambassadors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Vehicles
-- Anyone can view available vehicles from available ambassadors
CREATE POLICY "Anyone can view available vehicles" ON vehicles
  FOR SELECT USING (
    available = true AND
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE available = true
    )
  );

-- Ambassadors can insert their own vehicles
CREATE POLICY "Ambassadors can create their own vehicles" ON vehicles
  FOR INSERT WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Ambassadors can update their own vehicles
CREATE POLICY "Ambassadors can update their own vehicles" ON vehicles
  FOR UPDATE USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Ambassadors can delete their own vehicles
CREATE POLICY "Ambassadors can delete their own vehicles" ON vehicles
  FOR DELETE USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Contact Requests
-- Anyone can insert contact requests
CREATE POLICY "Anyone can create contact requests" ON contact_requests
  FOR INSERT WITH CHECK (true);

-- Ambassadors can view contact requests for their vehicles
CREATE POLICY "Ambassadors can view their contact requests" ON contact_requests
  FOR SELECT USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_ambassadors_updated_at BEFORE UPDATE ON ambassadors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to send email notification when contact request is created
CREATE OR REPLACE FUNCTION notify_ambassador_contact()
RETURNS TRIGGER AS $$
DECLARE
  ambassador_email TEXT;
  ambassador_name TEXT;
  vehicle_model TEXT;
  vehicle_year INTEGER;
BEGIN
  -- Get ambassador and vehicle details
  SELECT a.email, a.full_name, v.tesla_model, v.tesla_year
  INTO ambassador_email, ambassador_name, vehicle_model, vehicle_year
  FROM ambassadors a
  JOIN vehicles v ON v.id = NEW.vehicle_id
  WHERE a.id = NEW.ambassador_id;

  -- Here you would trigger an email notification
  -- For MVP, you can use Supabase Edge Functions or webhook to services like Resend/SendGrid
  -- The trigger is set up, but actual email sending needs to be implemented via Edge Function

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for contact request notification
CREATE TRIGGER on_contact_request_created
  AFTER INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_ambassador_contact();

-- Insert sample Czech regions as reference (optional - for validation in app)
COMMENT ON COLUMN ambassadors.region IS 'Czech regions: Praha, Středočeský, Jihočeský, Plzeňský, Karlovarský, Ústecký, Liberecký, Královéhradecký, Pardubický, Vysočina, Jihomoravský, Olomoucký, Zlínský, Moravskoslezský';
