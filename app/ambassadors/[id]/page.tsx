'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ambassador } from '@/lib/types/database.types'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function AmbassadorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    message: ''
  })

  useEffect(() => {
    fetchAmbassador()
  }, [params.id])

  const fetchAmbassador = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('id', params.id)
        .eq('available', true)
        .single()

      if (error) throw error
      setAmbassador(data)
    } catch (error) {
      console.error('Error fetching ambassador:', error)
      setError('Ambassador not found or unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('contact_requests')
        .insert({
          ambassador_id: params.id,
          ...formData
        })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        message: ''
      })

      // Redirect after success
      setTimeout(() => {
        router.push('/ambassadors')
      }, 3000)
    } catch (err) {
      setError('Failed to send contact request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-300 mt-4">Loading ambassador profile...</p>
        </div>
      </div>
    )
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Ambassador Not Found</h1>
          <p className="text-gray-300 mb-6">This ambassador may not be available or does not exist.</p>
          <Link
            href="/ambassadors"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Ambassadors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              Tesla<span className="text-red-500">Connect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/ambassadors" className="text-gray-300 hover:text-white transition-colors">
                Back to Ambassadors
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ambassador Profile */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 h-fit">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{ambassador.full_name}</h1>
                <p className="text-gray-300 text-lg">{ambassador.city}, {ambassador.state}</p>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/50">
                Available
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tesla Model</p>
                  <p className="text-white font-semibold text-lg">
                    {ambassador.tesla_year} {ambassador.tesla_model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold">
                    {ambassador.city}, {ambassador.state}
                  </p>
                </div>
              </div>
            </div>

            {ambassador.bio && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                <p className="text-gray-300 leading-relaxed">{ambassador.bio}</p>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
            <p className="text-gray-300 mb-6">
              Fill out the form below and {ambassador.full_name.split(' ')[0]} will receive your contact information via email.
            </p>

            {success ? (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-green-300">
                  Your contact request has been sent to {ambassador.full_name}. They will reach out to you soon!
                </p>
                <p className="text-gray-400 text-sm mt-4">Redirecting you back...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-200 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="buyer_name"
                    required
                    value={formData.buyer_name}
                    onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="buyer_email" className="block text-sm font-medium text-gray-200 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="buyer_email"
                    required
                    value={formData.buyer_email}
                    onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="buyer_phone" className="block text-sm font-medium text-gray-200 mb-1">
                    Your Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="buyer_phone"
                    value={formData.buyer_phone}
                    onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Hi! I'm interested in learning more about your Tesla and possibly scheduling a test drive..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send Contact Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
