# Google Maps Integration Guide

This guide explains how to complete the Google Maps API integration for location-based search in the Tesla Ambassador Platform.

## What's Been Completed

### 1. Database Migration
✅ **File:** `migrations/003_add_geolocation_to_ambassadors.sql`
- Added `latitude` and `longitude` columns to ambassadors table
- Created geolocation index for efficient distance queries
- Run this in Supabase SQL Editor

### 2. Libraries Installed
✅ Installed packages:
```bash
npm install @react-google-maps/api use-places-autocomplete
```

### 3. Components Created
✅ **AddressAutocomplete Component** (`components/AddressAutocomplete.tsx`)
- Google Places Autocomplete for address entry
- Returns full address with lat/lng coordinates
- Supports country restrictions
- Auto-fills city, region, country, zip code

✅ **LocationSearch Component** (`components/LocationSearch.tsx`)
- Simpler search component for finding locations
- Used for user searching "where am I" or "near me"
- Returns coordinates for distance calculations

✅ **Distance Utilities** (`lib/utils/distance.ts`)
- Haversine formula for distance calculation
- Sort by distance functionality
- Filter by radius
- Distance formatting

### 4. Pages Updated
✅ **Ambassador Create Page** (`app/ambassador/create/page.tsx`)
- Replaced manual city/region/country inputs with AddressAutocomplete
- Automatically fills location fields and coordinates
- Shows selected address details in a card

✅ **Profile Edit Page** (`app/dashboard/profile/page.tsx`)
- Added "Change Address" button
- Allows updating location with AddressAutocomplete
- Updates coordinates when address changes

## What Needs to Be Done

### Step 1: Set Up Google Maps API Key

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key

2. **Configure Restrictions (Important for Security):**
   - Application restrictions: HTTP referrers
   - Add your domains: `localhost:3000/*`, `yourdomain.com/*`
   - API restrictions: Restrict to Maps JavaScript API, Places API, Geocoding API

3. **Add to Environment Variables:**
   Create or update `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Step 2: Run Database Migration

Run the SQL migration in Supabase Dashboard → SQL Editor:
```sql
-- Copy contents of migrations/003_add_geolocation_to_ambassadors.sql
```

### Step 3: Update Vehicles Browse Page

**File to modify:** `app/vehicles/page.tsx`

**Changes needed:**

1. **Add imports:**
```typescript
import LocationSearch, { type LocationResult } from '@/components/LocationSearch'
import { sortByDistance, formatDistance } from '@/lib/utils/distance'
```

2. **Add state for location search:**
```typescript
const [userLocation, setUserLocation] = useState<LocationResult | null>(null)
```

3. **Replace city search input with LocationSearch:**
```tsx
<LocationSearch
  onLocationSelect={(location) => setUserLocation(location)}
  placeholder="Search by your location..."
  restrictToCountries={['cz', 'sk', 'at', 'de', 'pl']}
/>
```

4. **Update filterVehicles function to sort by distance:**
```typescript
const filterVehicles = () => {
  let filtered = [...vehicles]

  // Apply existing filters (country, region, model)
  if (filterCountry) {
    filtered = filtered.filter(v => v.ambassador.country_code === filterCountry)
  }
  // ... other filters

  // Sort by distance if user location is selected
  if (userLocation) {
    filtered = sortByDistance(
      filtered,
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      (vehicle) => {
        if (vehicle.ambassador.latitude && vehicle.ambassador.longitude) {
          return {
            latitude: vehicle.ambassador.latitude,
            longitude: vehicle.ambassador.longitude,
          }
        }
        return null
      }
    )
  }

  setFilteredVehicles(filtered)
}
```

5. **Display distance in vehicle cards:**
```tsx
{vehicle.distance && (
  <span className="text-sm text-gray-400">
    📍 {formatDistance(vehicle.distance)} away
  </span>
)}
```

### Step 4: Test the Integration

1. **Test Ambassador Creation:**
   - Go to `/ambassador/create`
   - Try typing an address
   - Verify autocomplete suggestions appear
   - Select an address
   - Check that city/region/country are filled
   - Create the profile
   - Verify in Supabase that latitude/longitude are saved

2. **Test Profile Editing:**
   - Go to `/dashboard/profile`
   - Click "Change Address"
   - Search for new address
   - Save changes
   - Verify coordinates updated in database

3. **Test Vehicle Browse:**
   - Go to `/vehicles`
   - Use location search to find vehicles near you
   - Verify vehicles are sorted by distance
   - Check distance labels appear

### Step 5: Handle Edge Cases

**For existing ambassadors without coordinates:**

Create a helper page or script to geocode existing addresses:

```typescript
// Example: Update existing ambassadors
const geocodeExistingAmbassadors = async () => {
  const supabase = createClient()

  // Get ambassadors without coordinates
  const { data: ambassadors } = await supabase
    .from('ambassadors')
    .select('*')
    .is('latitude', null)

  for (const ambassador of ambassadors || []) {
    try {
      const address = `${ambassador.city}, ${ambassador.region}, ${ambassador.country}`
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])

      await supabase
        .from('ambassadors')
        .update({ latitude: lat, longitude: lng })
        .eq('id', ambassador.id)

      console.log(`Updated ${ambassador.full_name}`)
    } catch (error) {
      console.error(`Failed to geocode ${ambassador.full_name}:`, error)
    }
  }
}
```

## Architecture Overview

### How It Works

1. **Address Entry:**
   - User types address → Google Places API suggests matches
   - User selects → Google Geocoding API returns lat/lng
   - All data saved to database

2. **Distance Search:**
   - User searches their location → Gets their lat/lng
   - Calculate distance from user to each ambassador using Haversine formula
   - Sort vehicles by distance (closest first)
   - Display formatted distance ("5 km", "< 1 km", etc.)

3. **Performance:**
   - Database index on (latitude, longitude) for fast queries
   - Client-side distance calculation (no API calls needed)
   - Debounced autocomplete (reduces API usage)
   - Caching of autocomplete results

### API Usage Optimization

- **Autocomplete:** 300ms debounce reduces API calls
- **Caching:** use-places-autocomplete caches responses
- **Restrictions:** Country restrictions reduce irrelevant results
- **Client-side distance:** No API calls for distance calculations

## Security Considerations

1. **API Key Restrictions:**
   - Always restrict API key to specific domains
   - Restrict to only required APIs
   - Monitor usage in Google Cloud Console

2. **Rate Limiting:**
   - Google provides free tier: 28,000 requests/month for Places API
   - Monitor usage to avoid unexpected charges
   - Consider implementing caching for common searches

3. **Client vs Server:**
   - API key is public (NEXT_PUBLIC_) but restricted by domain
   - Consider server-side geocoding for sensitive operations
   - Distance calculations are client-side (no API needed)

## Cost Estimation

**Google Maps Platform Pricing (as of 2024):**
- Places Autocomplete: $2.83 per 1,000 requests
- Geocoding: $5.00 per 1,000 requests
- Maps JavaScript API: Free (map display)

**Free Tier:**
- $200 free credit monthly
- ~70,000 autocomplete requests free per month

**Estimated Usage:**
- Ambassador creation: 1 autocomplete + 1 geocode = ~$0.008
- Profile update: Similar cost
- Vehicle browse: Only autocomplete, no geocoding needed
- Distance calculation: FREE (client-side math)

For a small to medium platform, monthly costs should stay within free tier.

## Troubleshooting

### API Key Not Working
- Check API is enabled in Google Cloud Console
- Verify domain restrictions allow your domain
- Check browser console for specific error messages
- Ensure .env.local is loaded (restart dev server)

### Autocomplete Not Showing
- Check Network tab for API errors
- Verify Google Maps script is loaded
- Check country restrictions aren't too strict
- Ensure component is mounted (client-side only)

### Distance Not Calculating
- Verify ambassadors have latitude/longitude in database
- Check coordinates are valid numbers
- Ensure Haversine formula is calculating correctly
- Check for null/undefined coordinates

### Performance Issues
- Add database index on lat/lng columns
- Implement pagination for large vehicle lists
- Consider server-side distance filtering for radius search
- Cache geocoding results

## Next Steps

After completing the integration:

1. ✅ Test thoroughly with real data
2. ✅ Monitor API usage in Google Cloud Console
3. ✅ Add analytics to track search patterns
4. ✅ Consider adding map view (optional)
5. ✅ Implement radius filter (e.g., "within 50km")
6. ✅ Add "Use my current location" button (browser geolocation)

## Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [@react-google-maps/api Documentation](https://react-google-maps-api-docs.netlify.app/)
- [use-places-autocomplete GitHub](https://github.com/wellyshen/use-places-autocomplete)
