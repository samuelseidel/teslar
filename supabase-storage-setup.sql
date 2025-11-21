-- Tesla Ambassador Platform - Supabase Storage Setup
-- Run this SQL in your Supabase SQL Editor to set up image storage

-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true, -- Public bucket (anyone can read)
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Anyone can view vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Ambassadors can upload their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Ambassadors can update their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Ambassadors can delete their own vehicle images" ON storage.objects;

-- RLS Policies for vehicle-images bucket

-- Anyone can view/download images (public read)
CREATE POLICY "Anyone can view vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

-- Ambassadors can upload images to their own folder
-- Folder structure: vehicle-images/{ambassador_id}/{vehicle_id}/{filename}
CREATE POLICY "Ambassadors can upload their own vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
  )
);

-- Ambassadors can update their own vehicle images
CREATE POLICY "Ambassadors can update their own vehicle images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
  )
);

-- Ambassadors can delete their own vehicle images
CREATE POLICY "Ambassadors can delete their own vehicle images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
  )
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Instructions for use:
-- 1. Upload images with path: {ambassador_id}/{vehicle_id}/{filename}
-- 2. Profile images should be named: profile.jpg (or .png, .webp)
-- 3. Additional images: 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg
-- 4. Get public URL: https://{project_ref}.supabase.co/storage/v1/object/public/vehicle-images/{path}
