'use client'

import { Vehicle } from '@/lib/types/database.types'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicleId: string) => void
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(vehicle.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  return (
    <>
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-red-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {vehicle.tesla_model} {vehicle.tesla_variant}
          </h3>
          <p className="text-gray-400 text-sm">Year: {vehicle.tesla_year}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          vehicle.available
            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
            : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
        }`}>
          {vehicle.available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {vehicle.description && (
        <p className="text-gray-300 text-sm mb-4">{vehicle.description}</p>
      )}

      {vehicle.profile_image_url && (
        <div className="mb-4">
          <img
            src={vehicle.profile_image_url}
            alt={`${vehicle.tesla_model} ${vehicle.tesla_variant}`}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {vehicle.images && vehicle.images.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">Additional Images: {vehicle.images.length}</p>
          <div className="grid grid-cols-5 gap-2">
            {vehicle.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${vehicle.tesla_model} image ${idx + 1}`}
                className="w-full h-16 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(vehicle)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-colors font-medium text-sm"
        >
          Delete
        </button>
      </div>
    </div>

      {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this {vehicle.tesla_model} {vehicle.tesla_variant}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
