# Database Migration Guide

## Overview

This guide walks you through migrating your Tesla Ambassador Platform from the US-focused schema to the Czech multi-vehicle schema.

## Quick Start

### Option 1: Run the Migration Script (Recommended)

1. **Open Supabase SQL Editor**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the migration**:
   - Open `supabase-migration-to-czech.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Check for errors**:
   - The script is designed to handle most errors gracefully
   - If you see "Storage bucket creation skipped" - that's normal, see Step 3 below

### Option 2: Fresh Start (If you have no important data)

If this is a development/testing environment with no important data:

1. **Delete all data** (Supabase Dashboard > Table Editor):
   - Delete all rows from `contact_requests`
   - Delete all rows from `ambassadors`
   - Delete any other data

2. **Run the migration script** as described in Option 1

## Storage Setup (Required)

**⚠️ IMPORTANT**: The migration script will show "Storage bucket creation skipped" - this is expected and normal.

You MUST set up storage manually via the Supabase Dashboard (SQL creation requires admin permissions).

**👉 Follow the complete guide**: See [`STORAGE_SETUP_GUIDE.md`](./STORAGE_SETUP_GUIDE.md) for detailed step-by-step instructions.

### Quick Summary

1. Go to **Dashboard > Storage** → **"New bucket"**
2. Create bucket: `vehicle-images` (public, 5MB limit, image MIME types only)
3. Add 4 policies via **"Policies"** tab:
   - Public read (anyone can view)
   - Authenticated insert (ambassadors can upload to their folders)
   - Authenticated update (ambassadors can update their files)
   - Authenticated delete (ambassadors can delete their files)

See the full guide for exact policy configurations.

## What Changed

### New Tables
- ✅ **vehicles**: Stores vehicle information (one ambassador can have multiple vehicles)

### Updated Tables
- **ambassadors**:
  - ✅ Added: `region` (Czech regions instead of US states)
  - ✅ Added: `referral_code` (Tesla referral code)
  - ❌ Removed: `tesla_model` (moved to vehicles table)
  - ❌ Removed: `tesla_year` (moved to vehicles table)

- **vehicles**:
  - Contains: `tesla_model`, `tesla_variant`, `tesla_year`
  - Contains: `profile_image_url` (main vehicle photo)
  - Contains: `images` (array of up to 5 additional photos)

- **contact_requests**:
  - ✅ Added: `vehicle_id` (references specific vehicle)
  - Kept: `ambassador_id` (for backward compatibility)

### Storage
- ✅ **vehicle-images bucket**: Stores vehicle photos
- Folder structure: `{ambassador_id}/{vehicle_id}/{filename}`

## Testing the Migration

1. **Create a test account**:
   - Sign up at `/auth/signup`
   - Create an ambassador profile
   - Add vehicle details and upload images

2. **Verify database**:
   - Check `ambassadors` table has `region` and `referral_code`
   - Check `vehicles` table was created and has your test vehicle
   - Check images are in `storage.objects`

3. **Test functionality**:
   - Profile creation works
   - Image upload works
   - Images display correctly

## Troubleshooting

### Error: "relation 'vehicles' does not exist"
- The migration script creates this table automatically
- If you see this error, the table creation step failed
- Try running just the vehicles table creation section

### Error: "must be owner of table objects"
- This means you don't have permission to create storage buckets via SQL
- **Solution**: Follow the "Manual Storage Setup" section above

### Error: "column 'region' does not exist"
- The migration adds this column automatically
- If it fails, try running: `ALTER TABLE ambassadors ADD COLUMN region TEXT;`

### Images not uploading
1. Check storage bucket exists (Dashboard > Storage)
2. Check storage policies are created
3. Check browser console for detailed error messages
4. Verify file size is under 5MB and format is JPG/PNG/WEBP

## Rolling Back (If Needed)

If you need to undo the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS vehicles CASCADE;

-- Remove new columns from ambassadors
ALTER TABLE ambassadors DROP COLUMN IF EXISTS region;
ALTER TABLE ambassadors DROP COLUMN IF EXISTS referral_code;

-- Remove vehicle_id from contact_requests
ALTER TABLE contact_requests DROP COLUMN IF EXISTS vehicle_id;

-- Delete storage bucket (via Supabase Dashboard > Storage)
```

## Need Help?

- Check the error messages in the SQL Editor
- Look at browser console for frontend errors
- Verify your Supabase project permissions
- Make sure you're running the latest version of the migration script
