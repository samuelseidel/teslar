# Database Migrations

This folder contains versioned database migration scripts for the Tesla Ambassador Platform.

## Migration Naming Convention

Migrations follow the pattern: `YYYYMMDD_HHMMSS_description.sql`

Example: `20250121_120000_add_country_code_field.sql`

## Fresh Installation

If you're starting from scratch (empty database):
```sql
-- Run this file from the project root:
supabase-setup.sql
```

This creates all tables, indexes, RLS policies, and triggers.

## Existing Installation (Migrations)

If you already have a database and need to upgrade, run migrations in order:

1. Check which migrations you've already applied
2. Run new migrations in chronological order
3. Keep track of applied migrations

### Example Migration Flow

```bash
# Initial setup (run once)
supabase-setup.sql

# Later migrations (run as needed)
migrations/20250121_120000_add_country_code_field.sql
migrations/20250122_150000_add_storage_policies.sql
# ... etc
```

## Migration Best Practices

### DO:
- ✅ Make migrations idempotent (safe to run multiple times)
- ✅ Use `IF NOT EXISTS` and `IF EXISTS` clauses
- ✅ Include rollback instructions in comments
- ✅ Test migrations on a copy of production data first
- ✅ Keep migrations small and focused

### DON'T:
- ❌ Modify existing migrations after they've been applied
- ❌ Delete data without explicit confirmation
- ❌ Mix schema changes with data changes
- ❌ Forget to update application code that depends on schema

## Available Migrations

### Migration 001: Add Multi-Country Support
**File:** `001_add_multi_country_support.sql`
**Purpose:** Adds `country_code` field to existing single-country installations
**Run if:** You're upgrading from Czech-only schema to multi-country support

## Rolling Back Migrations

Each migration includes rollback instructions in comments at the bottom of the file.

## Supabase Storage Setup

Storage bucket creation is **not** included in SQL migrations due to permission requirements.

**Follow this guide:** [`../STORAGE_SETUP_GUIDE.md`](../STORAGE_SETUP_GUIDE.md)

## Questions?

See the main documentation:
- [`../MULTI_COUNTRY_ARCHITECTURE.md`](../MULTI_COUNTRY_ARCHITECTURE.md) - Architecture overview
- [`../MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md) - Detailed migration guide
