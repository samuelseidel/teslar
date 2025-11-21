# Quick Fix: Storage Upload Errors

## Problem
Getting this error when uploading images?
```
Error: Upload failed: new row violates row-level security policy
Failed to load resource: the server responded with a status of 400
```

## Solution (2 minutes)

### Option 1: Run SQL Migration (Fastest)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project
   - Click **"SQL Editor"** in left sidebar

2. **Create new query**
   - Click **"New query"**

3. **Copy and paste this SQL**
   - Open the file: `migrations/002_setup_storage_buckets.sql`
   - Copy ALL the SQL code
   - Paste into the SQL Editor

4. **Run it**
   - Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
   - Wait for success message

5. **Done!**
   - Try uploading an image again
   - Should work now

### Option 2: Manual Dashboard Setup

If the SQL method doesn't work, follow the detailed guide: [`STORAGE_SETUP_GUIDE.md`](./STORAGE_SETUP_GUIDE.md)

---

## What This Does

Creates two storage buckets with proper permissions:

1. **`vehicle-images`** - For vehicle photos (profile + gallery)
   - Path structure: `{ambassador_id}/{vehicle_id}/{filename}`
   - Vehicle-specific

2. **`profile-images`** - For ambassador profile pictures
   - Path structure: `{ambassador_id}/{filename}`
   - User-specific (NOT vehicle-specific)

Both buckets are:
- ✅ Public (anyone can view)
- ✅ Upload-enabled for authenticated users
- ✅ Update/delete enabled for owners

---

## Verification

After running the migration:

1. Go to Dashboard → **Storage**
2. You should see two buckets:
   - `vehicle-images`
   - `profile-images`
3. Click each bucket → **Policies** tab
4. Each should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

## Still Having Issues?

Check:
- Are you logged in? (authentication required for uploads)
- Is your `.env.local` configured correctly?
- Are the bucket names exactly `vehicle-images` and `profile-images`?

See detailed troubleshooting in [`STORAGE_SETUP_GUIDE.md`](./STORAGE_SETUP_GUIDE.md)
