/**
 * Name formatting utilities
 */

/**
 * Format ambassador name for public display with privacy
 * Shows first name + last initial (e.g., "Samuel S.")
 *
 * @param firstName - Ambassador's first name
 * @param lastName - Ambassador's last name
 * @returns Formatted name string (e.g., "Samuel S.")
 */
export function formatAmbassadorName(firstName: string, lastName: string): string {
  if (!firstName || !lastName) {
    return firstName || lastName || 'Ambassador'
  }

  const lastInitial = lastName.charAt(0).toUpperCase()
  return `${firstName} ${lastInitial}.`
}

/**
 * Get full name from first and last name
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name (e.g., "Samuel Seidel")
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}
