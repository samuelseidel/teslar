import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    throw new Error('createClient should only be called in browser environment')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
