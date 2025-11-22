'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleWithAmbassador, ContactFormData, MEETING_OPTIONS, MeetingOption } from '@/lib/types/database.types'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getCountryFromVin } from '@/lib/utils/vin-utils'
import { formatAmbassadorName } from '@/lib/utils/name-utils'
import ImageGallery from '@/components/ImageGallery'
import VehicleLocationMap from '@/components/VehicleLocationMap'

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

      // Save contact request to database
      const { error } = await supabase.from('contact_requests').insert({
        vehicle_id: vehicleId,
        ambassador_id: vehicle?.ambassador_id,
        ...formData,
      })

      if (error) throw error

      // Send email notification to ambassador
      if (vehicle) {
        try {
          const vehicleName = `${vehicle.tesla_year} ${vehicle.tesla_model}${vehicle.tesla_variant ? ' ' + vehicle.tesla_variant : ''}`
          const vehicleUrl = `${window.location.origin}/vehicles/${vehicleId}`

          const emailResponse = await fetch('/api/send-contact-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ambassadorEmail: vehicle.ambassador.email,
              ambassadorName: formatAmbassadorName(vehicle.ambassador.first_name, vehicle.ambassador.last_name),
              buyerName: formData.buyer_name,
              buyerEmail: formData.buyer_email,
              buyerPhone: formData.buyer_phone || undefined,
              message: formData.message,
              vehicleName,
              vehicleUrl,
            }),
          })

          if (!emailResponse.ok) {
            console.error('Failed to send email notification:', await emailResponse.text())
            // Don't fail the whole operation if email fails
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError)
          // Don't fail the whole operation if email fails
        }
      }

      alert('Vaše zpráva byla odeslána! Ambasador vás brzy kontaktuje.')
      setShowContactForm(false)
      setFormData({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        message: '',
      })
    } catch (error) {
      console.error('Error sending contact request:', error)
      alert('Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-300 mt-4">Načítání detailů vozidla...</p>
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
              Tesla<span className="text-red-600">Connect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/vehicles" className="text-gray-300 hover:text-white transition-colors">
                Zpět na vozidla
              </Link>
              <Link
                href="/auth/signup"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Stát se ambasadorem
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Images - Enhanced Gallery */}
            <ImageGallery
              images={vehicle.images || []}
              profileImage={vehicle.profile_image_url}
              vehicleName={`${vehicle.tesla_model} ${vehicle.tesla_variant || ''} ${vehicle.tesla_year}`}
            />

            {/* Vehicle Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-2">
                Tesla {vehicle.tesla_model} <span className="text-gray-400 font-normal">{vehicle.tesla_year}</span>
              </h1>
              {vehicle.tesla_variant && (
                <p className="text-2xl text-red-600 font-medium mb-6">{vehicle.tesla_variant}</p>
              )}

              {vehicle.description && (
                <div>
                  <p className="text-gray-300 leading-relaxed">{vehicle.description}</p>
                </div>
              )}
            </div>

            {/* Technical Specifications from Registry */}
            {(vehicle.vin || vehicle.vehicle_registry_data) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-white">Technické specifikace</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country of Manufacture */}
                  {vehicle.vin && getCountryFromVin(vehicle.vin) && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-400 text-sm font-medium">Země výroby</p>
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
                            <p className="text-gray-400 text-sm font-medium">Výkon</p>
                          </div>
                          <p className="text-white text-lg font-semibold">{parsePowerValue(vehicle.vehicle_registry_data.MotorMaxVykon)} kW</p>
                        </div>
                      )}

                      {/* Operating Weight */}
                      {vehicle.vehicle_registry_data.HmotnostiProvozni && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <p className="text-gray-400 text-sm font-medium">Provozní hmotnost</p>
                          </div>
                          <p className="text-white text-lg font-semibold">{vehicle.vehicle_registry_data.HmotnostiProvozni} kg</p>
                        </div>
                      )}

                      {/* First Registration Date */}
                      {vehicle.vehicle_registry_data.DatumPrvniRegistrace && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-400 text-sm font-medium">První registrace</p>
                          </div>
                          <p className="text-white text-lg font-semibold">
                            {new Date(vehicle.vehicle_registry_data.DatumPrvniRegistrace).toLocaleDateString('cs-CZ')}
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
                        Technické specifikace získané z českého rejstříku vozidel Ministerstva dopravy (Portál MDČ).
                        Data jsou uložena v okamžiku registrace vozidla na této platformě.
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
              {/* Profile Section - Horizontal Layout */}
              <div className="flex gap-4 mb-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-red-600 bg-gradient-to-br from-red-600 to-red-700 overflow-hidden">
                    {vehicle.ambassador.profile_image_url ? (
                      <img
                        src={vehicle.ambassador.profile_image_url}
                        alt={vehicle.ambassador.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and Basic Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {formatAmbassadorName(vehicle.ambassador.first_name, vehicle.ambassador.last_name)}
                  </h4>
                  <p className="text-gray-400 text-sm">Tesla ambasador</p>
                </div>
              </div>

              {/* Bio */}
              {vehicle.ambassador.bio && (
                <div className="mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{vehicle.ambassador.bio}</p>
                </div>
              )}

              {/* Social Media Links */}
              {(vehicle.ambassador.instagram_url || vehicle.ambassador.facebook_url || vehicle.ambassador.x_url) && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Připojit se</p>
                  <div className="flex gap-2">
                    {vehicle.ambassador.instagram_url && (
                      <a
                        href={vehicle.ambassador.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Instagram"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {vehicle.ambassador.facebook_url && (
                      <a
                        href={vehicle.ambassador.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Facebook"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {vehicle.ambassador.x_url && (
                      <a
                        href={vehicle.ambassador.x_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="X (Twitter)"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tesla Referral Button */}
              {vehicle.ambassador.referral_code && (
                <a
                  href={`https://www.tesla.com/cs_cz/referral/${vehicle.ambassador.referral_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Použít Tesla doporučení
                </a>
              )}

              {/* Contact Button */}
              {vehicle.available && (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full mt-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium border border-white/20"
                >
                  Kontaktovat majitele
                </button>
              )}
            </div>

            {/* Meeting Options */}
            {vehicle.meeting_options && vehicle.meeting_options.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Co můžete zažít</h3>
                <div className="space-y-3">
                  {vehicle.meeting_options.map((option) => (
                    <div key={option} className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-lg border border-white/20">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white font-medium text-sm">{MEETING_OPTIONS[option as MeetingOption]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            <VehicleLocationMap
              latitude={vehicle.ambassador.latitude}
              longitude={vehicle.ambassador.longitude}
              city={vehicle.ambassador.city}
              region={vehicle.ambassador.region}
              country={vehicle.ambassador.country}
              vehicleName={`${vehicle.tesla_model} ${vehicle.tesla_variant || ''}`}
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-red-900/20 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30 transform hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Jak to funguje?
              </h3>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Jsme <span className="text-blue-400 font-semibold">komunita nadšenců</span>, kteří věří v sílu autentických zkušeností.
                Žádné prodejce, žádný marketing – jen <span className="text-purple-400 font-semibold">reální lidé</span> sdílející svou vášeň.
              </p>
            </div>

            {/* Three Principles Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {/* Voluntary - Enhanced */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:shadow-green-500/70 transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-xl text-center mb-3">Z lásky k věci</h4>
                <p className="text-gray-200 text-center leading-relaxed">
                  Každý ambasador je tady dobrovolně, protože <strong className="text-green-400">miluje</strong> elektromobilitu.
                  Bez povinností, bez očekávání – jen čistá vášeň a radost ze sdílení.
                </p>
              </div>

              {/* Free - Enhanced */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-xl text-center mb-3">Vždy zdarma</h4>
                <p className="text-gray-200 text-center leading-relaxed">
                  Spojení, rozhovory, zkušenosti – vše <strong className="text-blue-400">kompletně zdarma</strong>.
                  Bez skrytých poplatků, bez provizí. Protože znalosti by měly být pro každého.
                </p>
              </div>

              {/* Gifts Welcome - Enhanced */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-xl text-center mb-3">Pozornost potěší</h4>
                <p className="text-gray-200 text-center leading-relaxed">
                  Když si užijete skvělý čas, malé <strong className="text-purple-400">gesto vděčnosti</strong> vždy potěší –
                  třeba káva nebo příspěvek na nabití. Ale nikdy to není podmínka!
                </p>
              </div>
            </div>

            {/* Mission Statement - Enhanced */}
            <div className="bg-gradient-to-r from-red-600/30 via-purple-600/30 to-blue-600/30 rounded-2xl p-8 border-2 border-white/30 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-white font-bold text-2xl mb-3">Naše mise</h5>
                  <p className="text-gray-100 text-lg leading-relaxed">
                    Pomáháme tisícům lidí učinit <strong className="text-yellow-300">nejlepší rozhodnutí</strong> ohledně
                    elektromobility díky autentickým zkušenostem od skutečných majitelů.
                    <span className="block mt-2 text-blue-200">
                      Žádný prodejní tlak. Žádné předstírání. Jen upřímné odpovědi a sdílená vášeň pro udržitelnou budoucnost. 🌍⚡
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
                <div className="text-sm text-gray-300">Autentické</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-green-400 mb-1">0 Kč</div>
                <div className="text-sm text-gray-300">Poplatky</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-purple-400 mb-1">∞</div>
                <div className="text-sm text-gray-300">Zkušenosti</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-red-400 mb-1">❤️</div>
                <div className="text-sm text-gray-300">Komunita</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Kontaktovat {formatAmbassadorName(vehicle.ambassador.first_name, vehicle.ambassador.last_name)}</h3>
            <p className="text-gray-300 mb-6">
              Pošlete zprávu a domluvte si testovací jízdu s tímto {vehicle.tesla_model}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-200 mb-2">
                  Vaše jméno *
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
                  Váš email *
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
                  Váš telefon
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
                  Zpráva *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Napište, proč máte zájem a kdy byste chtěli domluvit testovací jízdu..."
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
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Odesílání...' : 'Odeslat zprávu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
