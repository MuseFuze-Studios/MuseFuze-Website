import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TowerControl as GameController2, Menu, X, LogOut, Settings, Users, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isStaffOrAbove = user && ['dev_tester', 'developer', 'staff', 'admin', 'ceo'].includes(user.role);
  const isAdminOrAbove = user && ['admin', 'ceo'].includes(user.role);

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <GameController2 className="h-8 w-8 text-violet-400 group-hover:text-violet-300 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              MuseFuze Studios
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              About
            </Link>
            <Link 
              to="/game" 
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              My Last Wish
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                {isStaffOrAbove && (
                  <Link
                    to="/staff"
                    className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-colors duration-200"
                  >
                    <Users className="h-4 w-4" />
                    <span>Staff</span>
                  </Link>
                )}
                {isAdminOrAbove && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-300 hover:text-amber-400 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/game"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Last Wish
              </Link>
              
              {user ? (
                <div className="space-y-1 pt-2 border-t border-gray-700">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    User Dashboard
                  </Link>
                  {isStaffOrAbove && (
                    <Link
                      to="/staff"
                      className="block px-3 py-2 text-gray-300 hover:text-violet-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Staff Dashboard
                    </Link>
                  )}
                  {isAdminOrAbove && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-gray-300 hover:text-amber-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 text-violet-400 hover:text-violet-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;