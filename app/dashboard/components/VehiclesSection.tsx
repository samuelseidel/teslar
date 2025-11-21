'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Vehicle, VehicleFormData } from '@/lib/types/database.types'
import VehicleCard from './VehicleCard'
import VehicleForm from './VehicleForm'

interface VehiclesSectionProps {
  ambassadorId: string
}

export default function VehiclesSection({ ambassadorId }: VehiclesSectionProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined)

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

  const handleAddVehicle = async (formData: VehicleFormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('vehicles').insert({
        ambassador_id: ambassadorId,
        ...formData,
      })

      if (error) throw error

      await fetchVehicles()
      setShowForm(false)
    } catch (error) {
      console.error('Error adding vehicle:', error)
      alert('Failed to add vehicle. Please try again.')
    }
  }

  const handleUpdateVehicle = async (formData: VehicleFormData) => {
    if (!editingVehicle) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vehicles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingVehicle.id)

      if (error) throw error

      await fetchVehicles()
      setEditingVehicle(undefined)
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert('Failed to update vehicle. Please try again.')
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
      alert('Failed to delete vehicle. Please try again.')
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Vehicles</h2>
          <p className="text-gray-400 text-sm mt-1">
            Add and manage your Tesla vehicles for test drives
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          + Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-300 mt-4">Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-lg mb-2">No vehicles yet</p>
          <p className="text-gray-500 mb-4">Add your first Tesla to start offering test drives</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDeleteVehicle}
            />
          ))}
        </div>
      )}

      {showForm && (
        <VehicleForm
          onSubmit={handleAddVehicle}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingVehicle && (
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setEditingVehicle(undefined)}
        />
      )}
    </div>
  )
}
