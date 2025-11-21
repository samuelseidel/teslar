'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface VehicleLocationMapProps {
  latitude: number | null
  longitude: number | null
  city: string
  region: string
  country: string
  vehicleName: string
}

export default function VehicleLocationMap({
  latitude,
  longitude,
  city,
  region,
  country,
  vehicleName,
}: VehicleLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!latitude || !longitude) return

    const initMap = async () => {
      try {
        setIsLoading(true)
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
        })

        const google = await loader.load()

        if (!mapRef.current) return

        // Create map centered on vehicle location
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        })

        // Add a circle to show approximate location (privacy)
        new google.maps.Circle({
          strokeColor: '#DC2626',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#DC2626',
          fillOpacity: 0.15,
          map: mapInstance,
          center: { lat: latitude, lng: longitude },
          radius: 2000, // 2km radius for privacy
        })

        // Add a marker
        new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance,
          title: vehicleName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#DC2626',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        })

        setMap(mapInstance)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading map:', err)
        setError('Failed to load map')
        setIsLoading(false)
      }
    }

    initMap()
  }, [latitude, longitude, vehicleName])

  if (!latitude || !longitude) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-bold text-white">Location</h3>
        </div>
        <div className="space-y-1">
          <p className="text-white font-medium">{city}</p>
          <p className="text-gray-400 text-sm">{region}, {country}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-bold text-white">Location</h3>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden mb-3">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-48 bg-gray-800"></div>
      </div>

      {/* Location Info */}
      <div className="space-y-2 mb-3">
        <p className="text-white font-medium">{city}</p>
        <p className="text-gray-400 text-sm">{region}, {country}</p>
        <p className="text-gray-500 text-xs italic">
          Approximate location shown for privacy
        </p>
      </div>

      {/* Get Directions Button */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Get Directions
      </a>
    </div>
  )
}
