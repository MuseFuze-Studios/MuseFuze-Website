import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CookieConsentContextType } from '../types/cookies';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('musefuze-cookie-consent');
    if (consent === 'accepted') {
      setHasConsented(true);
      setShowConsent(false);
    } else if (consent === 'declined') {
      setHasConsented(false);
      setShowConsent(false);
    } else {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('musefuze-cookie-consent', 'accepted');
    setHasConsented(true);
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('musefuze-cookie-consent', 'declined');
    setHasConsented(false);
    setShowConsent(false);
  };

  const value = {
    hasConsented,
    showConsent,
    acceptCookies,
    declineCookies,
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
};