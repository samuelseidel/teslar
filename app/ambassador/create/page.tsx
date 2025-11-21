'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CZECH_REGIONS, TESLA_MODELS } from '@/lib/types/database.types'

export default function CreateAmbassadorProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    region: '',
    country: 'Česká republika',
    zip_code: '',
    bio: '',
    referral_code: '',
  })

  const [vehicleData, setVehicleData] = useState({
    tesla_model: '',
    tesla_year: new Date().getFullYear(),
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Musíte být přihlášeni k vytvoření profilu')
        setLoading(false)
        return
      }

      // Create ambassador profile
      const { data: ambassador, error: ambassadorError } = await supabase
        .from('ambassadors')
        .insert({
          user_id: user.id,
          email: user.email,
          ...formData
        })
        .select()
        .single()

      if (ambassadorError) {
        setError(ambassadorError.message)
        setLoading(false)
        return
      }

      // Create first vehicle
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          ambassador_id: ambassador.id,
          ...vehicleData
        })

      if (vehicleError) {
        setError(vehicleError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Došlo k neočekávané chybě')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Vytvořte svůj profil ambasadora</h1>
            <p className="text-gray-300">Sdílejte svou zkušenost s Teslou s potenciálními kupci</p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-500/20 border border-red-500 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Osobní údaje</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-200 mb-1">
                    Celé jméno *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Jan Novák"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+420 123 456 789"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Umístění</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-200 mb-1">
                    Město *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Praha"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-200 mb-1">
                    Kraj *
                  </label>
                  <select
                    id="region"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="" className="bg-gray-800">Vyberte kraj</option>
                    {CZECH_REGIONS.map((region) => (
                      <option key={region} value={region} className="bg-gray-800">
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-200 mb-1">
                    PSČ
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="110 00"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-200 mb-1">
                    Země
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={formData.country}
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Tesla Referral Code */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Tesla Referral</h2>
              <div>
                <label htmlFor="referral_code" className="block text-sm font-medium text-gray-200 mb-1">
                  Váš Tesla referral kód
                </label>
                <input
                  type="text"
                  id="referral_code"
                  value={formData.referral_code}
                  onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://ts.la/jan12345"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Potenciální kupci mohou použít váš kód při nákupu Tesly
                </p>
              </div>
            </div>

            {/* First Vehicle */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Vaše první Tesla</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tesla_model" className="block text-sm font-medium text-gray-200 mb-1">
                    Model Tesly *
                  </label>
                  <select
                    id="tesla_model"
                    required
                    value={vehicleData.tesla_model}
                    onChange={(e) => setVehicleData({ ...vehicleData, tesla_model: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="" className="bg-gray-800">Vyberte model</option>
                    {TESLA_MODELS.map((model) => (
                      <option key={model} value={model} className="bg-gray-800">
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tesla_year" className="block text-sm font-medium text-gray-200 mb-1">
                    Rok *
                  </label>
                  <input
                    type="number"
                    id="tesla_year"
                    required
                    min="2008"
                    max={new Date().getFullYear() + 1}
                    value={vehicleData.tesla_year}
                    onChange={(e) => setVehicleData({ ...vehicleData, tesla_year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="vehicle_description" className="block text-sm font-medium text-gray-200 mb-1">
                    Popis vozidla
                  </label>
                  <textarea
                    id="vehicle_description"
                    rows={3}
                    value={vehicleData.description}
                    onChange={(e) => setVehicleData({ ...vehicleData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Např.: Dual Motor, Long Range, Autopilot, červená barva..."
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
                O vás a vaší zkušenosti s Teslou
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Řekněte potenciálním kupcům o své zkušenosti s Teslou. Co na ní milujete? Jak dlouho ji vlastníte?"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Vytváření profilu...' : 'Vytvořit profil'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors text-center"
              >
                Zrušit
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
