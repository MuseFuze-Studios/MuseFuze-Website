export interface CookieConsentContextType {
  hasConsented: boolean;
  showConsent: boolean;
  acceptCookies: () => void;
  declineCookies: () => void;
}