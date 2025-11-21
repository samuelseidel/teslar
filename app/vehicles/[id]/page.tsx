'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleWithAmbassador, ContactFormData } from '@/lib/types/database.types'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getCountryFromVin } from '@/lib/utils/vin-utils'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<VehicleWithAmbassador | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContactForm, setShowContactForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    message: '',
  })

  // Helper function to parse power value from MDCR data
  // Handles formats like "225 /", "225", "225 / kW", etc.
  const parsePowerValue = (powerString: string): string | null => {
    if (!powerString) return null

    // Extract numeric value using regex
    const match = powerString.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? match[1] : null
  }

  useEffect(() => {
    fetchVehicle()
  }, [vehicleId])

  const fetchVehicle = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          ambassador:ambassadors(*)
        `)
        .eq('id', vehicleId)
        .single()

      if (error) throw error

      if (!data) {
        router.push('/vehicles')
        return
      }

      setVehicle(data as any)
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      router.push('/vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('contact_requests').insert({
        vehicle_id: vehicleId,
        ambassador_id: vehicle?.ambassador_id,
        ...formData,
      })

      if (error) throw error

      alert('Your message has been sent! The ambassador will contact you soon.')
      setShowContactForm(false)
      setFormData({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        message: '',
      })
    } catch (error) {
      console.error('Error sending contact request:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-300 mt-4">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return null
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
              <Link href="/vehicles" className="text-gray-300 hover:text-white transition-colors">
                Back to Vehicles
              </Link>
              <Link
                href="/auth/signup"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Become Ambassador
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Images */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              {vehicle.profile_image_url ? (
                <img
                  src={vehicle.profile_image_url}
                  alt={`${vehicle.tesla_model} ${vehicle.tesla_variant}`}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-red-900/20 to-gray-900/20 flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {vehicle.images && vehicle.images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 p-4">
                  {vehicle.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${vehicle.tesla_model} image ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-2">
                {vehicle.tesla_model}
              </h1>
              {vehicle.tesla_variant && (
                <p className="text-2xl text-red-400 font-medium mb-4">{vehicle.tesla_variant}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Year</p>
                  <p className="text-white text-lg font-medium">{vehicle.tesla_year}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Availability</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.available
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                  }`}>
                    {vehicle.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {vehicle.description && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{vehicle.description}</p>
                </div>
              )}
            </div>

            {/* Technical Specifications from Registry */}
            {(vehicle.vin || vehicle.vehicle_registry_data) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-white">Technical Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country of Manufacture */}
                  {vehicle.vin && getCountryFromVin(vehicle.vin) && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-400 text-sm font-medium">Country of Manufacture</p>
                      </div>
                      <p className="text-white text-lg font-semibold">{getCountryFromVin(vehicle.vin)}</p>
                    </div>
                  )}

                  {/* Technical data from registry */}
                  {vehicle.vehicle_registry_data && (
                    <>
                      {/* Power */}
                      {vehicle.vehicle_registry_data.MotorMaxVykon && parsePowerValue(vehicle.vehicle_registry_data.MotorMaxVykon) && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <p className="text-gray-400 text-sm font-medium">Power</p>
                          </div>
                          <p className="text-white text-lg font-semibold">{parsePowerValue(vehicle.vehicle_registry_data.MotorMaxVykon)} kW</p>
                        </div>
                      )}

                      {/* Registration Date in Czech Republic */}
                      {vehicle.vehicle_registry_data.DatumPrvniRegistraceVCr && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-400 text-sm font-medium">First Registration (CZ)</p>
                          </div>
                          <p className="text-white text-lg font-semibold">
                            {new Date(vehicle.vehicle_registry_data.DatumPrvniRegistraceVCr).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Registry data source note */}
                {vehicle.vehicle_registry_data && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>
                        Technical specifications retrieved from the Czech Ministry of Transport Vehicle Registry (MDČ Portal).
                        Data is stored at the time of vehicle registration on this platform.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Ambassador Info & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ambassador Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Vehicle Owner</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-medium">{vehicle.ambassador.full_name}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white">
                    {vehicle.ambassador.city}, {vehicle.ambassador.region}
                  </p>
                  <p className="text-gray-400 text-sm">{vehicle.ambassador.country}</p>
                </div>

                {vehicle.ambassador.bio && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">About</p>
                    <p className="text-gray-300 text-sm">{vehicle.ambassador.bio}</p>
                  </div>
                )}

                {vehicle.ambassador.referral_code && (
                  <div>
                    <p className="text-gray-400 text-sm">Tesla Referral Code</p>
                    <p className="text-red-400 font-mono text-sm">{vehicle.ambassador.referral_code}</p>
                  </div>
                )}
              </div>

              {vehicle.available && (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Contact Owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Contact {vehicle.ambassador.full_name}</h3>
            <p className="text-gray-300 mb-6">
              Send a message to request a test drive of this {vehicle.tesla_model}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-200 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="buyer_name"
                  required
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="buyer_email" className="block text-sm font-medium text-gray-200 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="buyer_email"
                  required
                  value={formData.buyer_email}
                  onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="buyer_phone" className="block text-sm font-medium text-gray-200 mb-2">
                  Your Phone
                </label>
                <input
                  type="tel"
                  id="buyer_phone"
                  value={formData.buyer_phone}
                  onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Let them know why you're interested and when you'd like to schedule a test drive..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
