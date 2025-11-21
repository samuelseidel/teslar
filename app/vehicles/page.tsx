'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleWithAmbassador } from '@/lib/types/database.types'
import Link from 'next/link'
import { getCountriesList, getRegionsForCountry, getCountry } from '@/lib/constants/countries'
import { TESLA_MODEL_NAMES } from '@/lib/constants/tesla-variants'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithAmbassador[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithAmbassador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [availableRegions, setAvailableRegions] = useState<string[]>([])

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchCity, filterCountry, filterRegion, filterModel])

  useEffect(() => {
    if (filterCountry) {
      setAvailableRegions(getRegionsForCountry(filterCountry))
      // Reset region if it's not valid for the new country
      if (filterRegion && !getRegionsForCountry(filterCountry).includes(filterRegion)) {
        setFilterRegion('')
      }
    } else {
      setAvailableRegions([])
    }
  }, [filterCountry])

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

    if (searchCity) {
      filtered = filtered.filter(v =>
        v.ambassador.city.toLowerCase().includes(searchCity.toLowerCase())
      )
    }

    if (filterCountry) {
      filtered = filtered.filter(v => v.ambassador.country_code === filterCountry)
    }

    if (filterRegion) {
      filtered = filtered.filter(v => v.ambassador.region === filterRegion)
    }

    if (filterModel) {
      filtered = filtered.filter(v => v.tesla_model === filterModel)
    }

    setFilteredVehicles(filtered)
  }

  const clearFilters = () => {
    setSearchCity('')
    setFilterCountry('')
    setFilterRegion('')
    setFilterModel('')
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
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Tesla Vehicles
          </h1>
          <p className="text-xl text-gray-300">
            Browse available Tesla vehicles for test drives in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-200 mb-2">
                Search by City
              </label>
              <input
                type="text"
                id="city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-200 mb-2">
                Filter by Country
              </label>
              <select
                id="country"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Countries</option>
                {getCountriesList().map((country) => (
                  <option key={country.code} value={country.code} className="bg-gray-800">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-200 mb-2">
                {filterCountry ? getCountry(filterCountry)?.regionType || 'Region' : 'Region'}
              </label>
              <select
                id="region"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                disabled={!filterCountry}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <option value="">
                  {filterCountry ? 'All Regions' : 'Select country first'}
                </option>
                {availableRegions.map((region) => (
                  <option key={region} value={region} className="bg-gray-800">
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-2">
                Filter by Model
              </label>
              <select
                id="model"
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Models</option>
                {TESLA_MODEL_NAMES.map((model) => (
                  <option key={model} value={model} className="bg-gray-800">
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 text-gray-300">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-300 mt-4">Loading vehicles...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No vehicles found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:border-red-500/50 transition-all hover:transform hover:scale-105"
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
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {vehicle.tesla_model}
                    </h3>
                    {vehicle.tesla_variant && (
                      <p className="text-red-400 font-medium">{vehicle.tesla_variant}</p>
                    )}
                    <p className="text-gray-400 text-sm">Year: {vehicle.tesla_year}</p>
                  </div>

                  {vehicle.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {vehicle.description}
                    </p>
                  )}

                  {/* Ambassador Info */}
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <p className="text-gray-400 text-xs mb-1">Owner</p>
                    <p className="text-white font-medium">{vehicle.ambassador.full_name}</p>
                    <p className="text-gray-400 text-sm">
                      {vehicle.ambassador.city}, {vehicle.ambassador.region}
                    </p>
                  </div>

                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="block w-full text-center bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    View Details & Contact
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
