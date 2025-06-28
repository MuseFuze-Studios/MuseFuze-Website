import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

const CookiesPolicyPage: React.FC = () => {
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
              How we use cookies to enhance your experience
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-8">
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">What Are Cookies?</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                keeping you logged in securely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">How We Use Cookies</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-electric mb-2">Essential Cookies</h3>
                  <p className="text-gray-300 font-rajdhani">
                    These cookies are necessary for the website to function properly. They enable core 
                    functionality such as security, network management, and accessibility. You cannot 
                    opt out of these cookies.
                  </p>
                  <ul className="mt-2 text-gray-400 font-rajdhani text-sm space-y-1">
                    <li>• Authentication tokens (JWT)</li>
                    <li>• Session management</li>
                    <li>• Security features</li>
                    <li>• Cookie consent preferences</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-neon mb-2">Functional Cookies</h3>
                  <p className="text-gray-300 font-rajdhani">
                    These cookies enable the website to provide enhanced functionality and personalization. 
                    They may be set by us or by third party providers whose services we have added to our pages.
                  </p>
                  <ul className="mt-2 text-gray-400 font-rajdhani text-sm space-y-1">
                    <li>• User preferences</li>
                    <li>• Language settings</li>
                    <li>• Theme preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">What We Don't Do</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <ul className="text-gray-300 font-rajdhani space-y-2">
                  <li>• We do not use cookies for advertising or tracking</li>
                  <li>• We do not sell your data to third parties</li>
                  <li>• We do not use analytics cookies without your consent</li>
                  <li>• We do not track your browsing across other websites</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Managing Cookies</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="text-gray-300 font-rajdhani space-y-2">
                <li>• <strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies</li>
                <li>• <strong>Our Cookie Banner:</strong> You can change your preferences using our cookie consent banner</li>
                <li>• <strong>Account Settings:</strong> Logged-in users can manage preferences in their dashboard</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 font-rajdhani text-sm">
                  <strong>Note:</strong> Disabling essential cookies may affect the functionality of our website, 
                  including your ability to log in and access your account.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Cookie Retention</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                Different cookies have different lifespans:
              </p>
              <ul className="mt-4 text-gray-300 font-rajdhani space-y-2">
                <li>• <strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li>• <strong>Authentication Cookies:</strong> Expire after 7 days of inactivity</li>
                <li>• <strong>Preference Cookies:</strong> Stored for up to 1 year</li>
                <li>• <strong>Consent Cookies:</strong> Stored until you change your preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Updates to This Policy</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any 
                material changes by posting the updated policy on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-electric font-rajdhani">
                  Email: privacy@musefuze.com<br />
                  Subject: Cookie Policy Inquiry
                </p>
              </div>
            </section>

            <div className="text-center pt-8 border-t border-white/10">
              <p className="text-gray-400 font-rajdhani text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicyPage;