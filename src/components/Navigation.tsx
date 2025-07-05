import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, loading } = useAuth();
  const isStaffOrAbove =
    user && ['dev_tester', 'developer', 'staff', 'admin', 'ceo'].includes(user.role);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#0f0f0f]/90 backdrop-blur-xl border-b border-white/20 shadow-xl'
        : 'bg-black/30 backdrop-blur-md border-b border-white/10'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center space-x-2 group transform transition-all duration-300 ${scrolled ? 'scale-95' : 'scale-100'}`}
          >
            <div
              className={`bg-gradient-to-br from-electric to-neon rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`}
            >
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className={`font-orbitron font-bold text-white transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>
              MuseFuze
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {['Home', 'About', 'Shop', 'Team', 'Join Us'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                  className={`font-rajdhani font-medium text-gray-300 hover:text-white transition-all duration-200 relative group py-2 ${scrolled ? 'scale-95 opacity-90' : ''}`}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-electric transition-all duration-200 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-20 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 font-rajdhani font-medium transform ${scrolled ? 'scale-95' : ''}`}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-xs font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  {isStaffOrAbove && (
                    <Link
                      to="/staff"
                      className={`px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-rajdhani font-medium shadow-lg hover:shadow-violet-500/25 transform ${scrolled ? 'scale-95' : ''}`}
                    >
                      Staff
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 transform ${scrolled ? 'scale-95' : ''}`}
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className={`font-rajdhani font-medium text-gray-300 hover:text-white transition-all duration-200 ${scrolled ? 'scale-95 opacity-90' : ''}`}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className={`px-4 py-2 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 transform ${scrolled ? 'scale-95' : ''}`}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 transform ${scrolled ? 'scale-95' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div
              className={`px-2 pt-2 pb-3 space-y-1 rounded-2xl mt-2 border backdrop-blur-xl ${scrolled ? 'bg-[#0f0f0f]/90 border-white/20' : 'bg-black/70 border-white/10'}`}
            >
              {['Home', 'About', 'Shop', 'Team', 'Join Us'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                  className="block w-full text-left px-3 py-2 font-rajdhani font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  {item}
                </button>
              ))}
              
              <div className="border-t border-gray-800 mt-4 pt-4">
                {loading ? (
                  <div className="w-full h-8 bg-gray-800 rounded-lg animate-pulse"></div>
                ) : user ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 font-rajdhani font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-xs font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <span>Dashboard</span>
                    </Link>
                    {isStaffOrAbove && (
                      <Link
                        to="/staff"
                        className={`block px-3 py-2 font-rajdhani font-medium text-violet-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ${scrolled ? 'scale-95 opacity-90' : ''}`}
                      >
                        Staff Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className={`flex items-center space-x-2 px-3 py-2 font-rajdhani font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-all duration-200 w-full text-left ${scrolled ? 'scale-95' : ''}`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className={`block px-3 py-2 font-rajdhani font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ${scrolled ? 'scale-95 opacity-90' : ''}`}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className={`block px-3 py-2 font-rajdhani font-medium text-electric hover:text-neon hover:bg-gray-800 rounded-lg transition-all duration-200 ${scrolled ? 'scale-95' : ''}`}
                    >
                      Get started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;