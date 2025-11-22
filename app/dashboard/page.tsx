import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VehiclesSectionNew from './components/VehiclesSectionNew'
import { User, Mail, Phone, MapPin, Edit, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get ambassador profile
  const { data: ambassador } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!ambassador) {
    redirect('/ambassador/create')
  }

  // Get contact requests with vehicle info
  const { data: contactRequests } = await supabase
    .from('contact_requests')
    .select(`
      *,
      vehicle:vehicles(*)
    `)
    .eq('ambassador_id', ambassador.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              Tesla<span className="text-red-600">Connect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/profile" className="text-gray-300 hover:text-white transition-colors">
                Nastavení profilu
              </Link>
              <span className="text-gray-300">{user.email}</span>
              <form action="/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Odhlásit se
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 mb-8 overflow-hidden">
          {/* Header with background gradient */}
          <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 px-8 pt-8 pb-20">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-white">Profil ambasadora</h1>
              <Link href="/dashboard/profile">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Upravit profil
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Profile Image and Name Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 mb-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gradient-to-br from-red-600 to-red-700 overflow-hidden shadow-2xl">
                  {ambassador.profile_image_url ? (
                    <Image
                      src={ambassador.profile_image_url}
                      alt={ambassador.full_name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Status */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{ambassador.full_name}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                    ambassador.available
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      ambassador.available ? 'bg-green-400' : 'bg-gray-400'
                    }`}></span>
                    {ambassador.available ? 'Dostupný' : 'Nedostupný'}
                  </span>
                  {ambassador.referral_code && (
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-600/20 text-red-300 border border-red-600/50">
                      Doporučení: {ambassador.referral_code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Contact Information Card */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  Kontaktní informace
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">E-mail</p>
                      <p className="text-white">{ambassador.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Telefon</p>
                      <p className="text-white">{ambassador.phone || 'Neuvedeno'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Lokace
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Adresa</p>
                      <p className="text-white">
                        {ambassador.city}
                        {ambassador.zip_code && `, ${ambassador.zip_code}`}
                      </p>
                      <p className="text-gray-300 text-sm">{ambassador.region}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Země</p>
                      <p className="text-white">{ambassador.country} ({ambassador.country_code?.toUpperCase() || 'CZ'})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Me Card - Full Width if bio exists */}
              {ambassador.bio && (
                <div className="md:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    O mně
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{ambassador.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
        <VehiclesSectionNew ambassadorId={ambassador.id} />

        {/* Contact Requests Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Kontaktní žádosti</h2>

          {!contactRequests || contactRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-lg">Zatím žádné kontaktní žádosti</p>
              <p className="text-gray-500 mt-2">Když se potenciální kupci ozvou, jejich žádosti se zde objeví</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-red-600/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{request.buyer_name}</h3>
                      {(request as any).vehicle && (
                        <p className="text-red-600 text-sm font-medium">
                          Zájem o: {(request as any).vehicle.tesla_model} {(request as any).vehicle.tesla_variant} ({(request as any).vehicle.tesla_year})
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {new Date(request.created_at).toLocaleDateString('cs-CZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-gray-400 text-sm">E-mail: </span>
                      <a href={`mailto:${request.buyer_email}`} className="text-red-600 hover:text-red-700">
                        {request.buyer_email}
                      </a>
                    </div>
                    {request.buyer_phone && (
                      <div>
                        <span className="text-gray-400 text-sm">Telefon: </span>
                        <a href={`tel:${request.buyer_phone}`} className="text-red-600 hover:text-red-700">
                          {request.buyer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300">{request.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
