'use client'

import { Vehicle } from '@/lib/types/database.types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface VehicleCardProps {
  vehicle: Vehicle
  onDelete: (vehicleId: string) => void
}

export default function VehicleCardNew({ vehicle, onDelete }: VehicleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(vehicle.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  return (
    <Card className="bg-white/5 border-white/10 hover:border-red-500/50 transition-colors">
      <CardContent className="p-6">
        {!showDeleteConfirm ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {vehicle.tesla_model} {vehicle.tesla_variant}
                </h3>
                <p className="text-gray-400 text-sm">Rok: {vehicle.tesla_year}</p>
              </div>
              <Badge
                variant={vehicle.available ? "default" : "secondary"}
                className={vehicle.available
                  ? "bg-green-500/20 text-green-300 border-green-500/50"
                  : "bg-gray-500/20 text-gray-300 border-gray-500/50"
                }
              >
                {vehicle.available ? 'Dostupné' : 'Nedostupné'}
              </Badge>
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
                <p className="text-gray-400 text-sm mb-2">Další obrázky: {vehicle.images.length}</p>
                <div className="grid grid-cols-5 gap-2">
                  {vehicle.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${vehicle.tesla_model} obrázek ${idx + 1}`}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} className="flex-1">
                <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                  Upravit
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50"
              >
                Smazat
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Potvrdit smazání</h3>
              <p className="text-gray-300">
                Opravdu chcete smazat tuto {vehicle.tesla_model} {vehicle.tesla_variant}?
                Tuto akci nelze vrátit zpět.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Zrušit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Mazání...' : 'Smazat'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
