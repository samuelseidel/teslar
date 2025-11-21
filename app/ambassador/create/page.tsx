'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CZECH_REGIONS } from '@/lib/types/database.types'
import {
  TESLA_MODEL_NAMES,
  getVariantsForModelAndYear,
  getYearRangeForModel,
  VARIANT_DESCRIPTIONS,
  type TeslaModelName,
  type TeslaVariantInfo,
} from '@/lib/constants/tesla-variants'

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
    tesla_variant: '',
    tesla_year: new Date().getFullYear(),
    description: '',
  })

  const [availableVariants, setAvailableVariants] = useState<TeslaVariantInfo[]>([])
  const [yearRange, setYearRange] = useState({ min: 2008, max: new Date().getFullYear() + 1 })

  // Image selection state
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [vehicleImages, setVehicleImages] = useState<File[]>([])
  const [vehicleImagePreviews, setVehicleImagePreviews] = useState<string[]>([])

  // Update year range when model changes
  useEffect(() => {
    if (vehicleData.tesla_model) {
      const range = getYearRangeForModel(vehicleData.tesla_model as TeslaModelName)
      setYearRange(range)

      // Reset year if it's outside the new range
      if (vehicleData.tesla_year < range.min || vehicleData.tesla_year > range.max) {
        setVehicleData(prev => ({ ...prev, tesla_year: range.max }))
      }
    }
  }, [vehicleData.tesla_model])

  // Update available variants when model or year changes
  useEffect(() => {
    if (vehicleData.tesla_model && vehicleData.tesla_year) {
      const variants = getVariantsForModelAndYear(
        vehicleData.tesla_model as TeslaModelName,
        vehicleData.tesla_year
      )
      setAvailableVariants(variants)

      // Reset variant if it's no longer available for the selected year
      if (vehicleData.tesla_variant) {
        const isStillAvailable = variants.some(v => v.name === vehicleData.tesla_variant)
        if (!isStillAvailable) {
          setVehicleData(prev => ({ ...prev, tesla_variant: '' }))
        }
      }
    }
  }, [vehicleData.tesla_model, vehicleData.tesla_year])

  // Handle profile image selection
  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Povolené formáty profilové fotografie: JPG, PNG, WEBP')
      return
    }

    if (file.size > maxSize) {
      setError('Maximální velikost souboru: 5MB')
      return
    }

    setProfileImage(file)
    setProfileImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  // Handle vehicle images selection
  const handleVehicleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check total number of images
    if (vehicleImages.length + files.length > 5) {
      setError('Můžete nahrát maximálně 5 fotografií vozidla')
      return
    }

    // Validate each file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError('Povolené formáty: JPG, PNG, WEBP')
        return
      }
      if (file.size > maxSize) {
        setError('Maximální velikost souboru: 5MB')
        return
      }
    }

    const newImages = [...vehicleImages, ...files].slice(0, 5)
    const newPreviews = [
      ...vehicleImagePreviews,
      ...files.map(f => URL.createObjectURL(f))
    ].slice(0, 5)

    setVehicleImages(newImages)
    setVehicleImagePreviews(newPreviews)
    setError(null)
  }

  // Remove vehicle image
  const removeVehicleImage = (index: number) => {
    setVehicleImages(vehicleImages.filter((_, i) => i !== index))
    setVehicleImagePreviews(vehicleImagePreviews.filter((_, i) => i !== index))
  }

  // Upload image to Supabase Storage
  const uploadImage = async (
    file: File,
    ambassadorId: string,
    vehicleId: string,
    fileName: string
  ): Promise<string | null> => {
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const filePath = `${ambassadorId}/${vehicleId}/${fileName}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('vehicle-images').getPublicUrl(data.path)

      return publicUrl
    } catch (err) {
      console.error('Failed to upload image:', err)
      return null
    }
  }

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
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          ambassador_id: ambassador.id,
          ...vehicleData
        })
        .select()
        .single()

      if (vehicleError || !vehicle) {
        setError(vehicleError?.message || 'Nepodařilo se vytvořit vozidlo')
        setLoading(false)
        return
      }

      // Upload images if selected
      let profileImageUrl: string | null = null
      const vehicleImageUrls: string[] = []

      // Upload profile image
      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, ambassador.id, vehicle.id, 'profile')
      }

      // Upload vehicle images
      if (vehicleImages.length > 0) {
        for (let i = 0; i < vehicleImages.length; i++) {
          const url = await uploadImage(vehicleImages[i], ambassador.id, vehicle.id, `image-${i + 1}`)
          if (url) vehicleImageUrls.push(url)
        }
      }

      // Update vehicle with image URLs if any were uploaded
      if (profileImageUrl || vehicleImageUrls.length > 0) {
        const updateData: { profile_image_url?: string; images?: string[] } = {}
        if (profileImageUrl) updateData.profile_image_url = profileImageUrl
        if (vehicleImageUrls.length > 0) updateData.images = vehicleImageUrls

        const { error: updateError } = await supabase
          .from('vehicles')
          .update(updateData)
          .eq('id', vehicle.id)

        if (updateError) {
          console.error('Error updating vehicle with images:', updateError)
          // Don't fail the whole process if image update fails
        }
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
              <div className="space-y-4">
                {/* Model Selection */}
                <div>
                  <label htmlFor="tesla_model" className="block text-sm font-medium text-gray-200 mb-1">
                    Model Tesly *
                  </label>
                  <select
                    id="tesla_model"
                    required
                    value={vehicleData.tesla_model}
                    onChange={(e) => setVehicleData({ ...vehicleData, tesla_model: e.target.value, tesla_variant: '' })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="" className="bg-gray-800">Vyberte model</option>
                    {TESLA_MODEL_NAMES.map((model) => (
                      <option key={model} value={model} className="bg-gray-800">
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Selection */}
                <div>
                  <label htmlFor="tesla_year" className="block text-sm font-medium text-gray-200 mb-1">
                    Rok *
                  </label>
                  <input
                    type="number"
                    id="tesla_year"
                    required
                    min={yearRange.min}
                    max={yearRange.max}
                    value={vehicleData.tesla_year}
                    onChange={(e) => setVehicleData({ ...vehicleData, tesla_year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {vehicleData.tesla_model && (
                    <p className="text-xs text-gray-400 mt-1">
                      {vehicleData.tesla_model} byl vyráběn od {yearRange.min} do {yearRange.max === new Date().getFullYear() + 1 ? 'současnosti' : yearRange.max}
                    </p>
                  )}
                </div>

                {/* Variant Selection - Only show if model and year are selected */}
                {vehicleData.tesla_model && vehicleData.tesla_year && availableVariants.length > 0 && (
                  <div>
                    <label htmlFor="tesla_variant" className="block text-sm font-medium text-gray-200 mb-1">
                      Varianta {availableVariants.length > 1 ? '' : '(volitelné)'}
                    </label>
                    <select
                      id="tesla_variant"
                      value={vehicleData.tesla_variant}
                      onChange={(e) => setVehicleData({ ...vehicleData, tesla_variant: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="" className="bg-gray-800">
                        {availableVariants.length > 1 ? 'Vyberte variantu' : 'Bez specifikace'}
                      </option>
                      {availableVariants.map((variant) => (
                        <option key={variant.name} value={variant.name} className="bg-gray-800">
                          {variant.name}
                          {VARIANT_DESCRIPTIONS[variant.name] && ` - ${VARIANT_DESCRIPTIONS[variant.name]}`}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Pro rok {vehicleData.tesla_year} je k dispozici {availableVariants.length} variant{availableVariants.length > 1 ? 'y' : 'a'}
                    </p>
                  </div>
                )}

                {/* No variants available message */}
                {vehicleData.tesla_model && vehicleData.tesla_year && availableVariants.length === 0 && (
                  <div className="rounded-md bg-yellow-500/20 border border-yellow-500 p-4">
                    <p className="text-sm text-yellow-300">
                      Pro {vehicleData.tesla_model} z roku {vehicleData.tesla_year} nejsou k dispozici žádné varianty. Zkontrolujte prosím rok výroby.
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label htmlFor="vehicle_description" className="block text-sm font-medium text-gray-200 mb-1">
                    Popis vozidla
                  </label>
                  <textarea
                    id="vehicle_description"
                    rows={3}
                    value={vehicleData.description}
                    onChange={(e) => setVehicleData({ ...vehicleData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Např.: Červená barva, 19&quot; kola, Premium interiér, rozšířený Autopilot..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Uveďte barvu, výbavu, dojezd, nebo jiné specifikace
                  </p>
                </div>

                {/* Vehicle Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Fotografie vozidla (volitelné, max 5)
                  </label>

                  {/* Upload Area */}
                  {vehicleImages.length < 5 && (
                    <div className="relative border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors mb-4">
                      <input
                        type="file"
                        id="vehicle-images"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleVehicleImagesSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-300">Klikněte nebo přetáhněte fotografie vozidla</p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, WEBP až do 5MB (zbývá {5 - vehicleImages.length} {5 - vehicleImages.length === 1 ? 'fotografie' : 'fotografií'})
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Previews */}
                  {vehicleImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicleImagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square group">
                          <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/20">
                            <Image
                              src={preview}
                              alt={`Fotografie vozidla ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVehicleImage(index)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                placeholder="Řekněte potenciálním kupcům o své zkušenosti s Teslou. Co na ní milujete? Jak dlouho ji vlastníte? Proč ji doporučujete?"
              />
            </div>

            {/* Profile Image */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Profilová fotografie (volitelné)</h2>
              <div className="space-y-4">
                {!profileImagePreview ? (
                  <div className="relative border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleProfileImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-300">Klikněte pro nahrání profilové fotografie</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP až do 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                      <Image
                        src={profileImagePreview}
                        alt="Náhled profilové fotografie"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 mb-2">Profilová fotografie vybrána</p>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null)
                          setProfileImagePreview(null)
                        }}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Odstranit
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
