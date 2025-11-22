'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setValidSession(true)
      } else {
        setError('Neplatný nebo vypršený odkaz pro obnovení hesla. Požádejte prosím o nový odkaz.')
      }
    }

    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Hesla se neshodují')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
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
            Nové heslo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Zadejte své nové heslo
          </p>
        </div>

        {!validSession ? (
          <div className="space-y-6">
            <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
            <div className="text-center space-y-2">
              <Link href="/auth/forgot-password" className="block text-sm font-medium text-red-500 hover:text-red-400">
                Požádat o nový odkaz
              </Link>
              <Link href="/auth/login" className="block text-sm text-gray-300 hover:text-white">
                Zpět na přihlášení
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="rounded-md bg-green-500/20 border border-green-500 p-4">
              <p className="text-sm text-green-300">
                Heslo bylo úspěšně změněno! Přesměrování na dashboard...
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Nové heslo
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Alespoň 6 znaků"
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                  Potvrďte nové heslo
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Zadejte heslo znovu"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Ukládání...' : 'Změnit heslo'}
              </button>
            </div>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white">
                Zpět na přihlášení
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
