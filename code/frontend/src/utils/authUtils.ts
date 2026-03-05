/**
 * JWT Token utilities for handling authentication tokens
 */

interface DecodedToken {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  exp?: number; // JWT expiration timestamp
  iat?: number; // JWT issued at timestamp
  [key: string]: any;
}

/**
 * Decode JWT token (without verification - this happens on backend)
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // If we can't decode or no expiration, consider it expired
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

/**
 * Get authentication data from localStorage with validation
 */
export function getAuthData(): { token: string; userType: string; user: any } | null {
  try {
    const authDataStr = localStorage.getItem('agriconnect_auth');
    if (!authDataStr) return null;

    const authData = JSON.parse(authDataStr);
    
    // Validate auth data structure
    if (!authData.token || !authData.userType) {
      console.warn('Invalid auth data structure');
      clearAuthData();
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(authData.token)) {
      console.warn('JWT token has expired');
      clearAuthData();
      return null;
    }

    return authData;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    clearAuthData();
    return null;
  }
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem('agriconnect_auth');
  localStorage.removeItem('lastActivityTime');
}

/**
 * Check if user is authenticated and token is valid
 */
export function isAuthenticated(): boolean {
  return getAuthData() !== null;
}

/**
 * Check if user has admin role
 */
export function isAdmin(): boolean {
  const auth = getAuthData();
  return auth?.userType === 'admin';
}

/**
 * Check if user has farmer role
 */
export function isFarmer(): boolean {
  const auth = getAuthData();
  return auth?.userType === 'farmer';
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;

  const currentTime = Date.now() / 1000;
  const timeUntilExpiration = (decoded.exp - currentTime) * 1000;
  
  return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
}
