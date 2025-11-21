'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Vehicle, VehicleFormData } from '@/lib/types/database.types'
import {
  TESLA_MODEL_NAMES,
  TeslaModelName,
  getVariantsForModelAndYear,
  getYearRangeForModel,
} from '@/lib/constants/tesla-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import MultiImageUpload from '@/components/MultiImageUpload'
import {
  uploadVehicleProfileImage,
  uploadVehicleImages,
  deleteVehicleImages,
} from '@/lib/supabase/storage'

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
  const [formData, setFormData] = useState<VehicleFormData>({
    tesla_model: '',
    tesla_variant: '',
    tesla_year: new Date().getFullYear(),
    description: '',
    available: true,
  })

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const [availableVariants, setAvailableVariants] = useState<string[]>([])
  const [yearRange, setYearRange] = useState({ min: 2012, max: new Date().getFullYear() })

  useEffect(() => {
    fetchVehicle()
  }, [vehicleId])

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

  const fetchVehicle = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Verify user owns this vehicle
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

      const { data: vehicleData, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('ambassador_id', ambassador.id)
        .single()

      if (error || !vehicleData) {
        router.push('/dashboard')
        return
      }

      setVehicle(vehicleData)
      setFormData({
        tesla_model: vehicleData.tesla_model,
        tesla_variant: vehicleData.tesla_variant || '',
        tesla_year: vehicleData.tesla_year,
        description: vehicleData.description || '',
        available: vehicleData.available,
      })

      // Load existing images
      if (vehicleData.images && Array.isArray(vehicleData.images)) {
        setExistingImages(vehicleData.images)
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle || !ambassadorId) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // Delete images marked for deletion
      if (imagesToDelete.length > 0) {
        await deleteVehicleImages(imagesToDelete, 'vehicle-images')
      }

      // Upload new profile image if provided
      let profileImageUrl = vehicle.profile_image_url
      if (profileImageFile) {
        profileImageUrl = await uploadVehicleProfileImage(
          ambassadorId,
          vehicleId,
          profileImageFile
        )
      }

      // Upload new additional images if provided
      let updatedImages = existingImages.filter(img => !imagesToDelete.includes(img))
      if (additionalImageFiles.length > 0) {
        const newImageUrls = await uploadVehicleImages(
          ambassadorId,
          vehicleId,
          additionalImageFiles
        )
        updatedImages = [...updatedImages, ...newImageUrls]
      }

      // Update vehicle with new data and image URLs
      const { error } = await supabase
        .from('vehicles')
        .update({
          ...formData,
          profile_image_url: profileImageUrl,
          images: updatedImages.length > 0 ? updatedImages : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vehicleId)

      if (error) throw error

      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert('Failed to update vehicle. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveExistingImage = (index: number) => {
    const imageUrl = existingImages[index]
    setImagesToDelete([...imagesToDelete, imageUrl])
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const generateYearOptions = () => {
    const years = []
    for (let year = yearRange.max; year >= yearRange.min; year--) {
      years.push(year)
    }
    return years
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-300 mt-4">Loading vehicle...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) return null

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
            <CardTitle className="text-3xl text-white">Edit Vehicle</CardTitle>
            <CardDescription className="text-gray-400">
              Update your vehicle information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Profile Image */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  Profile Image
                </Label>
                <ImageUpload
                  value={vehicle?.profile_image_url}
                  onChange={(file) => setProfileImageFile(file)}
                  label="Upload vehicle profile image"
                  aspectRatio="video"
                  maxSizeMB={5}
                />
              </div>

              {/* Additional Images */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  Additional Images (up to 5 total)
                </Label>
                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-2">
                      Existing images ({existingImages.length})
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Existing image ${idx + 1}`}
                            className="w-full h-20 object-cover rounded border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <MultiImageUpload
                  onChange={(files) => setAdditionalImageFiles(files)}
                  maxImages={5 - existingImages.length}
                  maxSizeMB={5}
                />
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
                  {isSubmitting ? 'Updating...' : 'Update Vehicle'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
