// Re-export from countries for backward compatibility
export { CZECH_REGIONS } from '@/lib/constants/countries'

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
  region: string // Administrative division (state, kraj, Bundesland, etc.)
  country: string // Country name (localized)
  country_code: string | null // ISO 3166-1 alpha-2 code (e.g., 'CZ', 'US', 'DE')
  zip_code: string | null
  latitude: number | null // Latitude from Google Maps Geocoding API
  longitude: number | null // Longitude from Google Maps Geocoding API
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
  vin: string | null // Vehicle Identification Number (17-character unique identifier)
  vehicle_registry_data: any | null // Complete vehicle data from Czech Vehicle Registry (MDČ Portal API)
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
  region: string // Administrative division (state, kraj, etc.)
  country: string // Country name (localized)
  country_code?: string // ISO country code
  zip_code?: string
  bio?: string
  profile_image_url?: string
  referral_code?: string // Tesla referral code
}

export interface VehicleFormData {
  vin?: string // Vehicle Identification Number (optional, can be auto-filled via API)
  vehicle_registry_data?: any // Complete vehicle data from API (stored once during creation)
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
