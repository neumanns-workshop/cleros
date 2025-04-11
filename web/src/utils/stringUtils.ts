/**
 * String utilities
 */

/**
 * Creates a hash code from a string
 * This is a simple and fast hash function similar to Java's String.hashCode()
 *
 * @param str The string to hash
 * @returns A hash code integer
 */
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates a more cryptographically secure hash using SHA-256
 * Note: This is async because it uses the Web Crypto API
 *
 * @param str The string to hash
 * @returns A hex string representation of the hash
 */
export async function sha256Hash(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (error) {
    console.error("Error generating SHA-256 hash:", error);
    // Fallback to simple hash
    return hashCode(str).toString(16);
  }
}

/**
 * Truncates a string to a maximum length with ellipsis
 *
 * @param str The string to truncate
 * @param maxLength Maximum length (default: 100)
 * @returns The truncated string
 */
export function truncate(str: string, maxLength: number = 100): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}
