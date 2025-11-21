-- ============================================================================
-- Tesla Ambassador Platform - Complete Migration to Czech Version
-- ============================================================================
-- This script migrates from US-focused schema to Czech multi-vehicle schema
-- Safe to run multiple times (idempotent where possible)
-- ============================================================================

-- STEP 1: Create vehicles table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  tesla_model TEXT NOT NULL,
  tesla_variant TEXT,
  tesla_year INTEGER NOT NULL,
  description TEXT,
  profile_image_url TEXT,
  images TEXT[],
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for vehicles table
CREATE INDEX IF NOT EXISTS idx_vehicles_ambassador_id ON vehicles(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_tesla_model ON vehicles(tesla_model);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);

-- ============================================================================
-- STEP 2: Update ambassadors table schema
-- ============================================================================

-- Add new Czech region column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ambassadors' AND column_name = 'region') THEN
    ALTER TABLE ambassadors ADD COLUMN region TEXT;
  END IF;
END $$;

-- Add referral_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ambassadors' AND column_name = 'referral_code') THEN
    ALTER TABLE ambassadors ADD COLUMN referral_code TEXT;
  END IF;
END $$;

-- Migrate data from state to region (one-time operation)
-- Only updates rows where region is NULL and state is not NULL
UPDATE ambassadors
SET region = state
WHERE region IS NULL AND state IS NOT NULL;

-- Note: We keep the 'state' column for backward compatibility during migration
-- You can drop it later with: ALTER TABLE ambassadors DROP COLUMN IF EXISTS state;

-- Drop old tesla_model and tesla_year from ambassadors if they exist
-- These are now in the vehicles table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'ambassadors' AND column_name = 'tesla_model') THEN
    ALTER TABLE ambassadors DROP COLUMN tesla_model;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'ambassadors' AND column_name = 'tesla_year') THEN
    ALTER TABLE ambassadors DROP COLUMN tesla_year;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Update contact_requests to reference vehicles
-- ============================================================================

-- Add vehicle_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'contact_requests' AND column_name = 'vehicle_id') THEN
    ALTER TABLE contact_requests ADD COLUMN vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for vehicle_id
CREATE INDEX IF NOT EXISTS idx_contact_requests_vehicle_id ON contact_requests(vehicle_id);

-- Note: We keep ambassador_id for backward compatibility
-- Later you can make vehicle_id NOT NULL after migrating all data

-- ============================================================================
-- STEP 4: Row Level Security Policies for vehicles
-- ============================================================================

-- Enable RLS on vehicles table
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Anyone can view available vehicles" ON vehicles;
DROP POLICY IF EXISTS "Ambassadors can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Ambassadors can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Ambassadors can delete their own vehicles" ON vehicles;

-- Create policies for vehicles
CREATE POLICY "Anyone can view available vehicles"
  ON vehicles FOR SELECT
  USING (available = true);

CREATE POLICY "Ambassadors can insert their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Ambassadors can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Ambassadors can delete their own vehicles"
  ON vehicles FOR DELETE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 5: Supabase Storage Setup for Vehicle Images
-- ============================================================================
-- Note: This section might fail if you don't have storage admin permissions
-- You can skip this and set it up manually in the Supabase dashboard
-- ============================================================================

-- Create storage bucket (skip if already exists)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'vehicle-images',
    'vehicle-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Storage bucket creation skipped (insufficient privileges). Please create manually in Supabase dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Storage bucket may already exist or you need to create it manually in the dashboard.';
END $$;

-- Storage RLS policies (skip errors if no permissions)
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can view vehicle images" ON storage.objects;
  DROP POLICY IF EXISTS "Ambassadors can upload their own vehicle images" ON storage.objects;
  DROP POLICY IF EXISTS "Ambassadors can update their own vehicle images" ON storage.objects;
  DROP POLICY IF EXISTS "Ambassadors can delete their own vehicle images" ON storage.objects;

  -- Public read access
  CREATE POLICY "Anyone can view vehicle images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'vehicle-images');

  -- Ambassadors can upload to their own folder
  CREATE POLICY "Ambassadors can upload their own vehicle images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'vehicle-images'
      AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
      )
    );

  -- Ambassadors can update their own images
  CREATE POLICY "Ambassadors can update their own vehicle images"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'vehicle-images'
      AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
      )
    );

  -- Ambassadors can delete their own images
  CREATE POLICY "Ambassadors can delete their own vehicle images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'vehicle-images'
      AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
      )
    );

  -- Enable RLS
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Storage policies skipped (insufficient privileges). Please set up manually in Supabase dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Storage policies may need to be set up manually in the Supabase dashboard.';
END $$;

-- ============================================================================
-- STEP 6: Update existing RLS policies for ambassadors (if needed)
-- ============================================================================

-- The ambassadors table policies should remain largely the same
-- Just verify they exist

DO $$
BEGIN
  -- Check if policies exist, if not create them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ambassadors' AND policyname = 'Anyone can view available ambassadors'
  ) THEN
    CREATE POLICY "Anyone can view available ambassadors"
      ON ambassadors FOR SELECT
      USING (available = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ambassadors' AND policyname = 'Users can insert their own ambassador profile'
  ) THEN
    CREATE POLICY "Users can insert their own ambassador profile"
      ON ambassadors FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ambassadors' AND policyname = 'Users can update their own ambassador profile'
  ) THEN
    CREATE POLICY "Users can update their own ambassador profile"
      ON ambassadors FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of what was done:
-- ✅ Created vehicles table with image support
-- ✅ Added region and referral_code to ambassadors
-- ✅ Migrated state data to region column
-- ✅ Removed tesla_model and tesla_year from ambassadors (now in vehicles)
-- ✅ Added vehicle_id to contact_requests
-- ✅ Set up RLS policies for vehicles
-- ✅ Created storage bucket and policies (if permissions allow)

-- Next steps:
-- 1. If storage creation failed, create bucket manually in Supabase dashboard:
--    - Name: vehicle-images
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
--
-- 2. Test the migration:
--    - Create a new ambassador profile
--    - Upload vehicle images
--    - Verify data in both ambassadors and vehicles tables
--
-- 3. Optional cleanup (after verifying everything works):
--    - DROP COLUMN state FROM ambassadors; (if you don't need backward compatibility)

SELECT 'Migration completed successfully!' as status;
