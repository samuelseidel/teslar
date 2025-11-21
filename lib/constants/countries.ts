/**
 * Countries and Regions Configuration
 *
 * This file defines all supported countries and their administrative divisions.
 * Add new countries here to extend platform support.
 */

export interface CountryRegion {
  code: string        // ISO 3166-1 alpha-2
  name: string        // Localized country name
  nameEn: string      // English name
  regions: string[]   // Administrative divisions (states, kraje, Bundesländer, etc.)
  regionType: string  // Type of division (for display)
}

export const COUNTRIES: Record<string, CountryRegion> = {
  // Czech Republic
  CZ: {
    code: 'CZ',
    name: 'Česká republika',
    nameEn: 'Czech Republic',
    regionType: 'kraj',
    regions: [
      'Praha',
      'Středočeský kraj',
      'Jihočeský kraj',
      'Plzeňský kraj',
      'Karlovarský kraj',
      'Ústecký kraj',
      'Liberecký kraj',
      'Královéhradecký kraj',
      'Pardubický kraj',
      'Vysočina',
      'Jihomoravský kraj',
      'Olomoucký kraj',
      'Zlínský kraj',
      'Moravskoslezský kraj',
    ],
  },

  // United States
  US: {
    code: 'US',
    name: 'United States',
    nameEn: 'United States',
    regionType: 'state',
    regions: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming',
    ],
  },

  // Germany
  DE: {
    code: 'DE',
    name: 'Deutschland',
    nameEn: 'Germany',
    regionType: 'Bundesland',
    regions: [
      'Baden-Württemberg',
      'Bayern',
      'Berlin',
      'Brandenburg',
      'Bremen',
      'Hamburg',
      'Hessen',
      'Mecklenburg-Vorpommern',
      'Niedersachsen',
      'Nordrhein-Westfalen',
      'Rheinland-Pfalz',
      'Saarland',
      'Sachsen',
      'Sachsen-Anhalt',
      'Schleswig-Holstein',
      'Thüringen',
    ],
  },

  // Austria
  AT: {
    code: 'AT',
    name: 'Österreich',
    nameEn: 'Austria',
    regionType: 'Bundesland',
    regions: [
      'Wien',
      'Niederösterreich',
      'Oberösterreich',
      'Steiermark',
      'Kärnten',
      'Salzburg',
      'Tirol',
      'Vorarlberg',
      'Burgenland',
    ],
  },

  // Poland
  PL: {
    code: 'PL',
    name: 'Polska',
    nameEn: 'Poland',
    regionType: 'województwo',
    regions: [
      'dolnośląskie',
      'kujawsko-pomorskie',
      'lubelskie',
      'lubuskie',
      'łódzkie',
      'małopolskie',
      'mazowieckie',
      'opolskie',
      'podkarpackie',
      'podlaskie',
      'pomorskie',
      'śląskie',
      'świętokrzyskie',
      'warmińsko-mazurskie',
      'wielkopolskie',
      'zachodniopomorskie',
    ],
  },

  // Slovakia
  SK: {
    code: 'SK',
    name: 'Slovensko',
    nameEn: 'Slovakia',
    regionType: 'kraj',
    regions: [
      'Bratislavský kraj',
      'Trnavský kraj',
      'Trenčiansky kraj',
      'Nitriansky kraj',
      'Žilinský kraj',
      'Banskobystrický kraj',
      'Prešovský kraj',
      'Košický kraj',
    ],
  },

  // Add more countries as needed:
  // - Switzerland
  // - Netherlands
  // - Belgium
  // - France
  // - United Kingdom
  // - Norway
  // - Sweden
  // - Denmark
}

// Helper functions

/**
 * Get country by code
 */
export function getCountry(code: string): CountryRegion | undefined {
  return COUNTRIES[code.toUpperCase()]
}

/**
 * Get all supported country codes
 */
export function getCountryCodes(): string[] {
  return Object.keys(COUNTRIES)
}

/**
 * Get all supported countries as array
 */
export function getCountriesList(): CountryRegion[] {
  return Object.values(COUNTRIES)
}

/**
 * Get regions for a specific country
 */
export function getRegionsForCountry(countryCode: string): string[] {
  const country = getCountry(countryCode)
  return country?.regions || []
}

/**
 * Validate if a region exists for a country
 */
export function isValidRegion(countryCode: string, region: string): boolean {
  const regions = getRegionsForCountry(countryCode)
  return regions.includes(region)
}

/**
 * Get country name (localized or English)
 */
export function getCountryName(countryCode: string, useEnglish = false): string {
  const country = getCountry(countryCode)
  if (!country) return countryCode
  return useEnglish ? country.nameEn : country.name
}

// Default country (for backward compatibility)
export const DEFAULT_COUNTRY = 'CZ'
export const DEFAULT_COUNTRY_NAME = 'Česká republika'

// Export legacy constant for backward compatibility
export const CZECH_REGIONS = COUNTRIES.CZ.regions
