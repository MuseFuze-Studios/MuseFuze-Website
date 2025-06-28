import React from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const { showConsent, acceptCookies, declineCookies } = useCookieConsent();

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl mx-auto">
        <div className="flex items-start space-x-4">
          <Cookie className="h-8 w-8 text-electric flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-orbitron font-bold mb-2 text-white">Cookie Consent</h3>
            <p className="text-gray-300 font-rajdhani mb-4">
              We use essential cookies to provide secure authentication and improve your experience. 
              These cookies are necessary for the website to function properly and cannot be disabled.
            </p>
            <p className="text-sm text-gray-400 font-rajdhani mb-4">
              By accepting, you agree to our use of cookies as described in our{' '}
              <Link to="/cookies-policy" className="text-electric hover:underline">
                Cookie Policy
              </Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="text-electric hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptCookies}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Cookies
              </button>
              <button
                onClick={declineCookies}
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-rajdhani font-bold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;