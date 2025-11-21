/**
 * VIN (Vehicle Identification Number) utility functions
 */

export interface VinManufacturerInfo {
  wmi: string
  country: string
  manufacturer: string
  models: string
  notes: string
}

/**
 * Tesla VIN WMI (World Manufacturer Identifier) codes mapping
 * WMI is the first 3 characters of the VIN
 */
export const TESLA_VIN_MANUFACTURERS: Record<string, VinManufacturerInfo> = {
  '5YJ': {
    wmi: '5YJ',
    country: 'USA',
    manufacturer: 'Tesla, Inc.',
    models: 'Model S, Model 3',
    notes: 'Legacy Passenger Cars, Panasonic Supply Chain',
  },
  '7SA': {
    wmi: '7SA',
    country: 'USA',
    manufacturer: 'Tesla, Inc.',
    models: 'Model X, Model Y',
    notes: 'MPV/SUV Classification, Structural & Non-Structural Packs',
  },
  '7G2': {
    wmi: '7G2',
    country: 'USA',
    manufacturer: 'Tesla, Inc.',
    models: 'Cybertruck, Semi',
    notes: 'Light & Heavy Duty Trucks, Class 8 Compliance',
  },
  'LRW': {
    wmi: 'LRW',
    country: 'China',
    manufacturer: 'Tesla (Shanghai) Co.',
    models: 'Model 3, Model Y',
    notes: 'LFP Chemistries (CATL), Export Hub Quality',
  },
  'XP7': {
    wmi: 'XP7',
    country: 'Germany',
    manufacturer: 'Tesla Germany GmbH',
    models: 'Model Y',
    notes: 'Advanced Paint, BYD Structural Packs, Euro Suspension',
  },
  'SFZ': {
    wmi: 'SFZ',
    country: 'UK',
    manufacturer: 'Tesla (Lotus)',
    models: 'Roadster (Gen 1)',
    notes: 'Historical Significance, Lotus Glider Assembly',
  },
}

/**
 * Get country of manufacture from VIN
 * @param vin - Vehicle Identification Number
 * @returns Country name or null if not found
 */
export function getCountryFromVin(vin: string | null | undefined): string | null {
  if (!vin || vin.length < 3) return null

  const wmi = vin.substring(0, 3).toUpperCase()
  const info = TESLA_VIN_MANUFACTURERS[wmi]

  return info ? info.country : null
}

/**
 * Get full manufacturer info from VIN
 * @param vin - Vehicle Identification Number
 * @returns Manufacturer info or null if not found
 */
export function getManufacturerInfoFromVin(
  vin: string | null | undefined
): VinManufacturerInfo | null {
  if (!vin || vin.length < 3) return null

  const wmi = vin.substring(0, 3).toUpperCase()
  return TESLA_VIN_MANUFACTURERS[wmi] || null
}
