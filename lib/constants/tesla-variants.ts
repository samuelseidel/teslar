// Complete Tesla Model Variants Database

export const TESLA_MODELS = {
  'Model S': [
    // Battery-based naming (2012-2019)
    '60',
    '60D',
    '70',
    '70D',
    '75',
    '75D',
    '85',
    '85D',
    'P85',
    'P85+',
    'P85D',
    '90D',
    'P90D',
    '100D',
    'P100D',
    // Modern naming (2019+)
    'Standard Range',
    'Long Range',
    'Performance',
    'Plaid',
  ] as const,

  'Model 3': [
    'Standard Range',
    'Standard Range Plus',
    'Long Range RWD',
    'Long Range AWD',
    'Performance',
  ] as const,

  'Model X': [
    // Battery-based naming (discontinued)
    '60D',
    '75D',
    '90D',
    'P90D',
    '100D',
    'P100D',
    // Modern naming
    'Long Range',
    'Plaid',
  ] as const,

  'Model Y': [
    'Standard Range RWD',
    'Long Range RWD',
    'Long Range AWD',
    'Premium RWD',
    'Premium AWD',
    'Performance',
  ] as const,

  'Cybertruck': [
    'Single Motor RWD',
    'Dual Motor AWD',
    'Tri Motor AWD',
    'Cyberbeast',
  ] as const,

  'Roadster': [
    'Base',
    'Founders Series',
  ] as const,
} as const

export type TeslaModelName = keyof typeof TESLA_MODELS
export type TeslaVariant<T extends TeslaModelName> = typeof TESLA_MODELS[T][number]

// Helper function to get variants for a specific model
export function getVariantsForModel(model: TeslaModelName): readonly string[] {
  return TESLA_MODELS[model]
}

// Flat list of all models for selection
export const TESLA_MODEL_NAMES: readonly TeslaModelName[] = Object.keys(TESLA_MODELS) as TeslaModelName[]
