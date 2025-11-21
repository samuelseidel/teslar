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
