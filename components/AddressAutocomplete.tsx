'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete'
import { Input } from '@/components/ui/input'
import { MapPin, Locate } from 'lucide-react'
import { Button } from '@/components/ui/button'

const libraries: ("places")[] = ["places"]

export interface AddressComponents {
  street?: string
  city: string
  region: string // State/Province/Region
  country: string
  countryCode: string
  zipCode?: string
  latitude: number
  longitude: number
  formattedAddress: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void
  defaultValue?: string
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
  restrictToCountries?: string[] // ISO 3166-1 Alpha-2 country codes (e.g., ['cz', 'sk', 'de'])
}

export default function AddressAutocomplete({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Start typing your address...',
  label,
  required = false,
  className = '',
  restrictToCountries,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  // Use places autocomplete hook
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

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue, false)
    }
  }, [defaultValue, setValue])

  const extractAddressComponents = (addressComponents: google.maps.GeocoderAddressComponent[]): Partial<AddressComponents> => {
    const components: Partial<AddressComponents> = {}

    addressComponents.forEach((component) => {
      const types = component.types

      if (types.includes('street_number') || types.includes('route')) {
        components.street = components.street
          ? `${component.long_name} ${components.street}`
          : component.long_name
      }

      if (types.includes('locality')) {
        components.city = component.long_name
      }

      // For Czech Republic, use 'administrative_area_level_1' for regions (kraje)
      // For other countries, this might be state/province
      if (types.includes('administrative_area_level_1')) {
        components.region = component.long_name
      }

      if (types.includes('country')) {
        components.country = component.long_name
        components.countryCode = component.short_name.toLowerCase()
      }

      if (types.includes('postal_code')) {
        components.zipCode = component.long_name
      }
    })

    // Fallback: If no city found, try sublocality or administrative_area_level_2
    if (!components.city) {
      addressComponents.forEach((component) => {
        if (component.types.includes('sublocality') || component.types.includes('administrative_area_level_2')) {
          components.city = component.long_name
        }
      })
    }

    return components
  }

  const handleSelect = async (description: string) => {
    setValue(description, false)
    clearSuggestions()
    setIsOpen(false)

    try {
      // Get geocode results
      const results = await getGeocode({ address: description })
      const { lat, lng } = await getLatLng(results[0])

      // Extract address components
      const extractedComponents = extractAddressComponents(results[0].address_components)

      // Create full address object
      const addressData: AddressComponents = {
        city: extractedComponents.city || '',
        region: extractedComponents.region || '',
        country: extractedComponents.country || '',
        countryCode: extractedComponents.countryCode || '',
        street: extractedComponents.street,
        zipCode: extractedComponents.zipCode,
        latitude: lat,
        longitude: lng,
        formattedAddress: results[0].formatted_address,
      }

      onAddressSelect(addressData)
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setIsOpen(true)
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
            setValue(formattedAddress, false)

            // Extract and send full address components
            const extractedComponents = extractAddressComponents(results[0].address_components)
            const addressData: AddressComponents = {
              city: extractedComponents.city || '',
              region: extractedComponents.region || '',
              country: extractedComponents.country || '',
              countryCode: extractedComponents.countryCode || '',
              street: extractedComponents.street,
              zipCode: extractedComponents.zipCode,
              latitude,
              longitude,
              formattedAddress,
            }

            onAddressSelect(addressData)
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
        <p className="text-sm text-red-300">Error loading Google Maps. Please check your API key.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400">
        Loading address autocomplete...
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="rounded-md bg-yellow-500/20 border border-yellow-500 p-4">
        <p className="text-sm text-yellow-300">Google Maps API key not configured.</p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="flex gap-2 mb-2">
        <div className="relative flex-1 z-50">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInput}
            onFocus={() => setIsOpen(true)}
            disabled={!ready || isGettingLocation}
            placeholder={placeholder}
            required={required}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:ring-red-500"
          />
        </div>

        {/* Use My Location Button */}
        <Button
          type="button"
          onClick={handleUseMyLocation}
          disabled={!ready || isGettingLocation}
          variant="outline"
          className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex-shrink-0"
        >
          <Locate className={`w-4 h-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
        </Button>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="rounded-md bg-yellow-500/20 border border-yellow-500/50 p-3 mb-2">
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

      {/* No results message */}
      {isOpen && status === 'ZERO_RESULTS' && value && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-2xl px-4 py-3">
          <p className="text-sm text-gray-400">No addresses found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}
