import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VehiclesSectionNew from './components/VehiclesSectionNew'

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
              Tesla<span className="text-red-500">Connect</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user.email}</span>
              <form action="/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Ambassador Profile</h1>
              <p className="text-gray-300">Manage your profile and view contact requests</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ambassador.available
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
              }`}>
                {ambassador.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Name</h3>
              <p className="text-white text-lg">{ambassador.full_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Email</h3>
              <p className="text-white text-lg">{ambassador.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Phone</h3>
              <p className="text-white text-lg">{ambassador.phone || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Location</h3>
              <p className="text-white text-lg">{ambassador.city}, {ambassador.region}</p>
            </div>
            {ambassador.bio && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Bio</h3>
                <p className="text-white">{ambassador.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicles Section */}
        <VehiclesSectionNew ambassadorId={ambassador.id} />

        {/* Contact Requests Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Requests</h2>

          {!contactRequests || contactRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-lg">No contact requests yet</p>
              <p className="text-gray-500 mt-2">When potential buyers reach out, their requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-red-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{request.buyer_name}</h3>
                      {(request as any).vehicle && (
                        <p className="text-red-400 text-sm font-medium">
                          Interested in: {(request as any).vehicle.tesla_model} {(request as any).vehicle.tesla_variant} ({(request as any).vehicle.tesla_year})
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
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
                      <span className="text-gray-400 text-sm">Email: </span>
                      <a href={`mailto:${request.buyer_email}`} className="text-red-400 hover:text-red-300">
                        {request.buyer_email}
                      </a>
                    </div>
                    {request.buyer_phone && (
                      <div>
                        <span className="text-gray-400 text-sm">Phone: </span>
                        <a href={`tel:${request.buyer_phone}`} className="text-red-400 hover:text-red-300">
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
