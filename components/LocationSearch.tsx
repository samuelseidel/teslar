'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete'
import { Input } from '@/components/ui/input'
import { Search, MapPin, X, Locate } from 'lucide-react'
import { Button } from '@/components/ui/button'

const libraries: ("places")[] = ["places"]

export interface LocationResult {
  latitude: number
  longitude: number
  formattedAddress: string
  city?: string
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult | null) => void
  placeholder?: string
  className?: string
  restrictToCountries?: string[]
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = 'Hledat podle města nebo adresy...',
  className = '',
  restrictToCountries = ['cz'], // Default to Czech Republic only
}: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: restrictToCountries ? { country: restrictToCountries } : undefined,
    },
    debounce: 300,
  })

  const handleSelect = async (description: string) => {
    setValue(description, false)
    clearSuggestions()
    setIsOpen(false)

    try {
      const results = await getGeocode({ address: description })
      const { lat, lng } = await getLatLng(results[0])

      // Extract city from address components
      let city: string | undefined
      results[0].address_components.forEach((component) => {
        if (component.types.includes('locality')) {
          city = component.long_name
        }
      })

      const location: LocationResult = {
        latitude: lat,
        longitude: lng,
        formattedAddress: results[0].formatted_address,
        city,
      }

      setSelectedLocation(location)
      onLocationSelect(location)
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }

  const handleClear = () => {
    setValue('', false)
    setSelectedLocation(null)
    onLocationSelect(null)
    clearSuggestions()
    setIsOpen(false)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setIsOpen(true)
    if (!e.target.value) {
      handleClear()
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Reverse geocode to get address
          const results = await getGeocode({
            location: { lat: latitude, lng: longitude },
          })

          if (results && results.length > 0) {
            const formattedAddress = results[0].formatted_address

            // Extract city from address components
            let city: string | undefined
            results[0].address_components.forEach((component) => {
              if (component.types.includes('locality')) {
                city = component.long_name
              }
            })

            const location: LocationResult = {
              latitude,
              longitude,
              formattedAddress,
              city,
            }

            setValue(formattedAddress, false)
            setSelectedLocation(location)
            onLocationSelect(location)
            setIsOpen(false)
          }
        } catch (error) {
          console.error('Error reverse geocoding location:', error)
          setLocationError('Could not determine your address')
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsGettingLocation(false)

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out')
            break
          default:
            setLocationError('An error occurred while getting your location')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  if (loadError) {
    return (
      <div className="rounded-md bg-red-500/20 border border-red-500 p-4">
        <p className="text-sm text-red-300">Error loading maps. Please refresh the page.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400">
        Loading...
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return null // Silently fail if no API key
  }

  return (
    <div className={`${className}`}>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1 z-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInput}
            onFocus={() => setIsOpen(true)}
            disabled={!ready || isGettingLocation}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:ring-red-500"
          />
          {value && !isGettingLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10"
            >
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          )}
        </div>

        {/* Use My Location Button */}
        <Button
          type="button"
          onClick={handleUseMyLocation}
          disabled={!ready || isGettingLocation}
          variant="outline"
          className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex-shrink-0"
        >
          <Locate className={`w-4 h-4 mr-2 ${isGettingLocation ? 'animate-pulse' : ''}`} />
          {isGettingLocation ? 'Getting location...' : 'Use My Location'}
        </Button>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="rounded-md bg-yellow-500/20 border border-yellow-500/50 p-3">
          <p className="text-sm text-yellow-300">{locationError}</p>
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && status === 'OK' && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion

            return (
              <button
                key={place_id}
                type="button"
                onClick={() => handleSelect(suggestion.description)}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">{main_text}</p>
                    <p className="text-sm text-gray-400">{secondary_text}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
