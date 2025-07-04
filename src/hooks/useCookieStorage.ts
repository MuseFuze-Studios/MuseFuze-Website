import { useState, useEffect } from 'react';
import { useCookieConsent } from '../contexts/CookieConsentContext';

/**
 * Custom hook for storing data with respect to cookie consent
 * @param key Storage key
 * @param initialValue Initial value
 * @param cookieType Cookie type (essential, functional, analytics, marketing)
 * @returns [value, setValue, removeValue]
 */
export function useCookieStorage<T>(
  key: string,
  initialValue: T,
  cookieType: 'essential' | 'functional' | 'analytics' | 'marketing' = 'essential'
): [T, (value: T) => void, () => void] {
  const { isCookieAllowed } = useCookieConsent();
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from storage based on cookie type
      if (isCookieAllowed(cookieType)) {
        // For non-essential cookies that are allowed, try localStorage first
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } else if (cookieType === 'essential') {
        // For essential cookies, try sessionStorage
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return initialValue;
    }
  });

  // Update storage when value changes
  useEffect(() => {
    try {
      if (isCookieAllowed(cookieType)) {
        // For allowed cookies, store in localStorage
        localStorage.setItem(key, JSON.stringify(storedValue));
      } else if (cookieType === 'essential') {
        // For essential cookies, store in sessionStorage
        sessionStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }, [key, storedValue, cookieType, isCookieAllowed]);

  // Update value
  const setValue = (value: T) => {
    try {
      // Save to state
      setStoredValue(value);
      
      // Save to storage based on cookie type
      if (isCookieAllowed(cookieType)) {
        localStorage.setItem(key, JSON.stringify(value));
      } else if (cookieType === 'essential') {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  // Remove value
  const removeValue = () => {
    try {
      // Remove from state
      setStoredValue(initialValue);
      
      // Remove from storage
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  };

  return [storedValue, setValue, removeValue];
}