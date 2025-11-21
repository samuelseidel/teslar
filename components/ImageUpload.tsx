'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ImageUploadProps {
  type: 'profile' | 'gallery'
  ambassadorId: string
  vehicleId: string
  maxImages?: number
  currentImages?: string[]
  onImagesChange: (urls: string[]) => void
  label?: string
}

export default function ImageUpload({
  type,
  ambassadorId,
  vehicleId,
  maxImages = 5,
  currentImages = [],
  onImagesChange,
  label,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Validate file
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Povolené formáty: JPG, PNG, WEBP'
    }

    if (file.size > maxSize) {
      return 'Maximální velikost souboru: 5MB'
    }

    return null
  }

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName =
        type === 'profile'
          ? `profile.${fileExt}`
          : `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const filePath = `${ambassadorId}/${vehicleId}/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: type === 'profile', // Allow overwriting profile image
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('vehicle-images').getPublicUrl(data.path)

      return publicUrl
    } catch (err) {
      console.error('Upload failed:', err)
      return null
    }
  }

  // Handle file selection
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      const fileArray = Array.from(files)

      // For profile type, only allow 1 image
      if (type === 'profile' && fileArray.length > 1) {
        setError('Můžete nahrát pouze jednu profilovou fotografii')
        setUploading(false)
        return
      }

      // For gallery, check if we exceed max images
      if (type === 'gallery' && images.length + fileArray.length > maxImages) {
        setError(`Maximální počet fotografií: ${maxImages}`)
        setUploading(false)
        return
      }

      // Validate all files first
      for (const file of fileArray) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          setUploading(false)
          return
        }
      }

      // Upload all files
      const uploadPromises = fileArray.map((file) => uploadFile(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      // Filter out failed uploads
      const successfulUrls = uploadedUrls.filter((url): url is string => url !== null)

      if (successfulUrls.length === 0) {
        setError('Nahrávání se nezdařilo. Zkuste to prosím znovu.')
        setUploading(false)
        return
      }

      // Update images
      let newImages: string[]
      if (type === 'profile') {
        newImages = successfulUrls.slice(0, 1)
      } else {
        newImages = [...images, ...successfulUrls].slice(0, maxImages)
      }

      setImages(newImages)
      onImagesChange(newImages)
    } catch (err) {
      console.error('Error handling files:', err)
      setError('Došlo k chybě při nahrávání')
    } finally {
      setUploading(false)
    }
  }

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Handle file input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  // Handle button click
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Remove image
  const removeImage = async (index: number) => {
    const imageUrl = images[index]

    // Extract path from URL
    const urlParts = imageUrl.split('/vehicle-images/')
    if (urlParts.length === 2) {
      const filePath = urlParts[1]

      // Delete from storage
      try {
        await supabase.storage.from('vehicle-images').remove([filePath])
      } catch (err) {
        console.error('Error deleting image:', err)
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Upload Area */}
      {(type === 'profile' ? images.length === 0 : images.length < maxImages) && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={type === 'gallery'}
            onChange={handleChange}
            disabled={uploading}
          />

          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="text-sm text-gray-600">
              {type === 'profile' ? (
                <p>
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="font-medium text-red-600 hover:text-red-500"
                    disabled={uploading}
                  >
                    Nahrajte profilovou fotografii
                  </button>{' '}
                  nebo přetáhněte soubor
                </p>
              ) : (
                <p>
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="font-medium text-red-600 hover:text-red-500"
                    disabled={uploading}
                  >
                    Nahrajte fotografie
                  </button>{' '}
                  nebo přetáhněte soubory
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP až do 5MB
              {type === 'gallery' && ` (max ${maxImages} fotografií)`}
            </p>
          </div>

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="text-sm text-gray-600">Nahrávání...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div
          className={
            type === 'profile'
              ? 'flex justify-center'
              : 'grid grid-cols-2 md:grid-cols-3 gap-4'
          }
        >
          {images.map((imageUrl, index) => (
            <div
              key={imageUrl}
              className={`relative group ${
                type === 'profile'
                  ? 'w-32 h-32 rounded-full overflow-hidden'
                  : 'aspect-square rounded-lg overflow-hidden'
              }`}
            >
              <Image
                src={imageUrl}
                alt={type === 'profile' ? 'Profilová fotografie' : `Fotografie ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {type === 'gallery' && images.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          {images.length} z {maxImages} fotografií
        </p>
      )}
    </div>
  )
}
