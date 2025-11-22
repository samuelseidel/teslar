'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      // Get the current origin for the redirect URL
      const origin = window.location.origin

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Došlo k neočekávané chybě')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Obnovení hesla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Zadejte svou e-mailovou adresu a my vám pošleme odkaz pro obnovení hesla.
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-md bg-green-500/20 border border-green-500 p-4">
              <p className="text-sm text-green-300">
                Odkaz pro obnovení hesla byl odeslán na adresu <strong>{email}</strong>. Zkontrolujte prosím svou e-mailovou schránku.
              </p>
            </div>
            <div className="text-center space-y-2">
              <Link href="/auth/login" className="block text-sm text-gray-300 hover:text-white">
                Zpět na přihlášení
              </Link>
              <Link href="/" className="block text-sm text-gray-300 hover:text-white">
                Zpět na hlavní stránku
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetRequest}>
            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                E-mailová adresa
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Zadejte váš e-mail"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Odesílání...' : 'Odeslat odkaz pro obnovení'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link href="/auth/login" className="block text-sm text-gray-300 hover:text-white">
                Zpět na přihlášení
              </Link>
              <Link href="/" className="block text-sm text-gray-300 hover:text-white">
                Zpět na hlavní stránku
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
