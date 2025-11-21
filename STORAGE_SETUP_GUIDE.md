# Supabase Storage Setup Guide - Dashboard Method

Since SQL bucket creation requires special permissions, this guide shows you how to set up storage via the **Supabase Dashboard UI** (the recommended approach).

## Step 1: Create the Storage Bucket

1. **Open your Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard
   - Navigate to **Storage** in the left sidebar

2. **Create new bucket**
   - Click **"New bucket"** button
   - Configure the bucket:
     - **Name**: `vehicle-images`
     - **Public bucket**: ✅ **Yes** (check this box)
     - **File size limit**: `5MB` (enter: `5242880` bytes or type `5MB`)
     - **Allowed MIME types**: Click "Add MIME type" and add these:
       - `image/jpeg`
       - `image/jpg`
       - `image/png`
       - `image/webp`

3. **Create the bucket**
   - Click **"Create bucket"**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to add RLS policies to control who can upload/view files.

### A. Public Read Policy (Anyone can view images)

1. Click on the `vehicle-images` bucket
2. Go to the **"Policies"** tab
3. Click **"New policy"**
4. Click **"Create policy from scratch"**
5. Configure:
   - **Policy name**: `Anyone can view vehicle images`
   - **Allowed operation**: SELECT (check only this)
   - **Target roles**: `public` or leave default
   - **Policy definition (WITH CHECK expression)**:
     ```sql
     bucket_id = 'vehicle-images'
     ```
6. Click **"Review"** then **"Save policy"**

### B. Authenticated Upload Policy (Ambassadors can upload to their folder)

1. Click **"New policy"** again
2. Click **"Create policy from scratch"**
3. Configure:
   - **Policy name**: `Ambassadors can upload their own vehicle images`
   - **Allowed operation**: INSERT (check only this)
   - **Target roles**: `authenticated`
   - **Policy definition (WITH CHECK expression)**:
     ```sql
     bucket_id = 'vehicle-images'
     AND (storage.foldername(name))[1] IN (
       SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
     )
     ```
4. Click **"Review"** then **"Save policy"**

### C. Update Policy (Ambassadors can update their images)

1. Click **"New policy"** again
2. Click **"Create policy from scratch"**
3. Configure:
   - **Policy name**: `Ambassadors can update their own vehicle images`
   - **Allowed operation**: UPDATE (check only this)
   - **Target roles**: `authenticated`
   - **Policy definition (USING expression)**:
     ```sql
     bucket_id = 'vehicle-images'
     AND (storage.foldername(name))[1] IN (
       SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
     )
     ```
4. Click **"Review"** then **"Save policy"**

### D. Delete Policy (Ambassadors can delete their images)

1. Click **"New policy"** again
2. Click **"Create policy from scratch"**
3. Configure:
   - **Policy name**: `Ambassadors can delete their own vehicle images`
   - **Allowed operation**: DELETE (check only this)
   - **Target roles**: `authenticated`
   - **Policy definition (USING expression)**:
     ```sql
     bucket_id = 'vehicle-images'
     AND (storage.foldername(name))[1] IN (
       SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
     )
     ```
4. Click **"Review"** then **"Save policy"**

## Step 3: Verify Setup

After creating all policies, your **Policies** tab should show:

- ✅ `Anyone can view vehicle images` (SELECT, public)
- ✅ `Ambassadors can upload their own vehicle images` (INSERT, authenticated)
- ✅ `Ambassadors can update their own vehicle images` (UPDATE, authenticated)
- ✅ `Ambassadors can delete their own vehicle images` (DELETE, authenticated)

## How It Works

### Folder Structure
Files are organized by ambassador ID and vehicle ID:
```
vehicle-images/
├── {ambassador_id_1}/
│   ├── {vehicle_id_1}/
│   │   ├── profile.jpg
│   │   ├── image-1.jpg
│   │   └── image-2.jpg
│   └── {vehicle_id_2}/
│       └── profile.png
└── {ambassador_id_2}/
    └── {vehicle_id_3}/
        └── profile.webp
```

### Security Model
- **Public can**: View all images (read-only)
- **Ambassadors can**: Upload/update/delete images **only in their own folders**
- The policy checks: `(storage.foldername(name))[1]` matches their `ambassador.id`

### Example Upload Path
When an ambassador uploads an image:
```javascript
// Path: {ambassador_id}/{vehicle_id}/profile.jpg
// The policy extracts the first folder segment (ambassador_id)
// and verifies it matches the user's ambassador profile
```

## Testing Your Setup

1. **Test upload** (from your app):
   - Sign up → Create profile → Upload vehicle image
   - Check browser console for errors

2. **Verify in Storage**:
   - Go to Dashboard > Storage > vehicle-images
   - You should see folders created: `{ambassador_id}/{vehicle_id}/`

3. **Test security**:
   - Try uploading to someone else's folder (should fail)
   - Try viewing an image URL (should work - it's public read)

## Troubleshooting

### "New policy creation failed"
- Make sure you've run the database migration first (`supabase-migration-to-czech.sql`)
- The `ambassadors` table must exist for policies to reference it

### "Upload failed: new row violates row-level security"
- Check that the file path starts with the user's ambassador ID
- Verify the user is authenticated (logged in)
- Check browser console for detailed error

### Images not displaying
- Verify bucket is marked as **Public**
- Check the image URL format: `https://{project}.supabase.co/storage/v1/object/public/vehicle-images/{path}`

## Alternative: SQL Method (For Advanced Users)

If you have admin access, you can create policies via SQL in the SQL Editor:

```sql
-- Public read
CREATE POLICY "Anyone can view vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

-- Authenticated upload
CREATE POLICY "Ambassadors can upload their own vehicle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
  )
);

-- Authenticated update
CREATE POLICY "Ambassadors can update their own vehicle images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
  )
);

-- Authenticated delete
CREATE POLICY "Ambassadors can delete their own vehicle images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM ambassadors WHERE user_id = auth.uid()
  )
);
```

## Next Steps

After completing storage setup:
1. ✅ Run the database migration (`supabase-migration-to-czech.sql`)
2. ✅ Set up storage bucket and policies (this guide)
3. Test the complete flow: signup → profile creation → image upload
4. Start building the vehicles browse page

---

Need help? Check the [Supabase Storage docs](https://supabase.com/docs/guides/storage) or the [Storage Access Control guide](https://supabase.com/docs/guides/storage/security/access-control).
