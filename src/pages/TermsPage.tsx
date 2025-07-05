import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
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
            <FileText className="h-16 w-16 text-electric mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 font-rajdhani">
              The rules and guidelines for using MuseFuze Studios
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-8">
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                By accessing and using the MuseFuze Studios website and services, you accept and agree to be 
                bound by the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed mb-4">
                MuseFuze Studios provides:
              </p>
              <ul className="text-gray-300 font-rajdhani space-y-2">
                <li>• Game development and software creation services</li>
                <li>• User accounts and authentication</li>
                <li>• Staff collaboration tools and dashboards</li>
                <li>• Community features and messaging</li>
                <li>• File sharing and project management tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-electric mb-2">Account Creation</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• You must provide accurate and complete information</li>
                    <li>• You are responsible for maintaining account security</li>
                    <li>• You must be at least 13 years old to create an account</li>
                    <li>• One account per person is allowed</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-orbitron font-bold text-neon mb-2">Account Responsibilities</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Keep your password secure and confidential</li>
                    <li>• Notify us immediately of any unauthorized access</li>
                    <li>• You are liable for all activities under your account</li>
                    <li>• Do not share your account with others</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">4. Acceptable Use</h2>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-green-400 mb-2">You May:</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Use our services for legitimate purposes</li>
                    <li>• Share content you own or have permission to share</li>
                    <li>• Collaborate with team members on projects</li>
                    <li>• Provide feedback and suggestions</li>
                  </ul>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-orbitron font-bold text-red-400 mb-2">You May Not:</h3>
                  <ul className="text-gray-300 font-rajdhani space-y-1">
                    <li>• Upload malicious software or viruses</li>
                    <li>• Harass, abuse, or harm other users</li>
                    <li>• Share copyrighted content without permission</li>
                    <li>• Attempt to hack or compromise our systems</li>
                    <li>• Use the service for illegal activities</li>
                    <li>• Spam or send unsolicited messages</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">5. Content and Intellectual Property</h2>
              <div className="space-y-4">
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  <strong>Your Content:</strong> You retain ownership of content you upload or create. 
                  By sharing content, you grant us a license to store, display, and distribute it as 
                  necessary to provide our services.
                </p>
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  <strong>Our Content:</strong> All MuseFuze Studios branding, software, and original 
                  content is protected by copyright and other intellectual property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">6. Privacy and Data Protection</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is 
                governed by our Privacy Policy. By using our services, you consent to the collection 
                and use of information as outlined in our Privacy Policy.
              </p>
              <div className="mt-4">
                <Link 
                  to="/privacy-policy" 
                  className="text-electric hover:text-neon transition-colors duration-200 font-rajdhani font-medium"
                >
                  Read our Privacy Policy →
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">7. Service Availability</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                We strive to maintain high availability but cannot guarantee uninterrupted service. 
                We may temporarily suspend service for maintenance, updates, or due to circumstances 
                beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                MuseFuze Studios shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">9. Termination</h2>
              <div className="space-y-4">
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  <strong>By You:</strong> You may terminate your account at any time by contacting us.
                </p>
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  <strong>By Us:</strong> We may terminate or suspend your account if you violate these 
                  terms or engage in harmful behavior.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of 
                significant changes via email or website notice. Continued use of our services 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-4">11. Contact Information</h2>
              <p className="text-gray-300 font-rajdhani leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-electric font-rajdhani">
                  Email: admin@musefuzestudios.com<br />
                  Subject: Terms of Service Inquiry<br />
                  Address: MuseFuze Studios Legal Department
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

export default TermsPage;