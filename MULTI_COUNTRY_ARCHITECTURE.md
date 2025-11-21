# Multi-Country Architecture

## Overview

The Tesla Ambassador Platform is designed to support multiple countries with minimal code changes. This document explains the architectural decisions and how to extend support to new countries.

## Design Principles

### 1. Flexible Database Schema
The database uses **country-agnostic fields** that work for any country:

```sql
CREATE TABLE ambassadors (
  country TEXT NOT NULL,              -- Localized country name
  country_code TEXT,                  -- ISO 3166-1 alpha-2 code
  region TEXT NOT NULL,               -- Administrative division (flexible)
  city TEXT NOT NULL,
  ...
);
```

**Why this approach?**
- ✅ Simple and flexible
- ✅ Easy to query and filter
- ✅ No complex joins or foreign keys
- ✅ Works with any country without schema changes
- ✅ Can be extended to full normalization later if needed

**Alternative approaches considered:**
- ❌ **Normalized tables** (countries → regions → cities): Too complex for this use case
- ❌ **JSONB location field**: Harder to query and index
- ❌ **Enum types**: Requires database migrations for new countries

### 2. Application-Layer Country Configuration

Country-specific data is defined in code (`lib/constants/countries.ts`), not in the database:

```typescript
export const COUNTRIES: Record<string, CountryRegion> = {
  CZ: {
    code: 'CZ',
    name: 'Česká republika',
    nameEn: 'Czech Republic',
    regionType: 'kraj',
    regions: ['Praha', 'Středočeský kraj', ...]
  },
  US: {
    code: 'US',
    name: 'United States',
    nameEn: 'United States',
    regionType: 'state',
    regions: ['California', 'Texas', ...]
  },
  // Add more countries here
}
```

**Benefits:**
- ✅ No database migrations needed to add countries
- ✅ Easy to update region names or add new regions
- ✅ Can deploy changes via code push (no SQL required)
- ✅ Type-safe validation in TypeScript
- ✅ Localized region names for each country

### 3. Backward Compatibility

The architecture maintains backward compatibility with the Czech-only version:

```typescript
// Old code still works
export const CZECH_REGIONS = COUNTRIES.CZ.regions

// New code uses multi-country
import { getCountriesList, getRegionsForCountry } from '@/lib/constants/countries'
```

## Database Schema

### Tables

#### ambassadors
```sql
id                UUID PRIMARY KEY
user_id           UUID → auth.users(id)
email             TEXT NOT NULL
full_name         TEXT NOT NULL
phone             TEXT
country           TEXT NOT NULL              -- "Česká republika", "United States", etc.
country_code      TEXT                        -- "CZ", "US", "DE", etc.
region            TEXT NOT NULL              -- "Praha", "California", "Bayern", etc.
city              TEXT NOT NULL
zip_code          TEXT
bio               TEXT
referral_code     TEXT
available         BOOLEAN DEFAULT true
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
```

**Indexes:**
- `idx_ambassadors_country` - Filter by country
- `idx_ambassadors_country_code` - Fast lookup by ISO code
- `idx_ambassadors_region` - Filter by region
- `idx_ambassadors_country_region` - Composite filter
- `idx_ambassadors_city` - Search by city

#### vehicles
No changes needed - vehicles are not country-specific.

#### contact_requests
No changes needed - inherits location from ambassador.

### Constraints

```sql
CONSTRAINT valid_country CHECK (country IS NOT NULL AND length(trim(country)) > 0)
CONSTRAINT valid_region CHECK (region IS NOT NULL AND length(trim(region)) > 0)
```

## Application Layer

### Country Configuration

**File:** `lib/constants/countries.ts`

```typescript
export interface CountryRegion {
  code: string        // ISO 3166-1 alpha-2
  name: string        // Localized name
  nameEn: string      // English name
  regions: string[]   // Administrative divisions
  regionType: string  // "state", "kraj", "Bundesland", etc.
}
```

### Helper Functions

```typescript
getCountry(code: string): CountryRegion | undefined
getCountryCodes(): string[]
getCountriesList(): CountryRegion[]
getRegionsForCountry(countryCode: string): string[]
isValidRegion(countryCode: string, region: string): boolean
getCountryName(countryCode: string, useEnglish?: boolean): string
```

### Form Integration

The profile creation form dynamically updates regions based on selected country:

```typescript
// Update regions when country changes
useEffect(() => {
  if (formData.country_code) {
    const regions = getRegionsForCountry(formData.country_code)
    setAvailableRegions(regions)

    // Reset region if invalid
    if (formData.region && !regions.includes(formData.region)) {
      setFormData(prev => ({ ...prev, region: '' }))
    }
  }
}, [formData.country_code])
```

## Adding a New Country

### Step 1: Add Country Configuration

Edit `lib/constants/countries.ts`:

```typescript
// Example: Adding Switzerland
CH: {
  code: 'CH',
  name: 'Schweiz',  // or 'Suisse', 'Svizzera', 'Svizra'
  nameEn: 'Switzerland',
  regionType: 'Kanton',
  regions: [
    'Zürich',
    'Bern',
    'Luzern',
    'Uri',
    'Schwyz',
    // ... all 26 cantons
  ],
},
```

### Step 2: Test Immediately

No code changes needed! The form will automatically:
- ✅ Show new country in dropdown
- ✅ Load regions for selected country
- ✅ Validate region selection
- ✅ Save country and region to database

### Step 3: Optional Localization

If you want localized UI for the new country, update form labels:

```typescript
// Example: Detect country and show localized text
const getCityLabel = (countryCode: string) => {
  switch (countryCode) {
    case 'CZ': return 'Město'
    case 'US': return 'City'
    case 'DE': return 'Stadt'
    case 'CH': return 'Ort'
    default: return 'City'
  }
}
```

## Query Examples

### Filter by Country

```sql
-- Get all ambassadors from Czech Republic
SELECT * FROM ambassadors
WHERE country_code = 'CZ' AND available = true;

-- Get all ambassadors from a specific region
SELECT * FROM ambassadors
WHERE country_code = 'CZ'
AND region = 'Praha'
AND available = true;
```

### Multi-Country Filters

```sql
-- Get ambassadors from multiple countries
SELECT * FROM ambassadors
WHERE country_code IN ('CZ', 'SK', 'PL')
AND available = true;

-- Group by country
SELECT country, COUNT(*) as ambassador_count
FROM ambassadors
WHERE available = true
GROUP BY country
ORDER BY ambassador_count DESC;
```

### Join with Vehicles

```sql
-- Get vehicles with location info
SELECT
  v.*,
  a.country,
  a.country_code,
  a.region,
  a.city
FROM vehicles v
INNER JOIN ambassadors a ON v.ambassador_id = a.id
WHERE a.country_code = 'CZ'
AND v.available = true
AND a.available = true;
```

## Frontend Filtering

### Browse Page Example

```typescript
// Filter by country and region
const [selectedCountry, setSelectedCountry] = useState('')
const [selectedRegion, setSelectedRegion] = useState('')

// Fetch ambassadors
const { data: ambassadors } = await supabase
  .from('ambassadors')
  .select('*')
  .eq('available', true)
  .eq('country_code', selectedCountry)  // Filter by country
  .eq('region', selectedRegion)          // Filter by region
```

### Dynamic Region Dropdown

```typescript
const availableRegions = selectedCountry
  ? getRegionsForCountry(selectedCountry)
  : []

<select value={selectedRegion} onChange={...}>
  <option value="">All Regions</option>
  {availableRegions.map(region => (
    <option key={region} value={region}>{region}</option>
  ))}
</select>
```

## Currently Supported Countries

- 🇨🇿 **Czech Republic** (Česká republika) - 14 kraje
- 🇺🇸 **United States** - 50 states
- 🇩🇪 **Germany** (Deutschland) - 16 Bundesländer
- 🇦🇹 **Austria** (Österreich) - 9 Bundesländer
- 🇵🇱 **Poland** (Polska) - 16 województw
- 🇸🇰 **Slovakia** (Slovensko) - 8 krajov

## Easy to Add

Countries with strong Tesla presence that can be added easily:
- 🇨🇭 Switzerland
- 🇳🇱 Netherlands
- 🇧🇪 Belgium
- 🇫🇷 France
- 🇬🇧 United Kingdom
- 🇳🇴 Norway
- 🇸🇪 Sweden
- 🇩🇰 Denmark
- 🇪🇸 Spain
- 🇮🇹 Italy

## Migration Guide

### From Single-Country (Czech only)

If you're running the old Czech-only schema:

```sql
-- Add country_code column
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Set country_code for existing Czech ambassadors
UPDATE ambassadors
SET country_code = 'CZ'
WHERE country = 'Česká republika' OR country_code IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ambassadors_country ON ambassadors(country);
CREATE INDEX IF NOT EXISTS idx_ambassadors_country_code ON ambassadors(country_code);
CREATE INDEX IF NOT EXISTS idx_ambassadors_country_region ON ambassadors(country, region);
```

### Fresh Installation

Use `supabase-setup-multi-country.sql` which includes everything:
- Multi-country schema
- All indexes
- RLS policies
- Helper views

## Performance Considerations

### Indexing Strategy

```sql
-- Single-column indexes
idx_ambassadors_country          -- For country filter
idx_ambassadors_country_code     -- For ISO code lookup
idx_ambassadors_region           -- For region filter

-- Composite index
idx_ambassadors_country_region   -- For combined filters
```

### Query Optimization

```sql
-- ✅ GOOD: Use indexed columns
WHERE country_code = 'CZ' AND region = 'Praha'

-- ❌ BAD: Function on indexed column
WHERE LOWER(country) = 'česká republika'

// ✅ GOOD: Use country_code in filters
.eq('country_code', 'CZ')

// ❌ BAD: Use localized country name
.eq('country', 'Česká republika')
```

## Localization Strategy

### Database Level
- Store **localized** country names (`country` field)
- Store **ISO codes** for programmatic use (`country_code` field)
- Store **region names** in local language

### Application Level
- Define translations in code
- Use country_code to determine UI language
- Provide English fallbacks for all text

### Example

```typescript
const translations = {
  CZ: {
    selectCountry: 'Vyberte zemi',
    selectRegion: 'Vyberte kraj',
  },
  US: {
    selectCountry: 'Select Country',
    selectRegion: 'Select State',
  },
}

const t = translations[country Code] || translations.US
```

## Security Considerations

### Validation

Always validate country and region pairs:

```typescript
export function isValidRegion(countryCode: string, region: string): boolean {
  const regions = getRegionsForCountry(countryCode)
  return regions.includes(region)
}

// In form submission
if (!isValidRegion(formData.country_code, formData.region)) {
  throw new Error('Invalid region for selected country')
}
```

### RLS Policies

No changes needed - RLS policies are country-agnostic:

```sql
CREATE POLICY "Anyone can view available ambassadors"
  ON ambassadors FOR SELECT
  USING (available = true);  -- Works for all countries
```

## Future Enhancements

### Possible Additions

1. **City Autocomplete**: Add major cities per country
2. **Postal Code Validation**: Country-specific format validation
3. **Phone Number Format**: Country-specific phone formats
4. **Language Detection**: Auto-detect user language from country
5. **Currency Support**: Show referral rewards in local currency
6. **Map Integration**: Country-specific map providers
7. **Time Zones**: Show contact availability in local time

### Scalability

The current architecture easily supports:
- ✅ Unlimited countries
- ✅ Unlimited regions per country
- ✅ Multiple languages
- ✅ Millions of ambassadors
- ✅ Complex geographic queries

## Summary

**Architecture Strengths:**
- ✅ Simple and flexible database schema
- ✅ No migrations needed to add countries
- ✅ Type-safe configuration
- ✅ Fast queries with proper indexing
- ✅ Backward compatible
- ✅ Easy to maintain

**Trade-offs:**
- ⚠️ Region validation in application layer (not database)
- ⚠️ Need to update code to add countries (but no SQL migrations)
- ⚠️ No automatic population of region dropdown from database

**Overall:** A pragmatic, scalable solution that balances flexibility with simplicity.
