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
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    referral_code: '',
    instagram_url: '',
    facebook_url: '',
    x_url: '',
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
        first_name: ambassadorData.first_name || '',
        last_name: ambassadorData.last_name || '',
        phone: ambassadorData.phone || '',
        bio: ambassadorData.bio || '',
        referral_code: ambassadorData.referral_code || '',
        instagram_url: ambassadorData.instagram_url || '',
        facebook_url: ambassadorData.facebook_url || '',
        x_url: ambassadorData.x_url || '',
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
                  label="Profilový obrázek"
                  variant="avatar"
                  maxSizeMB={5}
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-200">
                  Jméno *
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Např. Samuel"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-200">
                  Příjmení *
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Např. Seidel"
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

              {/* Social Media Links */}
              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-200 font-medium">Sociální sítě</p>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="text-gray-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/vase_jmeno"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="text-gray-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/vase_jmeno"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                  />
                </div>

                {/* X (Twitter) */}
                <div className="space-y-2">
                  <Label htmlFor="x_url" className="text-gray-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter)
                  </Label>
                  <Input
                    id="x_url"
                    type="url"
                    value={formData.x_url}
                    onChange={(e) => setFormData({ ...formData, x_url: e.target.value })}
                    placeholder="https://x.com/vase_jmeno"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-500"
                  />
                </div>
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
