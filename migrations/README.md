# Database Migrations

This directory contains SQL migration files for the Tesla Ambassador Platform.

## Running Migrations

Migrations should be executed in order (by filename) against your Supabase database.

### How to run migrations in Supabase:

1. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy the contents of the migration file
   - Paste and execute the SQL

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

3. **Via psql (if you have direct database access):**
   ```bash
   psql -h your-project.supabase.co -U postgres -d postgres -f migrations/004_add_vin_to_vehicles.sql
   ```

## Migration Files

### 001_add_multi_country_support.sql
Adds country support and localization fields to the ambassadors table.

### 002_setup_storage_buckets.sql
Creates storage buckets for profile images and vehicle photos.

### 003_add_geolocation_to_ambassadors.sql
Adds latitude and longitude fields for distance-based vehicle search.

### 004_add_vin_to_vehicles.sql
**NEW** - Adds VIN and vehicle registry data storage:
- `vin` (VARCHAR(17)): Vehicle Identification Number with unique constraint
- `vehicle_registry_data` (JSONB): Complete vehicle data from Czech Vehicle Registry API

This migration enables:
- VIN-based vehicle lookup
- One-time API data retrieval and storage
- Fast VIN searches with indexed column
- Full vehicle technical specifications from registry

## Important Notes

- Always backup your database before running migrations
- Migrations should be run in numerical order
- The `vehicle_registry_data` column stores the complete response from the MDČ Portal API
- VIN column has a unique constraint to prevent duplicate vehicle registrations
