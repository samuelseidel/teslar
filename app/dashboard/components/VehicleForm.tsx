'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Vehicle, VehicleFormData } from '@/lib/types/database.types'
import {
  TESLA_MODEL_NAMES,
  TeslaModelName,
  getVariantsForModelAndYear,
  getYearRangeForModel,
} from '@/lib/constants/tesla-variants'

interface VehicleFormProps {
  vehicle?: Vehicle // If provided, we're editing
  onSubmit: (data: VehicleFormData) => Promise<void>
  onCancel: () => void
}

export default function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<VehicleFormData>({
    tesla_model: vehicle?.tesla_model || '',
    tesla_variant: vehicle?.tesla_variant || '',
    tesla_year: vehicle?.tesla_year || new Date().getFullYear(),
    description: vehicle?.description || '',
    available: vehicle?.available ?? true,
  })

  const [availableVariants, setAvailableVariants] = useState<string[]>([])
  const [yearRange, setYearRange] = useState({ min: 2012, max: new Date().getFullYear() })

  // Update available variants and year range when model changes
  useEffect(() => {
    if (formData.tesla_model) {
      const model = formData.tesla_model as TeslaModelName
      const range = getYearRangeForModel(model)
      setYearRange(range)

      // If the current year is outside the new range, reset it
      if (formData.tesla_year < range.min || formData.tesla_year > range.max) {
        setFormData(prev => ({ ...prev, tesla_year: range.max }))
      }

      updateVariantsForYear(model, formData.tesla_year)
    }
  }, [formData.tesla_model])

  // Update variants when year changes
  useEffect(() => {
    if (formData.tesla_model && formData.tesla_year) {
      updateVariantsForYear(formData.tesla_model as TeslaModelName, formData.tesla_year)
    }
  }, [formData.tesla_year])

  const updateVariantsForYear = (model: TeslaModelName, year: number) => {
    const variants = getVariantsForModelAndYear(model, year)
    const variantNames = variants.map(v => v.name)
    setAvailableVariants(variantNames)

    // If current variant is not available for this year, reset it
    if (formData.tesla_variant && !variantNames.includes(formData.tesla_variant)) {
      setFormData(prev => ({ ...prev, tesla_variant: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
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

  if (typeof document === 'undefined') return null

  const portalRoot = document.getElementById('portal-root') || document.body

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full my-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tesla Model */}
          <div>
            <label htmlFor="tesla_model" className="block text-sm font-medium text-gray-200 mb-2">
              Tesla Model *
            </label>
            <select
              id="tesla_model"
              required
              value={formData.tesla_model}
              onChange={(e) => setFormData({ ...formData, tesla_model: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select model</option>
              {TESLA_MODEL_NAMES.map((model) => (
                <option key={model} value={model} className="bg-gray-800">
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="tesla_year" className="block text-sm font-medium text-gray-200 mb-2">
              Year *
            </label>
            <select
              id="tesla_year"
              required
              disabled={!formData.tesla_model}
              value={formData.tesla_year}
              onChange={(e) => setFormData({ ...formData, tesla_year: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year} className="bg-gray-800">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Variant */}
          <div>
            <label htmlFor="tesla_variant" className="block text-sm font-medium text-gray-200 mb-2">
              Variant
            </label>
            <select
              id="tesla_variant"
              disabled={!formData.tesla_model || availableVariants.length === 0}
              value={formData.tesla_variant || ''}
              onChange={(e) => setFormData({ ...formData, tesla_variant: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <option value="">Select variant (optional)</option>
              {availableVariants.map((variant) => (
                <option key={variant} value={variant} className="bg-gray-800">
                  {variant}
                </option>
              ))}
            </select>
            {availableVariants.length === 0 && formData.tesla_model && (
              <p className="text-yellow-400 text-sm mt-1">
                No variants found for {formData.tesla_model} {formData.tesla_year}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Description (color, features, etc.)
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Red with white interior, FSD, 19-inch wheels..."
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Available */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-red-600 focus:ring-2 focus:ring-red-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-200">
              Available for test drives
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    portalRoot
  )
}
