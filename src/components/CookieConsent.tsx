import React, { useState } from 'react';
import { X, Settings, Shield, BarChart3, Target, Wrench } from 'lucide-react';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { CookiePreferences } from '../types/cookies';

const CookieConsent: React.FC = () => {
  const {
    showBanner,
    showPreferences,
    setShowPreferences,
    preferences,
    acceptAll,
    acceptEssentialOnly,
    updatePreferences,
  } = useCookieConsent();

  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences);

  // Update temp preferences when modal opens
  React.useEffect(() => {
    if (showPreferences) {
      setTempPreferences(preferences);
    }
  }, [showPreferences, preferences]);

  if (!showBanner && !showPreferences) {
    return null;
  }

  const handleSavePreferences = () => {
    updatePreferences(tempPreferences);
  };

  const cookieTypes = [
    {
      key: 'essential' as keyof CookiePreferences,
      title: 'Essential Cookies',
      description: 'Required for basic site functionality, security, and user authentication.',
      icon: Shield,
      disabled: true,
    },
    {
      key: 'functional' as keyof CookiePreferences,
      title: 'Functional Cookies',
      description: 'Enable enhanced features like remembering your preferences and settings.',
      icon: Wrench,
      disabled: false,
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors use our site to improve user experience.',
      icon: BarChart3,
      disabled: false,
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant content and track advertising effectiveness.',
      icon: Target,
      disabled: false,
    },
  ];

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                  Cookie Preferences
                </h3>
                <p className="text-gray-300 font-rajdhani text-sm leading-relaxed">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  You can customize your preferences or accept all cookies to continue.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 font-rajdhani"
                >
                  <Settings className="h-4 w-4" />
                  <span>Customize</span>
                </button>
                <button
                  onClick={acceptEssentialOnly}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-rajdhani font-medium"
                >
                  Essential Only
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 bg-gradient-to-r from-electric to-neon text-black rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 font-rajdhani font-bold"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-orbitron font-bold text-white">
                Cookie Preferences
              </h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-300 font-rajdhani mb-8 leading-relaxed">
              Choose which cookies you'd like to allow. Essential cookies are required for basic 
              functionality and cannot be disabled.
            </p>

            <div className="space-y-6">
              {cookieTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.key}
                    className={`p-4 rounded-xl border transition-all ${
                      tempPreferences[type.key]
                        ? 'bg-electric/10 border-electric/30'
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Icon className={`h-6 w-6 mt-1 ${
                          tempPreferences[type.key] ? 'text-electric' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                            {type.title}
                          </h3>
                          <p className="text-gray-300 font-rajdhani text-sm">
                            {type.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempPreferences[type.key]}
                            disabled={type.disabled}
                            onChange={(e) => {
                              if (!type.disabled) {
                                setTempPreferences({
                                  ...tempPreferences,
                                  [type.key]: e.target.checked,
                                });
                              }
                            }}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            tempPreferences[type.key]
                              ? 'bg-electric'
                              : 'bg-gray-600'
                          } ${type.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              tempPreferences[type.key] ? 'translate-x-5' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={acceptEssentialOnly}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-rajdhani font-medium"
              >
                Essential Only
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 font-rajdhani font-bold"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;