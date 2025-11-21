'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vehicle } from '@/lib/types/database.types'
import VehicleCardNew from './VehicleCardNew'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface VehiclesSectionProps {
  ambassadorId: string
}

export default function VehiclesSectionNew({ ambassadorId }: VehiclesSectionProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [ambassadorId])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId)

      if (error) throw error

      await fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Smazání vozidla selhalo. Zkuste to prosím znovu.')
    }
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-white">Moje vozidla</CardTitle>
            <CardDescription className="text-gray-400">
              Spravujte svá Tesla vozidla pro testovací jízdy
            </CardDescription>
          </div>
          <Link href="/dashboard/vehicles/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              + Přidat vozidlo
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-300 mt-4">Načítání vozidel...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-lg mb-2">Zatím žádná vozidla</p>
            <p className="text-gray-500 mb-4">Přidejte svou první Teslu pro nabízení testovacích jízd</p>
            <Link href="/dashboard/vehicles/new">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Přidat první vozidlo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <VehicleCardNew
                key={vehicle.id}
                vehicle={vehicle}
                onDelete={handleDeleteVehicle}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
