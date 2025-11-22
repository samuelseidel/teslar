'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Ambassador } from '@/lib/types/database.types'

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)

      // Fetch ambassador profile if user is logged in
      if (user) {
        const { data: ambassadorData } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setAmbassador(ambassadorData)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      // Fetch ambassador profile when user logs in
      if (session?.user) {
        const { data: ambassadorData } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        setAmbassador(ambassadorData)
      } else {
        setAmbassador(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setShowUserMenu(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">Tesla<span className="text-red-600">Connect</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/vehicles"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Prohlédnout vozidla
            </Link>

            {loading ? (
              <div className="w-24 h-8 bg-gray-700/50 animate-pulse rounded"></div>
            ) : user ? (
              // Logged in state
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  {ambassador?.profile_image_url ? (
                    <img
                      src={ambassador.profile_image_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>

                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/20 rounded-lg shadow-xl overflow-hidden z-20">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Přehled
                        </div>
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Můj profil
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-white/10 hover:text-red-500 transition-colors border-t border-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Odhlásit se
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Logged out state
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Přihlásit se
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Stát se ambasadorem
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
