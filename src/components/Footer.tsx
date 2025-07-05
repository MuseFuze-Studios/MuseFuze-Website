import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Mail, Heart } from 'lucide-react';
import CookiePreferencesButton from './CookiePreferencesButton';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <span className="text-2xl font-orbitron font-bold text-white">
                MuseFuze Studios
              </span>
            </div>
            <p className="text-gray-400 font-rajdhani mb-6 max-w-md leading-relaxed">
              Creating fearlessly, innovating boldly. We're building the future of interactive entertainment, 
              one ambitious project at a time.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/musefuze"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/musefuze"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:admin@musefuzestudios.com"
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-orbitron font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3 font-rajdhani">
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('about');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('team');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Our Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('join-us');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Join Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-orbitron font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-3 font-rajdhani">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <CookiePreferencesButton variant="text" className="text-gray-400 hover:text-white transition-colors duration-200" />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 font-rajdhani text-sm">
            © {new Date().getFullYear()} MuseFuze Studios. All rights reserved.
          </p>
          <p className="text-gray-400 font-rajdhani text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 text-red-400 mx-1" /> in the UK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;