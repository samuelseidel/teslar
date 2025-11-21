'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Ambassador } from '@/lib/types/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import AddressAutocomplete, { type AddressComponents } from '@/components/AddressAutocomplete'
import { uploadAmbassadorProfileImage } from '@/lib/supabase/storage'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [showAddressInput, setShowAddressInput] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    referral_code: '',
    city: '',
    region: '',
    country: '',
    country_code: '',
    zip_code: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  })

  useEffect(() => {
    fetchAmbassador()
  }, [])

  const fetchAmbassador = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: ambassadorData, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !ambassadorData) {
        router.push('/ambassador/create')
        return
      }

      setAmbassador(ambassadorData)
      setFormData({
        full_name: ambassadorData.full_name || '',
        phone: ambassadorData.phone || '',
        bio: ambassadorData.bio || '',
        referral_code: ambassadorData.referral_code || '',
        city: ambassadorData.city || '',
        region: ambassadorData.region || '',
        country: ambassadorData.country || '',
        country_code: ambassadorData.country_code || '',
        zip_code: ambassadorData.zip_code || '',
        latitude: ambassadorData.latitude,
        longitude: ambassadorData.longitude,
      })
    } catch (error) {
      console.error('Error fetching ambassador:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSelect = (address: AddressComponents) => {
    setFormData({
      ...formData,
      city: address.city,
      region: address.region,
      country: address.country,
      country_code: address.countryCode,
      zip_code: address.zipCode || '',
      latitude: address.latitude,
      longitude: address.longitude,
    })
    setShowAddressInput(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ambassador) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      let profileImageUrl: string | null = null

      // Upload profile image if provided
      if (profileImageFile) {
        profileImageUrl = await uploadAmbassadorProfileImage(
          ambassador.id,
          profileImageFile
        )
      }

      // Update ambassador profile
      const updateData: any = {
        ...formData,
        updated_at: new Date().toISOString(),
      }

      if (profileImageUrl) {
        updateData.profile_image_url = profileImageUrl
      }

      const { error } = await supabase
        .from('ambassadors')
        .update(updateData)
        .eq('id', ambassador.id)

      if (error) throw error

      alert('Profil byl úspěšně aktualizován!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Aktualizace profilu selhala. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-300 mt-4">Načítání profilu...</p>
        </div>
      </div>
    )
  }

  if (!ambassador) return null

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
                ← Zpět na nástěnku
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Nastavení profilu</CardTitle>
            <CardDescription className="text-gray-400">
              Aktualizujte informace vašeho ambasadorského profilu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  Profilový obrázek
                </Label>
                <ImageUpload
                  value={ambassador.profile_image_url}
                  onChange={(file) => setProfileImageFile(file)}
                  label="Nahrát profilový obrázek"
                  aspectRatio="square"
                  maxSizeMB={5}
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-200">
                  Celé jméno *
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-200">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-200">
                  O mně
                </Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Řekněte potenciálním kupcům o vaší zkušenosti s Teslou..."
                  className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                />
              </div>

              {/* Tesla Referral Code */}
              <div className="space-y-2">
                <Label htmlFor="referral_code" className="text-gray-200">
                  Tesla doporučovací kód
                </Label>
                <Input
                  id="referral_code"
                  type="text"
                  value={formData.referral_code}
                  onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                  placeholder="Váš Tesla doporučovací kód"
                  className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                />
              </div>

              {/* Location Info */}
              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center">
                  <p className="text-gray-200 font-medium">Lokace</p>
                  {!showAddressInput && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressInput(true)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Změnit adresu
                    </Button>
                  )}
                </div>

                {showAddressInput ? (
                  <div className="space-y-3">
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      defaultValue={`${formData.city}, ${formData.region}, ${formData.country}`}
                      placeholder="Začněte psát vaši novou adresu..."
                      restrictToCountries={['cz', 'sk', 'at', 'de', 'pl']}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddressInput(false)}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      Zrušit
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Město</p>
                      <p className="text-white">{formData.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kraj</p>
                      <p className="text-white">{formData.region}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Země</p>
                      <p className="text-white">{formData.country}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">E-mail (pouze pro čtení)</p>
                      <p className="text-white">{ambassador.email}</p>
                    </div>
                  </div>
                )}
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
                  Zrušit
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? 'Ukládání...' : 'Uložit změny'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
