/**
 * Distance calculation utilities using the Haversine formula
 * for calculating great-circle distances between two points on Earth
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(to.latitude - from.latitude)
  const dLon = toRadians(to.longitude - from.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string (e.g., "15 km", "2.5 km", "< 1 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return '< 1 km'
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`
  }
  return `${Math.round(distanceKm)} km`
}

/**
 * Sort an array of items by distance from a reference point
 * @param items - Array of items with coordinates
 * @param from - Reference coordinates
 * @param getCoordinates - Function to extract coordinates from an item
 * @returns Sorted array with distance information
 */
export function sortByDistance<T>(
  items: T[],
  from: Coordinates,
  getCoordinates: (item: T) => Coordinates | null
): (T & { distance?: number })[] {
  return items
    .map((item) => {
      const coords = getCoordinates(item)
      if (!coords) {
        return { ...item, distance: undefined }
      }
      return {
        ...item,
        distance: calculateDistance(from, coords),
      }
    })
    .sort((a, b) => {
      // Items with distance come first, sorted by distance
      // Items without distance come last
      if (a.distance === undefined && b.distance === undefined) return 0
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return a.distance - b.distance
    })
}

/**
 * Filter items within a certain radius
 * @param items - Array of items with coordinates
 * @param from - Center coordinates
 * @param radiusKm - Maximum distance in kilometers
 * @param getCoordinates - Function to extract coordinates from an item
 * @returns Filtered array of items within the radius
 */
export function filterByRadius<T>(
  items: T[],
  from: Coordinates,
  radiusKm: number,
  getCoordinates: (item: T) => Coordinates | null
): T[] {
  return items.filter((item) => {
    const coords = getCoordinates(item)
    if (!coords) return false
    const distance = calculateDistance(from, coords)
    return distance <= radiusKm
  })
}

/**
 * Get the center point (average) of multiple coordinates
 * @param coordinates - Array of coordinate objects
 * @returns Center point coordinates
 */
export function getCenterPoint(coordinates: Coordinates[]): Coordinates | null {
  if (coordinates.length === 0) return null

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  )

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  }
}
