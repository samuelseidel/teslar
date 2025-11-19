export interface Ambassador {
  id: string
  user_id: string
  email: string
  full_name: string
  phone: string | null
  city: string
  state: string
  country: string
  zip_code: string | null
  tesla_model: string
  tesla_year: number
  bio: string | null
  profile_image_url: string | null
  available: boolean
  created_at: string
  updated_at: string
}

export interface ContactRequest {
  id: string
  ambassador_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  message: string
  created_at: string
}

export interface AmbassadorFormData {
  full_name: string
  phone?: string
  city: string
  state: string
  country: string
  zip_code?: string
  tesla_model: string
  tesla_year: number
  bio?: string
  profile_image_url?: string
}

export interface ContactFormData {
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  message: string
}
