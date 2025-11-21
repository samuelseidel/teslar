// Czech regions (kraje)
export const CZECH_REGIONS = [
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
] as const

export type CzechRegion = typeof CZECH_REGIONS[number]

// Tesla models
export const TESLA_MODELS = [
  'Model S',
  'Model 3',
  'Model X',
  'Model Y',
  'Cybertruck',
  'Roadster',
] as const

export type TeslaModel = typeof TESLA_MODELS[number]

// Ambassador interface (user profile)
export interface Ambassador {
  id: string
  user_id: string
  email: string
  full_name: string
  phone: string | null
  city: string
  region: string // Czech region
  country: string
  zip_code: string | null
  bio: string | null
  profile_image_url: string | null
  referral_code: string | null // Tesla referral code
  available: boolean
  created_at: string
  updated_at: string
}

// Vehicle interface (one ambassador can have multiple vehicles)
export interface Vehicle {
  id: string
  ambassador_id: string
  tesla_model: string // e.g., 'Model S', 'Model 3'
  tesla_variant: string | null // e.g., 'Long Range AWD', 'P100D', 'Performance'
  tesla_year: number
  description: string | null // Specific details about this vehicle (color, features, etc.)
  profile_image_url: string | null // Main profile image (square/round) for listings
  images: string[] | null // Array of additional image URLs (up to 5 total)
  available: boolean
  created_at: string
  updated_at: string
}

// Vehicle with ambassador info (for display)
export interface VehicleWithAmbassador extends Vehicle {
  ambassador: Ambassador
}

// Contact request interface (linked to vehicle)
export interface ContactRequest {
  id: string
  vehicle_id: string
  ambassador_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  message: string
  created_at: string
}

// Contact request with vehicle and ambassador info (for dashboard)
export interface ContactRequestWithDetails extends ContactRequest {
  vehicle?: Vehicle
  ambassador?: Ambassador
}

// Form data interfaces
export interface AmbassadorFormData {
  full_name: string
  phone?: string
  city: string
  region: string // Czech region
  country: string
  zip_code?: string
  bio?: string
  profile_image_url?: string
  referral_code?: string // Tesla referral code
}

export interface VehicleFormData {
  tesla_model: string
  tesla_variant?: string // Specific variant like 'Long Range AWD', 'P100D'
  tesla_year: number
  description?: string
  available?: boolean
}

export interface ContactFormData {
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  message: string
}
