/**
 * Cookie utility functions that respect user consent
 */
import { CookiePreferences } from '../contexts/CookieConsentContext';

/**
 * Set a cookie with respect to user consent
 * @param name Cookie name
 * @param value Cookie value
 * @param days Days until expiration (if not provided, cookie expires when browser is closed)
 * @param type Cookie type (essential, functional, analytics, marketing)
 * @param preferences User's cookie preferences
 * @returns boolean indicating if cookie was set
 */
export function setCookie(
  name: string,
  value: string,
  days?: number,
  type: keyof CookiePreferences = 'essential',
  preferences: CookiePreferences = { essential: true, functional: false, analytics: false, marketing: false }
): boolean {
  // Check if this type of cookie is allowed
  if (!preferences[type]) {
    console.log(`Cookie "${name}" not set because ${type} cookies are disabled`);
    return false;
  }

  let expires = '';
  
  // Set expiration if days provided
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  
  // Set the cookie
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Strict`;
  return true;
}

/**
 * Get a cookie value
 * @param name Cookie name
 * @param type Cookie type (essential, functional, analytics, marketing)
 * @param preferences User's cookie preferences
 * @returns Cookie value or empty string if not found or not allowed
 */
export function getCookie(
  name: string,
  type: keyof CookiePreferences = 'essential',
  preferences: CookiePreferences = { essential: true, functional: false, analytics: false, marketing: false }
): string {
  // Check if this type of cookie is allowed
  if (!preferences[type]) {
    console.log(`Cannot access cookie "${name}" because ${type} cookies are disabled`);
    return '';
  }
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return '';
}

/**
 * Delete a cookie
 * @param name Cookie name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

/**
 * Clear all cookies (except essential ones if keepEssential is true)
 * @param keepEssential Whether to keep essential cookies
 */
export function clearAllCookies(keepEssential = true): void {
  const cookies = document.cookie.split(';');
  
  // Essential cookies that should be preserved if keepEssential is true
  const essentialCookies = ['musefuze-cookie-consent', 'musefuze-cookie-preferences'];
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    if (keepEssential && essentialCookies.includes(name)) {
      continue;
    }
    
    deleteCookie(name);
  }
}

/**
 * Check if cookies are enabled in the browser
 * @returns boolean indicating if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  try {
    document.cookie = 'cookietest=1';
    const result = document.cookie.indexOf('cookietest=') !== -1;
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    return result;
  } catch (e) {
    return false;
  }
}