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
      setScrolled(window.scrollY > 50);
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <Zap className="h-8 w-8 text-electric" />
            <span className="text-2xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
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
                  className="font-rajdhani font-medium text-gray-300 hover:text-electric transition-colors duration-200 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-electric transition-all duration-200 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                // Show loading state
                <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-rajdhani">Dashboard</span>
                  </Link>
                  {isStaffOrAbove && (
                    <Link
                      to="/staff"
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-rajdhani">Staff</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-rajdhani">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="font-rajdhani font-medium text-gray-300 hover:text-electric transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/10 bg-black/50 backdrop-blur-xl rounded-lg">
            {['Home', 'About', 'Shop', 'Team', 'Join Us'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                className="block w-full text-left py-2 font-rajdhani font-medium text-gray-300 hover:text-electric transition-colors duration-200"
              >
                {item}
              </button>
            ))}
            
            <div className="border-t border-white/10 mt-4 pt-4">
              {loading ? (
                <div className="w-full h-8 bg-white/10 rounded animate-pulse"></div>
              ) : user ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 py-2 font-rajdhani font-medium text-gray-300 hover:text-electric transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  {isStaffOrAbove && (
                    <Link
                      to="/staff"
                      className="flex items-center space-x-2 py-2 font-rajdhani font-medium text-gray-300 hover:text-electric transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span>Staff</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 font-rajdhani font-medium text-red-400 hover:text-red-300 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block py-2 font-rajdhani font-medium text-gray-300 hover:text-electric transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block py-2 font-rajdhani font-medium text-electric hover:text-neon transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;