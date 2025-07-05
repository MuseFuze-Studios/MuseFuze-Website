import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CookiePreferences, CookieConsentContextType } from '../types/cookies';
import { setCookie, getCookie, deleteCookie, clearAllCookies } from '../utils/cookieUtils';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export const CookieConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentCookie = getCookie('musefuze-cookie-consent', 'essential', { essential: true, functional: false, analytics: false, marketing: false });
    const preferencesCookie = getCookie('musefuze-cookie-preferences', 'essential', { essential: true, functional: false, analytics: false, marketing: false });

    if (consentCookie) {
      setHasConsented(true);
      if (preferencesCookie) {
        try {
          const savedPreferences = JSON.parse(preferencesCookie);
          setPreferences({ ...defaultPreferences, ...savedPreferences });
        } catch (error) {
          console.error('Error parsing cookie preferences:', error);
          setPreferences(defaultPreferences);
        }
      }
    } else {
      // Show banner if no consent has been given
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(allAccepted);
    setHasConsented(true);
    setShowBanner(false);
    
    // Store consent with full preferences
    setCookie('musefuze-cookie-consent', 'true', 365, 'essential', allAccepted);
    setCookie('musefuze-cookie-preferences', JSON.stringify(allAccepted), 365, 'essential', allAccepted);
  };

  const acceptEssentialOnly = () => {
    setPreferences(defaultPreferences);
    setHasConsented(true);
    setShowBanner(false);
    
    // Store minimal consent
    setCookie('musefuze-cookie-consent', 'essential-only', 365, 'essential', defaultPreferences);
    setCookie('musefuze-cookie-preferences', JSON.stringify(defaultPreferences), 365, 'essential', defaultPreferences);
    
    // Clear any existing non-essential cookies
    clearAllCookies(true);
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    // Ensure essential is always true
    const updatedPreferences = { ...newPreferences, essential: true };
    
    setPreferences(updatedPreferences);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
    
    // Store updated preferences
    setCookie('musefuze-cookie-consent', 'custom', 365, 'essential', updatedPreferences);
    setCookie('musefuze-cookie-preferences', JSON.stringify(updatedPreferences), 365, 'essential', updatedPreferences);
    
    // If user disabled some cookies, clear them
    if (!updatedPreferences.functional || !updatedPreferences.analytics || !updatedPreferences.marketing) {
      clearAllCookies(true);
    }
  };

  const isCookieAllowed = (type: keyof CookiePreferences): boolean => {
    return preferences[type];
  };

  const resetConsent = () => {
    setPreferences(defaultPreferences);
    setHasConsented(false);
    setShowBanner(true);
    setShowPreferences(false);
    
    // Clear all consent cookies
    deleteCookie('musefuze-cookie-consent');
    deleteCookie('musefuze-cookie-preferences');
    clearAllCookies(false);
  };

  const value: CookieConsentContextType = {
    showBanner,
    showPreferences,
    setShowPreferences,
    preferences,
    hasConsented,
    acceptAll,
    acceptEssentialOnly,
    updatePreferences,
    isCookieAllowed,
    resetConsent,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};