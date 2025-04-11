/**
 * Environment variables utility
 *
 * Provides a safe way to access environment variables in the browser
 */

/**
 * Gets an environment variable
 *
 * In a create-react-app environment, all environment variables
 * must be prefixed with REACT_APP_ to be available in the browser
 *
 * @param key The environment variable key
 * @returns The value or undefined if not found
 */
export function getEnv(key: string): string | undefined {
  if (process.env[key]) {
    return process.env[key];
  }
  return undefined;
}
