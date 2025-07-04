import React from 'react';
import { Settings } from 'lucide-react';
import { useCookieConsent } from '../contexts/CookieConsentContext';

interface CookiePreferencesButtonProps {
  className?: string;
  variant?: 'default' | 'small' | 'text';
}

const CookiePreferencesButton: React.FC<CookiePreferencesButtonProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const { setShowPreferences } = useCookieConsent();

  if (variant === 'small') {
    return (
      <button
        onClick={() => setShowPreferences(true)}
        className={`p-2 text-gray-400 hover:text-electric transition-colors ${className}`}
        aria-label="Cookie Preferences"
      >
        <Settings className="h-4 w-4" />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={() => setShowPreferences(true)}
        className={`text-gray-400 hover:text-electric transition-colors ${className}`}
      >
        Cookie Preferences
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowPreferences(true)}
      className={`inline-flex items-center px-4 py-2 bg-white/10 text-white font-rajdhani rounded-lg hover:bg-white/20 transition-colors ${className}`}
    >
      <Settings className="h-4 w-4 mr-2" />
      <span>Cookie Preferences</span>
    </button>
  );
};

export default CookiePreferencesButton;