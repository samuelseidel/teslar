'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null) => void
  onRemove?: () => void
  label?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  maxSizeMB?: number
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Upload Image',
  aspectRatio = 'auto',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      setError(`Image must be less than ${maxSizeMB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onRemove) {
      onRemove()
    }
  }

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-auto',
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <Card className="relative group bg-white/5 border-white/20 overflow-hidden">
          <CardContent className="p-0">
            <div className={`relative ${aspectClasses[aspectRatio]} w-full overflow-hidden`}>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? 'border-red-500 bg-red-500/10'
              : error
              ? 'border-red-500 bg-red-500/5'
              : 'border-white/20 bg-white/5 hover:border-red-500/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                {isDragging ? (
                  <Upload className="w-8 h-8 text-red-500 animate-bounce" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-white font-medium mb-1">{label}</p>
                <p className="text-sm text-gray-400">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max {maxSizeMB}MB • JPG, PNG, WebP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>
          {error}
        </p>
      )}
    </div>
  )
}
