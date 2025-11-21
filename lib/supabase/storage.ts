import { createClient } from './client'

/**
 * Upload an image to Supabase Storage
 * @param bucket - Storage bucket name (e.g., 'vehicle-images', 'profile-images')
 * @param path - File path within the bucket
 * @param file - File to upload
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Upload multiple images to Supabase Storage
 * @param bucket - Storage bucket name
 * @param basePath - Base path for all uploads
 * @param files - Array of files to upload
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
  bucket: string,
  basePath: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const timestamp = Date.now()
    const fileName = `${timestamp}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const path = `${basePath}/${fileName}`

    const url = await uploadImage(bucket, path, file)
    urls.push(url)
  }

  return urls
}

/**
 * Extract storage path from a Supabase public URL
 * @param url - Public URL from Supabase Storage
 * @param bucket - Storage bucket name
 * @returns File path within the bucket
 */
export function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split(`/object/public/${bucket}/`)
    return pathParts[1] || null
  } catch {
    return null
  }
}

/**
 * Upload vehicle profile image
 * @param ambassadorId - Ambassador ID
 * @param vehicleId - Vehicle ID
 * @param file - Image file
 * @returns Public URL
 */
export async function uploadVehicleProfileImage(
  ambassadorId: string,
  vehicleId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `profile-${timestamp}.${file.name.split('.').pop()}`
  const path = `${ambassadorId}/${vehicleId}/${fileName}`

  return uploadImage('vehicle-images', path, file)
}

/**
 * Upload vehicle additional images
 * @param ambassadorId - Ambassador ID
 * @param vehicleId - Vehicle ID
 * @param files - Array of image files
 * @returns Array of public URLs
 */
export async function uploadVehicleImages(
  ambassadorId: string,
  vehicleId: string,
  files: File[]
): Promise<string[]> {
  const basePath = `${ambassadorId}/${vehicleId}`
  return uploadMultipleImages('vehicle-images', basePath, files)
}

/**
 * Upload ambassador profile picture
 * @param ambassadorId - Ambassador ID
 * @param file - Image file
 * @returns Public URL
 */
export async function uploadAmbassadorProfileImage(
  ambassadorId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `profile-${timestamp}.${file.name.split('.').pop()}`
  const path = `${ambassadorId}/${fileName}`

  return uploadImage('profile-images', path, file)
}

/**
 * Delete vehicle images (cleanup)
 * @param imageUrls - Array of image URLs to delete
 * @param bucket - Storage bucket name
 */
export async function deleteVehicleImages(
  imageUrls: string[],
  bucket: string = 'vehicle-images'
): Promise<void> {
  for (const url of imageUrls) {
    const path = extractStoragePath(url, bucket)
    if (path) {
      try {
        await deleteImage(bucket, path)
      } catch (error) {
        console.error(`Failed to delete image at ${path}:`, error)
      }
    }
  }
}
