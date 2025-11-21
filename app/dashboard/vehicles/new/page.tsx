'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VehicleFormData } from '@/lib/types/database.types'
import {
  TESLA_MODEL_NAMES,
  TeslaModelName,
  getVariantsForModelAndYear,
  getYearRangeForModel,
  normalizeModelName,
} from '@/lib/constants/tesla-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import MultiImageUpload from '@/components/MultiImageUpload'
import { uploadVehicleProfileImage, uploadVehicleImages } from '@/lib/supabase/storage'

export default function NewVehiclePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<VehicleFormData>({
    tesla_model: '',
    tesla_variant: '',
    tesla_year: new Date().getFullYear(),
    description: '',
    available: true,
  })

  // VIN lookup state
  const [vinInput, setVinInput] = useState('')
  const [isLookingUpVin, setIsLookingUpVin] = useState(false)
  const [vinLookupError, setVinLookupError] = useState<string | null>(null)
  const [vinLookupSuccess, setVinLookupSuccess] = useState(false)

  const [availableVariants, setAvailableVariants] = useState<string[]>([])
  const [yearRange, setYearRange] = useState({ min: 2012, max: new Date().getFullYear() })

  useEffect(() => {
    fetchAmbassador()
  }, [])

  useEffect(() => {
    if (formData.tesla_model) {
      const model = formData.tesla_model as TeslaModelName
      const range = getYearRangeForModel(model)
      setYearRange(range)

      if (formData.tesla_year < range.min || formData.tesla_year > range.max) {
        setFormData(prev => ({ ...prev, tesla_year: range.max }))
      }

      updateVariantsForYear(model, formData.tesla_year)
    }
  }, [formData.tesla_model])

  useEffect(() => {
    if (formData.tesla_model && formData.tesla_year) {
      updateVariantsForYear(formData.tesla_model as TeslaModelName, formData.tesla_year)
    }
  }, [formData.tesla_year])

  const fetchAmbassador = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!ambassador) {
        router.push('/ambassador/create')
        return
      }

      setAmbassadorId(ambassador.id)
    } catch (error) {
      console.error('Error fetching ambassador:', error)
      router.push('/dashboard')
    }
  }

  const updateVariantsForYear = (model: TeslaModelName, year: number) => {
    const variants = getVariantsForModelAndYear(model, year)
    const variantNames = variants.map(v => v.name)
    setAvailableVariants(variantNames)

    if (formData.tesla_variant && !variantNames.includes(formData.tesla_variant)) {
      setFormData(prev => ({ ...prev, tesla_variant: '' }))
    }
  }

  // Validate VIN format - Tesla VINs start with specific WMI codes
  const isValidTeslaVin = (vin: string): boolean => {
    // Tesla WMI codes (World Manufacturer Identifier - first 3 characters)
    const teslaWmiCodes = [
      '5YJ',  // USA - Tesla, Inc. - Model S, Model 3
      '7SA',  // USA - Tesla, Inc. - Model X, Model Y
      '7G2',  // USA - Tesla, Inc. - Cybertruck, Semi
      'LRW',  // China - Tesla (Shanghai) Co. - Model 3, Model Y
      'XP7',  // Germany - Tesla Germany GmbH - Model Y
      'SFZ',  // UK - Tesla (Lotus) - Roadster (Gen 1)
    ]

    const wmi = vin.substring(0, 3)
    return teslaWmiCodes.includes(wmi)
  }

  const handleVinLookup = async () => {
    const vin = vinInput.trim()

    if (!vin || vin.length !== 17) {
      setVinLookupError('VIN musí mít přesně 17 znaků')
      return
    }

    // Validate VIN format
    if (!isValidTeslaVin(vin)) {
      setVinLookupError('Tento VIN kód nepatří vozidlu Tesla')
      return
    }

    setIsLookingUpVin(true)
    setVinLookupError(null)
    setVinLookupSuccess(false)

    try {
      const response = await fetch(`/api/vehicle-lookup?vin=${vin}`)
      const data = await response.json()

      // Handle error responses
      if (!response.ok || data.success === false) {
        setVinLookupError(data.error || 'Nepodařilo se načíst data vozidla')
        return
      }

      // Validate data structure
      if (!data.success || !data.data) {
        setVinLookupError('Neplatná odpověď ze serveru')
        return
      }

      const vehicleData = data.data

      // Validate required fields
      if (!vehicleData.model) {
        setVinLookupError('Nepodařilo se načíst model vozidla z registru')
        return
      }

      // Normalize the model name from API (e.g., "MODEL 3" -> "Model 3")
      const normalizedModel = normalizeModelName(vehicleData.model)

      if (!normalizedModel) {
        setVinLookupError(`Model "${vehicleData.model}" není v systému podporován`)
        return
      }

      // Auto-populate form fields and store complete registry data
      const year = vehicleData.year || new Date().getFullYear()

      setFormData(prev => ({
        ...prev,
        vin: vin,
        vehicle_registry_data: vehicleData.rawData, // Store complete API response
        tesla_model: normalizedModel,
        tesla_year: year,
        tesla_variant: vehicleData.variant || prev.tesla_variant,
        description: prev.description || `${vehicleData.color || ''} ${normalizedModel} ${year}`.trim(),
      }))

      setVinLookupSuccess(true)
      setVinLookupError(null)
    } catch (error) {
      console.error('VIN lookup error:', error)
      setVinLookupError('Chyba při komunikaci se serverem')
    } finally {
      setIsLookingUpVin(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ambassadorId) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // First, create the vehicle record to get the ID
      const { data: vehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          ambassador_id: ambassadorId,
          ...formData,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Upload images if provided
      let profileImageUrl: string | null = null
      let additionalImageUrls: string[] = []

      if (profileImageFile && vehicle) {
        profileImageUrl = await uploadVehicleProfileImage(
          ambassadorId,
          vehicle.id,
          profileImageFile
        )
      }

      if (additionalImageFiles.length > 0 && vehicle) {
        additionalImageUrls = await uploadVehicleImages(
          ambassadorId,
          vehicle.id,
          additionalImageFiles
        )
      }

      // Update vehicle with image URLs
      if (profileImageUrl || additionalImageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({
            profile_image_url: profileImageUrl,
            images: additionalImageUrls.length > 0 ? additionalImageUrls : null,
          })
          .eq('id', vehicle.id)

        if (updateError) throw updateError
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error adding vehicle:', error)
      alert('Failed to add vehicle. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateYearOptions = () => {
    const years = []
    for (let year = yearRange.max; year >= yearRange.min; year--) {
      years.push(year)
    }
    return years
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              Tesla<span className="text-red-500">Connect</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-300">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Add New Vehicle</CardTitle>
            <CardDescription className="text-gray-400">
              Add a Tesla vehicle to your ambassador profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* VIN Lookup Section */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <Label className="text-blue-300 font-semibold">
                    Automaticky vyplnit údaje podle VIN
                  </Label>
                </div>
                <p className="text-sm text-blue-200/70">
                  Zadejte VIN kód vašeho vozidla a automaticky načteme údaje z registru vozidel
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={vinInput}
                    onChange={(e) => {
                      const upperVin = e.target.value.toUpperCase()
                      setVinInput(upperVin)
                      setFormData(prev => ({ ...prev, vin: upperVin || undefined }))
                      setVinLookupError(null)
                      setVinLookupSuccess(false)
                    }}
                    placeholder="Zadejte VIN (17 znaků)"
                    maxLength={17}
                    className="flex-1 bg-white/10 border-blue-400/30 text-white placeholder-gray-400 focus:ring-blue-500 font-mono"
                  />
                  <Button
                    type="button"
                    onClick={handleVinLookup}
                    disabled={isLookingUpVin || vinInput.trim().length !== 17}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isLookingUpVin ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Načítání...
                      </>
                    ) : (
                      'Hledat vozidlo'
                    )}
                  </Button>
                </div>
                {vinLookupError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm animate-in fade-in duration-200">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {vinLookupError}
                  </div>
                )}
                {vinLookupSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm animate-in fade-in duration-200">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Údaje vozidla byly úspěšně načteny! Zkontrolujte a doplňte zbývající informace.
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-gray-400 mb-4">
                  Nebo vyplňte údaje ručně:
                </p>
              </div>

              {/* Tesla Model */}
              <div className="space-y-2">
                <Label htmlFor="tesla_model" className="text-gray-200">
                  Tesla Model *
                </Label>
                <Select
                  value={formData.tesla_model}
                  onValueChange={(value) => setFormData({ ...formData, tesla_model: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    {TESLA_MODEL_NAMES.map((model) => (
                      <SelectItem key={model} value={model} className="text-white">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="tesla_year" className="text-gray-200">
                  Year *
                </Label>
                <Select
                  value={formData.tesla_year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, tesla_year: Number(value) })}
                  disabled={!formData.tesla_model}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white disabled:opacity-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Variant */}
              <div className="space-y-2">
                <Label htmlFor="tesla_variant" className="text-gray-200">
                  Variant (optional)
                </Label>
                <Select
                  value={formData.tesla_variant || ''}
                  onValueChange={(value) => setFormData({ ...formData, tesla_variant: value })}
                  disabled={!formData.tesla_model || availableVariants.length === 0}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white disabled:opacity-50">
                    <SelectValue placeholder="Select variant (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    {availableVariants.map((variant) => (
                      <SelectItem key={variant} value={variant} className="text-white">
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableVariants.length === 0 && formData.tesla_model && (
                  <p className="text-yellow-400 text-sm">
                    No variants found for {formData.tesla_model} {formData.tesla_year}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Red with white interior, FSD, 19-inch wheels..."
                  className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  Profile Image (Main listing photo)
                </Label>
                <ImageUpload
                  value={null}
                  onChange={(file) => setProfileImageFile(file)}
                  label="Upload vehicle profile image"
                  aspectRatio="video"
                  maxSizeMB={5}
                />
              </div>

              {/* Additional Images */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  Additional Images (Up to 5)
                </Label>
                <MultiImageUpload
                  value={[]}
                  onChange={(files) => setAdditionalImageFiles(files)}
                  maxImages={5}
                  maxSizeMB={5}
                />
              </div>

              {/* Available */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-red-600"
                />
                <Label htmlFor="available" className="text-gray-200">
                  Available for test drives
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? 'Adding...' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
