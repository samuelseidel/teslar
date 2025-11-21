'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  profileImage?: string | null
  vehicleName: string
}

export default function ImageGallery({ images, profileImage, vehicleName }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentMainIndex, setCurrentMainIndex] = useState(0) // Current image shown in main view
  const [lightboxIndex, setLightboxIndex] = useState(0) // Current image in lightbox

  // Combine profile image and additional images
  const allImages = [
    ...(profileImage ? [profileImage] : []),
    ...(images || [])
  ]

  const openLightbox = () => {
    setLightboxIndex(currentMainIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const goToMainPrevious = () => {
    setCurrentMainIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const goToMainNext = () => {
    setCurrentMainIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  // Keyboard navigation for lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') closeLightbox()
  }

  // Handle click on main image - check if it's in left/right 30% zones
  const handleMainImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const imageWidth = rect.width
    const leftZone = imageWidth * 0.3
    const rightZone = imageWidth * 0.7

    if (allImages.length > 1 && clickX < leftZone) {
      // Clicked in left 30% - go to previous
      e.stopPropagation()
      goToMainPrevious()
    } else if (allImages.length > 1 && clickX > rightZone) {
      // Clicked in right 30% - go to next
      e.stopPropagation()
      goToMainNext()
    } else {
      // Clicked in center 40% - open lightbox
      openLightbox()
    }
  }

  if (allImages.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        <div className="w-full h-96 bg-gradient-to-br from-red-900/20 to-gray-900/20 flex items-center justify-center">
          <svg className="w-32 h-32 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Image */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        <div
          className="w-full h-96 cursor-pointer relative group"
          onClick={handleMainImageClick}
        >
          <img
            src={allImages[currentMainIndex]}
            alt={vehicleName}
            className="w-full h-full object-cover"
          />

          {/* Left/Right navigation hints on hover */}
          {allImages.length > 1 && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-4">
                <div className="bg-white/90 rounded-full p-2">
                  <ChevronLeft className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4">
                <div className="bg-white/90 rounded-full p-2">
                  <ChevronRight className="w-6 h-6 text-gray-900" />
                </div>
              </div>
            </>
          )}

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
              {currentMainIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2 p-4 bg-black/20">
            {allImages.slice(0, 5).map((img, idx) => (
              <div
                key={idx}
                className={`relative cursor-pointer group transition-all ${
                  idx === currentMainIndex
                    ? 'ring-2 ring-red-500'
                    : 'hover:opacity-80'
                }`}
                onClick={() => setCurrentMainIndex(idx)}
              >
                <img
                  src={img}
                  alt={`${vehicleName} image ${idx + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                {idx === 4 && allImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{allImages.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm z-10">
            {lightboxIndex + 1} / {allImages.length}
          </div>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Current Image */}
          <div
            className="max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[lightboxIndex]}
              alt={`${vehicleName} ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>

          {/* Next Button */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-2xl overflow-x-auto px-4">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(idx)
                  }}
                  className={`flex-shrink-0 cursor-pointer transition-all ${
                    idx === lightboxIndex
                      ? 'ring-2 ring-red-500 opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
