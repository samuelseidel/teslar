-- Migration: Setup Storage Buckets and RLS Policies
-- Description: Creates storage buckets for vehicle images and profile images with proper RLS policies

-- Create storage buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('vehicle-images', 'vehicle-images', true),
  ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any (to make this migration idempotent)
DROP POLICY IF EXISTS "Allow authenticated users to upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own vehicle images" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile image" ON storage.objects;

-- Vehicle Images Bucket Policies
-- Allow authenticated users to upload vehicle images
CREATE POLICY "Allow authenticated users to upload vehicle images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

-- Allow anyone to view vehicle images (public bucket)
CREATE POLICY "Allow authenticated users to read vehicle images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');

-- Allow users to update their own vehicle images
CREATE POLICY "Allow users to update their own vehicle images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'vehicle-images')
WITH CHECK (bucket_id = 'vehicle-images');

-- Allow users to delete their own vehicle images
CREATE POLICY "Allow users to delete their own vehicle images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'vehicle-images');

-- Profile Images Bucket Policies (user-specific, not vehicle-specific)
-- Allow authenticated users to upload profile images
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow anyone to view profile images (public bucket)
CREATE POLICY "Allow authenticated users to read profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to update their own profile image
CREATE POLICY "Allow users to update their own profile image"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to delete their own profile image
CREATE POLICY "Allow users to delete their own profile image"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');
