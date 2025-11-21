'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MultiImageUploadProps {
  value?: string[]
  onChange: (files: File[]) => void
  onRemove?: (index: number) => void
  maxImages?: number
  maxSizeMB?: number
}

export default function MultiImageUpload({
  value = [],
  onChange,
  onRemove,
  maxImages = 5,
  maxSizeMB = 5,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(value)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFiles = (files: FileList) => {
    setError(null)

    const fileArray = Array.from(files)
    const totalImages = previews.length + fileArray.length

    if (totalImages > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    // Validate files
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return
      }

      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        setError(`Each image must be less than ${maxSizeMB}MB`)
        return
      }
    }

    // Create previews
    const newPreviews: string[] = []
    let loadedCount = 0

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        loadedCount++

        if (loadedCount === fileArray.length) {
          setPreviews([...previews, ...newPreviews])
          const allFiles = [...selectedFiles, ...fileArray]
          setSelectedFiles(allFiles)
          onChange(allFiles)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
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
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = selectedFiles.filter((_, i) => i !== index)

    setPreviews(newPreviews)
    setSelectedFiles(newFiles)
    onChange(newFiles)

    if (onRemove) {
      onRemove(index)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const canAddMore = previews.length < maxImages

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="relative group bg-white/5 border-white/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={preview}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-black/60 text-white border-white/20">
                    {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
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
                <p className="text-white font-medium mb-1">
                  Add Vehicle Images ({previews.length}/{maxImages})
                </p>
                <p className="text-sm text-gray-400">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max {maxSizeMB}MB each • JPG, PNG, WebP
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

      {previews.length >= maxImages && (
        <p className="text-sm text-gray-400 text-center">
          Maximum {maxImages} images reached
        </p>
      )}
    </div>
  )
}
