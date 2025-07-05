import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
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
            <Shield className="h-16 w-16 text-electric mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 font-rajdhani">
              How we protect and handle your personal information
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-8">
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                {/* Personal Information */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-electric mb-2">Personal Information</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Full name (first and last)</li>
                    <li>• Email address</li>
                    <li>• Username and profile avatar</li>
                    <li>• Date of birth (if provided)</li>
                    <li>• Country of registration</li>
                    <li>• Account credentials (securely hashed)</li>
                    <li>• Role or access level (e.g. user, staff, dev tester)</li>
                    <li>• Consent preferences (e.g. marketing, data processing)</li>
                  </ul>
                </div>

                {/* Usage Information */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-neon mb-2">Usage Information</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Login timestamps and session data</li>
                    <li>• Messages, comments, and posts made on the platform</li>
                    <li>• Uploaded or created content</li>
                    <li>• Referrer and sign-up source</li>
                    <li>• Feature usage and tool interactions</li>
                  </ul>
                </div>

                {/* Technical Information */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-cyber mb-2">Technical Information</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• IP address (last login)</li>
                    <li>• Device and browser type</li>
                    <li>• Preferred language</li>
                    <li>• Cookies and session tokens</li>
                  </ul>
                </div>
              </div>
            </section>


            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-green-400 mb-2">Primary Uses</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Provide and maintain our services</li>
                    <li>• Authenticate and secure your account</li>
                    <li>• Enable collaboration and communication</li>
                    <li>• Improve our services and user experience</li>
                    <li>• Respond to support requests</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-blue-400 mb-2">Security Uses</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Detect and prevent fraud</li>
                    <li>• Monitor for security threats</li>
                    <li>• Enforce our terms of service</li>
                    <li>• Comply with legal obligations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">3. Data Security</h2>
              <div className="space-y-4">
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-electric font-orbitron font-bold mb-2">Encryption</h4>
                    <ul className="text-gray-300 font-rajdhani text-sm space-y-1">
                      <li>• HTTPS/TLS for data transmission</li>
                      <li>• Bcrypt for password hashing</li>
                      <li>• JWT tokens for authentication</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-neon font-orbitron font-bold mb-2">Access Control</h4>
                    <ul className="text-gray-300 font-rajdhani text-sm space-y-1">
                      <li>• Role-based permissions</li>
                      <li>• Secure database access</li>
                      <li>• Regular security audits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-red-400 mb-2">We Do NOT:</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Sell your personal information to third parties</li>
                    <li>• Use your data for advertising purposes</li>
                    <li>• Share data with marketing companies</li>
                    <li>• Track you across other websites</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-yellow-400 mb-2">Limited Sharing</h3>
                  <p className="text-gray-300 font-rajdhani mb-2">We may share information only in these specific cases:</p>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• With your explicit consent</li>
                    <li>• To comply with legal requirements</li>
                    <li>• To protect our rights and safety</li>
                    <li>• In case of business transfer (with notice)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Additional Compliance Information</h2>
              
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-neon mb-2">Analytics & Tracking</h3>
                  <p className="text-gray-300 font-rajdhani">
                    We do <strong>not</strong> use any third-party analytics or ad tracking tools on our platform.
                    All data processing is handled internally with full respect for user privacy and transparency.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-electric mb-2">GDPR Legal Basis</h3>
                  <p className="text-gray-300 font-rajdhani">
                    We process your personal data under the following lawful bases, as defined by the UK GDPR:
                  </p>
                  <ul className="text-gray-300 font-rajdhani list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Consent:</strong> When you explicitly agree to data collection or communications.</li>
                    <li><strong>Contractual Necessity:</strong> To provide services you’ve signed up for.</li>
                    <li><strong>Legitimate Interest:</strong> To maintain security, improve experience, or prevent fraud, where your rights do not override our interests.</li>
                  </ul>
                </div>
              </div>
            </section>


            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">5. Your Rights and Choices</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-electric mb-2">Access & Control</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• View your personal data</li>
                    <li>• Update your information</li>
                    <li>• Download your data</li>
                    <li>• Delete your account</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-neon mb-2">Privacy Settings</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Manage cookie preferences</li>
                    <li>• Control data sharing</li>
                    <li>• Opt out of communications</li>
                    <li>• Request data correction</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">6. Data Retention</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                We retain your personal information only as long as necessary:
              </p>
              <ul className="text-gray-300 font-rajdhani space-y-2">
                <li>• <strong>Account Data:</strong> Until you delete your account</li>
                <li>• <strong>Session Data:</strong> 7 days after logout</li>
                <li>• <strong>Security Logs:</strong> 90 days for security purposes</li>
                <li>• <strong>Backup Data:</strong> 30 days in secure backups</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">7. International Data Transfers</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data in accordance with 
                this privacy policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                Our services are not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected 
                such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the updated policy on our website and sending you an email notification. 
                Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">10. Contact Us</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-electric font-rajdhani">
                  Email: admin@musefuzestudios.com<br />
                  Subject: Privacy Policy Inquiry<br />
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

export default PrivacyPolicyPage;