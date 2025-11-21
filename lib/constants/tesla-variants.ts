// Complete Tesla Model Variants with Year Availability
// Based on actual production years for each variant

export interface TeslaVariantInfo {
  name: string
  yearStart: number
  yearEnd: number | null // null means still in production
}

export const TESLA_VARIANTS = {
  'Model S': [
    // Battery-based naming (discontinued)
    { name: '60', yearStart: 2012, yearEnd: 2015 },
    { name: '60D', yearStart: 2015, yearEnd: 2016 },
    { name: '70', yearStart: 2015, yearEnd: 2016 },
    { name: '70D', yearStart: 2015, yearEnd: 2016 },
    { name: '75', yearStart: 2016, yearEnd: 2017 },
    { name: '75D', yearStart: 2016, yearEnd: 2018 },
    { name: '85', yearStart: 2012, yearEnd: 2016 },
    { name: '85D', yearStart: 2015, yearEnd: 2016 },
    { name: 'P85', yearStart: 2012, yearEnd: 2015 },
    { name: 'P85+', yearStart: 2013, yearEnd: 2014 },
    { name: 'P85D', yearStart: 2015, yearEnd: 2016 },
    { name: '90D', yearStart: 2016, yearEnd: 2017 },
    { name: 'P90D', yearStart: 2016, yearEnd: 2017 },
    { name: '100D', yearStart: 2017, yearEnd: 2020 },
    { name: 'P100D', yearStart: 2016, yearEnd: 2020 },
    // Modern naming
    { name: 'Standard Range', yearStart: 2019, yearEnd: 2020 },
    { name: 'Long Range', yearStart: 2019, yearEnd: null },
    { name: 'Performance', yearStart: 2019, yearEnd: 2020 },
    { name: 'Plaid', yearStart: 2021, yearEnd: null },
  ] as TeslaVariantInfo[],

  'Model 3': [
    { name: 'Standard Range', yearStart: 2017, yearEnd: 2019 },
    { name: 'Standard Range Plus', yearStart: 2019, yearEnd: 2021 },
    { name: 'Long Range RWD', yearStart: 2017, yearEnd: 2018 },
    { name: 'Long Range AWD', yearStart: 2018, yearEnd: null },
    { name: 'Performance', yearStart: 2018, yearEnd: null },
  ] as TeslaVariantInfo[],

  'Model X': [
    // Battery-based naming
    { name: '60D', yearStart: 2015, yearEnd: 2016 },
    { name: '75D', yearStart: 2016, yearEnd: 2019 },
    { name: '90D', yearStart: 2015, yearEnd: 2017 },
    { name: 'P90D', yearStart: 2016, yearEnd: 2017 },
    { name: '100D', yearStart: 2017, yearEnd: 2020 },
    { name: 'P100D', yearStart: 2016, yearEnd: 2020 },
    // Modern naming
    { name: 'Long Range', yearStart: 2019, yearEnd: null },
    { name: 'Plaid', yearStart: 2021, yearEnd: null },
  ] as TeslaVariantInfo[],

  'Model Y': [
    { name: 'Standard Range RWD', yearStart: 2021, yearEnd: 2022 },
    { name: 'Long Range RWD', yearStart: 2024, yearEnd: null },
    { name: 'Long Range AWD', yearStart: 2020, yearEnd: 2024 },
    { name: 'Premium RWD', yearStart: 2024, yearEnd: null },
    { name: 'Premium AWD', yearStart: 2024, yearEnd: null },
    { name: 'Performance', yearStart: 2020, yearEnd: null },
  ] as TeslaVariantInfo[],

  'Cybertruck': [
    { name: 'Single Motor RWD', yearStart: 2024, yearEnd: null },
    { name: 'Dual Motor AWD', yearStart: 2024, yearEnd: null },
    { name: 'Tri Motor AWD', yearStart: 2024, yearEnd: null },
    { name: 'Cyberbeast', yearStart: 2024, yearEnd: null },
  ] as TeslaVariantInfo[],

  'Roadster': [
    { name: 'Base', yearStart: 2008, yearEnd: 2012 },
    { name: 'Sport', yearStart: 2009, yearEnd: 2012 },
    { name: '2.5', yearStart: 2010, yearEnd: 2012 },
    { name: 'Founders Series', yearStart: 2023, yearEnd: null }, // Next-gen Roadster
  ] as TeslaVariantInfo[],
} as const

export type TeslaModelName = keyof typeof TESLA_VARIANTS

// Helper function to get variants available for a specific model and year
export function getVariantsForModelAndYear(
  model: TeslaModelName,
  year: number
): TeslaVariantInfo[] {
  const allVariants = TESLA_VARIANTS[model]
  const currentYear = new Date().getFullYear()

  return allVariants.filter(variant => {
    const endYear = variant.yearEnd ?? currentYear + 1 // If still in production, use next year
    return year >= variant.yearStart && year <= endYear
  })
}

// Helper function to get all variants for a model (for display purposes)
export function getAllVariantsForModel(model: TeslaModelName): string[] {
  return TESLA_VARIANTS[model].map(v => v.name)
}

// Helper to get year range for a model
export function getYearRangeForModel(model: TeslaModelName): { min: number; max: number } {
  const variants = TESLA_VARIANTS[model]
  const years = variants.flatMap(v => [v.yearStart, v.yearEnd ?? new Date().getFullYear()])
  return {
    min: Math.min(...years),
    max: Math.max(...years),
  }
}

// Flat list of all models for selection
export const TESLA_MODEL_NAMES: readonly TeslaModelName[] = Object.keys(TESLA_VARIANTS) as TeslaModelName[]

// Helper function to normalize API model names to our internal format
// API returns "MODEL 3", "MODEL S", etc. (all caps)
// We use "Model 3", "Model S", etc. (title case)
export function normalizeModelName(apiModelName: string): TeslaModelName | null {
  const normalized = apiModelName
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Check if the normalized name is a valid TeslaModelName
  if (TESLA_MODEL_NAMES.includes(normalized as TeslaModelName)) {
    return normalized as TeslaModelName
  }

  return null
}

// Human-readable descriptions for variants (Czech)
export const VARIANT_DESCRIPTIONS: Record<string, string> = {
  // Battery capacity based
  '60': '60 kWh baterie',
  '60D': '60 kWh baterie, AWD',
  '70': '70 kWh baterie',
  '70D': '70 kWh baterie, AWD',
  '75': '75 kWh baterie',
  '75D': '75 kWh baterie, AWD',
  '85': '85 kWh baterie',
  '85D': '85 kWh baterie, AWD',
  'P85': '85 kWh baterie, Performance',
  'P85+': '85 kWh baterie, Performance Plus',
  'P85D': '85 kWh baterie, Performance, AWD',
  '90D': '90 kWh baterie, AWD',
  'P90D': '90 kWh baterie, Performance, AWD',
  '100D': '100 kWh baterie, AWD',
  'P100D': '100 kWh baterie, Performance, AWD',

  // Modern naming
  'Standard Range': 'Standardní dojezd',
  'Standard Range Plus': 'Standardní dojezd Plus',
  'Standard Range RWD': 'Standardní dojezd, zadní pohon',
  'Long Range': 'Dlouhý dojezd',
  'Long Range RWD': 'Dlouhý dojezd, zadní pohon',
  'Long Range AWD': 'Dlouhý dojezd, pohon všech kol',
  'Premium RWD': 'Premium, zadní pohon',
  'Premium AWD': 'Premium, pohon všech kol',
  'Performance': 'Performance',
  'Plaid': 'Plaid',

  // Cybertruck
  'Single Motor RWD': 'Jednorychlostní, zadní pohon',
  'Dual Motor AWD': 'Dvourychlostní, pohon všech kol',
  'Tri Motor AWD': 'Třírychlostní, pohon všech kol',
  'Cyberbeast': 'Cyberbeast',

  // Roadster
  'Base': 'Základní',
  'Sport': 'Sport',
  '2.5': '2.5',
  'Founders Series': 'Founders Series',
}
