'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.session) {
        // Session exists - email confirmation is disabled
        // User is automatically logged in
        setSuccess(true)
        setNeedsEmailConfirmation(false)
        setTimeout(() => {
          router.push('/ambassador/create')
          router.refresh()
        }, 1500)
      } else if (data.user) {
        // User created but no session - email confirmation required
        setSuccess(true)
        setNeedsEmailConfirmation(true)
        // Don't redirect - show message to check email
      } else {
        setError('Došlo k neočekávané chybě při registraci')
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
            Staňte se ambasadorem
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Již máte účet?{' '}
            <Link href="/auth/login" className="font-medium text-red-500 hover:text-red-400">
              Přihlaste se zde
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/20 border border-green-500 p-4">
              {needsEmailConfirmation ? (
                <div>
                  <p className="text-sm text-green-300 font-semibold mb-2">
                    Účet byl úspěšně vytvořen!
                  </p>
                  <p className="text-sm text-green-300">
                    Zkontrolujte prosím váš e-mail ({email}) a klikněte na potvrzovací odkaz pro aktivaci vašeho účtu.
                  </p>
                  <p className="text-xs text-green-400 mt-2">
                    Po potvrzení se můžete přihlásit a vytvořit váš ambasadorský profil.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-green-300">
                  Účet byl úspěšně vytvořen! Přesměrování na vytvoření profilu...
                </p>
              )}
            </div>
          )}
          <div className="space-y-4">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Heslo
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
                placeholder="Vytvořte heslo (min. 6 znaků)"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                Potvrďte heslo
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
                placeholder="Potvrďte vaše heslo"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Vytváření účtu...' : 'Vytvořit účet'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-300 hover:text-white">
              Zpět na hlavní stránku
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
