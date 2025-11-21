'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ambassador } from '@/lib/types/database.types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

const TESLA_MODELS = ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster']

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [filteredAmbassadors, setFilteredAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchAmbassadors()
  }, [])

  useEffect(() => {
    filterAmbassadors()
  }, [ambassadors, searchCity, filterState, filterModel])

  const fetchAmbassadors = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAmbassadors(data || [])
    } catch (error) {
      console.error('Error fetching ambassadors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAmbassadors = () => {
    let filtered = [...ambassadors]

    if (searchCity) {
      filtered = filtered.filter(amb =>
        amb.city.toLowerCase().includes(searchCity.toLowerCase())
      )
    }

    if (filterState) {
      filtered = filtered.filter(amb => amb.region === filterState)
    }

    // TODO: Update this to filter by vehicles table
    // if (filterModel) {
    //   filtered = filtered.filter(amb => amb.tesla_model === filterModel)
    // }

    setFilteredAmbassadors(filtered)
  }

  const clearFilters = () => {
    setSearchCity('')
    setFilterState('')
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
            Find Tesla Ambassadors
          </h1>
          <p className="text-xl text-gray-300">
            Connect with Tesla owners in your area for a test drive
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label htmlFor="state" className="block text-sm font-medium text-gray-200 mb-2">
                Filter by State
              </label>
              <select
                id="state"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All States</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state} className="bg-gray-800">
                    {state}
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
                {TESLA_MODELS.map((model) => (
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
            Showing {filteredAmbassadors.length} of {ambassadors.length} ambassadors
          </div>
        </div>

        {/* Ambassadors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-300 mt-4">Loading ambassadors...</p>
          </div>
        ) : filteredAmbassadors.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No ambassadors found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbassadors.map((ambassador) => (
              <div
                key={ambassador.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-red-500/50 transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{ambassador.full_name}</h3>
                    <p className="text-gray-400">{ambassador.city}, {ambassador.region}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/50">
                    Available
                  </span>
                </div>

                {ambassador.bio && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {ambassador.bio}
                  </p>
                )}

                <Link
                  href={`/ambassadors/${ambassador.id}`}
                  className="block w-full text-center bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Contact Ambassador
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
