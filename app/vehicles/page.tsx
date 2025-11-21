'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleWithAmbassador } from '@/lib/types/database.types'
import Link from 'next/link'
import { TESLA_MODEL_NAMES } from '@/lib/constants/tesla-variants'
import LocationSearch, { type LocationResult } from '@/components/LocationSearch'
import { sortByDistance, formatDistance } from '@/lib/utils/distance'
import Navigation from '@/components/Navigation'

type VehicleWithDistance = VehicleWithAmbassador & { distance?: number }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithAmbassador[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null)
  const [filterModel, setFilterModel] = useState('')

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, userLocation, filterModel])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          ambassador:ambassadors(*)
        `)
        .eq('available', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match VehicleWithAmbassador type
      const vehiclesWithAmbassador = (data || []).map((item: any) => ({
        ...item,
        ambassador: item.ambassador,
      })) as VehicleWithAmbassador[]

      setVehicles(vehiclesWithAmbassador)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = [...vehicles]

    // Filter by model if selected
    if (filterModel) {
      filtered = filtered.filter(v => v.tesla_model === filterModel)
    }

    // Sort by distance if user location is set
    if (userLocation) {
      const sortedWithDistance = sortByDistance(
        filtered,
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        (vehicle) => {
          if (vehicle.ambassador.latitude && vehicle.ambassador.longitude) {
            return {
              latitude: vehicle.ambassador.latitude,
              longitude: vehicle.ambassador.longitude,
            }
          }
          return null
        }
      )
      setFilteredVehicles(sortedWithDistance)
    } else {
      setFilteredVehicles(filtered)
    }
  }

  const handleLocationSelect = (location: LocationResult | null) => {
    setUserLocation(location)
  }

  const clearLocationFilter = () => {
    setUserLocation(null)
  }

  const clearModelFilter = () => {
    setFilterModel('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Najít Tesla vozidla
          </h1>
          <p className="text-xl text-gray-300">
            Prohlédněte si dostupná Tesla vozidla pro testovací jízdy ve vaší oblasti
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Vaše lokace
              </label>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Zadejte vaši adresu..."
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-2">
                Model Tesla
              </label>
              <div className="relative">
                <select
                  id="model"
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full h-[50px] px-4 pr-10 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Všechny modely</option>
                  {TESLA_MODEL_NAMES.map((model) => (
                    <option key={model} value={model} className="bg-gray-800">
                      {model}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {/* Clear button for model filter */}
                {filterModel && (
                  <button
                    type="button"
                    onClick={clearModelFilter}
                    className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                    title="Vymazat model"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-gray-300">
            Zobrazeno {filteredVehicles.length} z {vehicles.length} vozidel
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-300 mt-4">Načítání vozidel...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Žádná vozidla nenalezena</h3>
            <p className="text-gray-400">Zkuste upravit filtry pro zobrazení více výsledků</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="block bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:border-red-500/50 transition-all hover:transform hover:scale-105 cursor-pointer"
              >
                {/* Vehicle Image */}
                {vehicle.profile_image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={vehicle.profile_image_url}
                      alt={`${vehicle.tesla_model} ${vehicle.tesla_variant}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-red-900/20 to-gray-900/20 flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                <div className="p-6">
                  {/* Vehicle Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white">
                        {vehicle.tesla_model}
                      </h3>
                      {vehicle.distance !== undefined && (
                        <span className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/50 text-blue-300 text-sm font-semibold rounded-full flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {formatDistance(vehicle.distance)}
                        </span>
                      )}
                    </div>
                    {vehicle.tesla_variant && (
                      <p className="text-red-400 font-medium">{vehicle.tesla_variant}</p>
                    )}
                    <p className="text-gray-400 text-sm">Rok: {vehicle.tesla_year}</p>
                  </div>

                  {/* Ambassador Info */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-gray-400 text-xs mb-1">Majitel</p>
                    <p className="text-white font-medium">
                      {vehicle.ambassador.first_name && vehicle.ambassador.last_name
                        ? `${vehicle.ambassador.first_name} ${vehicle.ambassador.last_name.charAt(0)}.`
                        : vehicle.ambassador.full_name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {vehicle.ambassador.city}, {vehicle.ambassador.region}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
