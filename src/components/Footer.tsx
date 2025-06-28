import React from 'react';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-electric" />
              <span className="text-2xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
                MuseFuze Studios
              </span>
            </div>
            <p className="text-gray-300 font-rajdhani mb-6 max-w-md">
              Innovating boldly. Creating fearlessly. Pushing the boundaries of what's possible in games and software.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-electric transition-colors duration-200">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric transition-colors duration-200">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:hello@musefuze.com" className="text-gray-400 hover:text-electric transition-colors duration-200">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-orbitron font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Shop', 'Team', 'Join Us'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                    className="text-gray-300 hover:text-electric transition-colors duration-200 font-rajdhani"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-lg font-orbitron font-bold mb-4 text-white">Legal & Contact</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-electric transition-colors duration-200 font-rajdhani">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-electric transition-colors duration-200 font-rajdhani">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies-policy" className="text-gray-300 hover:text-electric transition-colors duration-200 font-rajdhani">
                  Cookie Policy
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-800">
                <a href="mailto:hello@musefuze.com" className="text-gray-300 hover:text-electric transition-colors duration-200 font-rajdhani">
                  Contact me directly! - kaiingram.ceo@musefuzestudios.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 font-rajdhani">
            &copy; 2025 MuseFuze Studios. All rights reserved. Made with ⚡ and lots of caffeine.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;