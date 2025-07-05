export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentContextType {
  showBanner: boolean;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  preferences: CookiePreferences;
  hasConsented: boolean;
  acceptAll: () => void;
  acceptEssentialOnly: () => void;
  updatePreferences: (preferences: CookiePreferences) => void;
  isCookieAllowed: (type: keyof CookiePreferences) => boolean;
  resetConsent: () => void;
}

export interface CookieInfo {
  name: string;
  purpose: string;
  type: keyof CookiePreferences;
  duration: string;
  provider: string;
}