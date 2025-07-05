import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Shield, BarChart3, Target, Wrench } from 'lucide-react';
import CookiePreferencesButton from '../components/CookiePreferencesButton';

const CookiesPolicyPage: React.FC = () => {
  const cookieTypes = [
    {
      icon: Shield,
      title: 'Essential Cookies',
      description: 'Required for basic site functionality, security, and user authentication.',
      examples: ['Session tokens', 'Security tokens', 'Authentication cookies'],
      canDisable: false,
    },
    {
      icon: Wrench,
      title: 'Functional Cookies',
      description: 'Enable enhanced features like remembering your preferences and settings.',
      examples: ['Language preferences', 'Theme settings', 'User interface preferences'],
      canDisable: true,
    },
    {
      icon: BarChart3,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors use our site to improve user experience.',
      examples: ['Page views', 'User interactions', 'Performance metrics'],
      canDisable: true,
    },
    {
      icon: Target,
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant content and track advertising effectiveness.',
      examples: ['Ad targeting', 'Campaign tracking', 'Social media integration'],
      canDisable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-electric transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-rajdhani">Back to Home</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Cookie className="h-16 w-16 text-electric mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-300 font-rajdhani">
              How we use cookies and similar technologies
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-8">
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">What Are Cookies?</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                enabling certain functionality.
              </p>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                We respect your privacy and give you full control over which cookies you accept. 
                You can customize your preferences at any time using our cookie preference center.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Types of Cookies We Use</h2>
              <div className="grid gap-6">
                {cookieTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.title}
                      className="bg-white/5 rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-start space-x-4">
                        <Icon className="h-8 w-8 text-electric flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-orbitron font-bold text-white">{type.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              type.canDisable 
                                ? 'text-yellow-400 bg-yellow-900/30' 
                                : 'text-green-400 bg-green-900/30'
                            }`}>
                              {type.canDisable ? 'Optional' : 'Required'}
                            </span>
                          </div>
                          <p className="text-gray-300 font-rajdhani mb-4">{type.description}</p>
                          <div>
                            <h4 className="text-sm font-orbitron font-bold text-gray-300 mb-2">Examples:</h4>
                            <ul className="text-gray-400 font-rajdhani text-sm space-y-1">
                              {type.examples.map((example, index) => (
                                <li key={index}>• {example}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">How We Use Cookies</h2>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-green-400 mb-2">Essential Functions</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Keep you logged in during your session</li>
                    <li>• Remember your security preferences</li>
                    <li>• Protect against fraud and security threats</li>
                    <li>• Enable core website functionality</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-blue-400 mb-2">User Experience</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Remember your language and region preferences</li>
                    <li>• Save your theme and display settings</li>
                    <li>• Provide personalized content recommendations</li>
                    <li>• Improve site performance and loading times</li>
                  </ul>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-purple-400 mb-2">Analytics & Improvement</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Understand how visitors use our website</li>
                    <li>• Identify popular content and features</li>
                    <li>• Detect and fix technical issues</li>
                    <li>• Measure the effectiveness of our services</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Your Cookie Choices</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-6">
                You have full control over which cookies we use. You can accept all cookies, 
                reject optional cookies, or customize your preferences for each type of cookie.
              </p>
              
              <div className="bg-electric/10 border border-electric/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-orbitron font-bold text-white mb-4">
                  Manage Your Cookie Preferences
                </h3>
                <p className="text-gray-300 font-rajdhani mb-4">
                  Click the button below to open your cookie preference center and customize your settings.
                </p>
                <CookiePreferencesButton />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                Some cookies may be set by third-party services that appear on our pages. We do not 
                control these cookies, and they are subject to the respective third party's privacy policies.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="text-lg font-orbitron font-bold text-yellow-400 mb-2">Current Third-Party Services</h3>
                <ul className="text-gray-300 font-rajdhani space-y-1">
                  <li>• Google Fonts (for typography)</li>
                  <li>• Content Delivery Networks (for performance)</li>
                  <li>• Analytics services (when enabled)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Cookie Retention</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                Different cookies have different lifespans:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-electric mb-2">Session Cookies</h3>
                  <p className="text-gray-300 font-rajdhani text-sm">
                    Deleted when you close your browser. Used for essential functions like keeping you logged in.
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-neon mb-2">Persistent Cookies</h3>
                  <p className="text-gray-300 font-rajdhani text-sm">
                    Stored for a specific period (typically 1 year) to remember your preferences across visits.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Browser Settings</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                You can also control cookies through your browser settings. However, disabling certain 
                cookies may affect the functionality of our website.
              </p>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-orbitron font-bold text-white mb-2">Popular Browser Settings</h3>
                <ul className="text-gray-300 font-rajdhani space-y-1 text-sm">
                  <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                  <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li>• <strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Updates to This Policy</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any material 
                changes by posting the updated policy on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-electric font-rajdhani">
                  Email: privacy@musefuze.com<br />
                  Subject: Cookie Policy Inquiry<br />
                  Response Time: Within 48 hours
                </p>
              </div>
            </section>

            <div className="text-center pt-8 border-t border-white/10">
              <p className="text-gray-400 font-rajdhani text-sm">
                Last updated: {new Date().toLocaleDateString()}<br />
                Effective date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicyPage;