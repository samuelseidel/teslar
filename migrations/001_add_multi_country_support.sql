-- ============================================================================
-- Migration 001: Add Multi-Country Support
-- ============================================================================
-- Date: 2025-01-21
-- Purpose: Upgrade from single-country (Czech) schema to multi-country support
-- Run this if: You're upgrading from an existing Czech-only installation
-- ============================================================================

-- This migration is IDEMPOTENT (safe to run multiple times)

BEGIN;

-- ============================================================================
-- STEP 1: Add country_code column if it doesn't exist
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN country_code TEXT;
    RAISE NOTICE 'Added country_code column to ambassadors table';
  ELSE
    RAISE NOTICE 'country_code column already exists, skipping';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Populate country_code for existing Czech ambassadors
-- ============================================================================

UPDATE ambassadors
SET country_code = 'CZ'
WHERE country_code IS NULL
  AND (country = 'Česká republika' OR country IS NULL OR country = '');

-- ============================================================================
-- STEP 3: Update country field for consistency
-- ============================================================================

UPDATE ambassadors
SET country = 'Česká republika'
WHERE country_code = 'CZ'
  AND (country IS NULL OR country = '');

-- ============================================================================
-- STEP 4: Create indexes for new fields (if they don't exist)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ambassadors_country ON ambassadors(country);
CREATE INDEX IF NOT EXISTS idx_ambassadors_country_code ON ambassadors(country_code);
CREATE INDEX IF NOT EXISTS idx_ambassadors_country_region ON ambassadors(country, region);

-- ============================================================================
-- STEP 5: Drop old state-based constraints if they exist
-- ============================================================================

-- Remove any old CHECK constraints that might reference 'state'
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'ambassadors'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%state%'
  LOOP
    EXECUTE format('ALTER TABLE ambassadors DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_name;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 6: Verify migration
-- ============================================================================

DO $$
DECLARE
  ambassador_count INTEGER;
  with_country_code INTEGER;
BEGIN
  SELECT COUNT(*) INTO ambassador_count FROM ambassadors;
  SELECT COUNT(*) INTO with_country_code FROM ambassadors WHERE country_code IS NOT NULL;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration 001 completed successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total ambassadors: %', ambassador_count;
  RAISE NOTICE 'With country_code: %', with_country_code;
  RAISE NOTICE 'Missing country_code: %', (ambassador_count - with_country_code);
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update application code to use country_code';
  RAISE NOTICE '2. Add more countries to lib/constants/countries.ts';
  RAISE NOTICE '3. Test the country selection form';
  RAISE NOTICE '============================================';
END $$;

COMMIT;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- If you need to rollback this migration:
--
-- BEGIN;
--   DROP INDEX IF EXISTS idx_ambassadors_country_region;
--   ALTER TABLE ambassadors DROP COLUMN IF EXISTS country_code;
-- COMMIT;
--
-- WARNING: This will lose country_code data for all ambassadors!
-- ============================================================================

-- ============================================================================
-- POST-MIGRATION TASKS
-- ============================================================================
-- After running this migration:
--
-- 1. Deploy updated application code that uses country_code
-- 2. Verify the country selection dropdown works
-- 3. Test creating ambassadors from different countries
-- 4. Update any custom queries to use country_code instead of hardcoded values
-- ============================================================================
