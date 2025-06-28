import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import type { ApiError } from '../types/auth';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cookiesAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { register, user } = useAuth();
  const { hasConsented } = useCookieConsent();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name contains invalid characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name contains invalid characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.cookiesAccepted) {
      newErrors.cookiesAccepted = 'You must accept cookies to create an account';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!hasConsented && !formData.cookiesAccepted) {
      setErrors({ general: 'Please accept cookies to create an account' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        cookiesAccepted: formData.cookiesAccepted,
      });
      // Navigation will be handled by the useEffect above
    } catch (err) {
      const apiError = err as ApiError;
      setErrors({ general: apiError.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Don't render the form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.08)_0%,transparent_50%)]"></div>
      
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-electric/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-neon/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <Zap className="h-8 w-8 text-electric" />
              <span className="text-2xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
                MuseFuze
              </span>
            </Link>
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Join the Revolution</h1>
            <p className="text-gray-300 font-rajdhani">Create your MuseFuze account</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400 font-rajdhani">{errors.general}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 ${
                    errors.firstName 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-white/20 focus:border-electric focus:ring-electric/20'
                  }`}
                  placeholder="First name"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 ${
                    errors.lastName 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-white/20 focus:border-electric focus:ring-electric/20'
                  }`}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 ${
                  errors.email 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-white/20 focus:border-electric focus:ring-electric/20'
                }`}
                placeholder="your@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 ${
                    errors.password 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-white/20 focus:border-electric focus:ring-electric/20'
                  }`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 ${
                    errors.confirmPassword 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-white/20 focus:border-electric focus:ring-electric/20'
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="cookiesAccepted"
                    checked={formData.cookiesAccepted}
                    onChange={handleChange}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center ${
                    formData.cookiesAccepted 
                      ? 'bg-electric border-electric' 
                      : 'border-white/20 bg-white/5'
                  }`}>
                    {formData.cookiesAccepted && <Check className="h-3 w-3 text-black" />}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-rajdhani text-gray-200">
                    I accept the use of cookies as described in the{' '}
                    <Link to="/cookies-policy" className="text-electric hover:underline">
                      Cookie Policy
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-electric hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                  {errors.cookiesAccepted && (
                    <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.cookiesAccepted}</p>
                  )}
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold text-lg rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 font-rajdhani">
              Already have an account?{' '}
              <Link to="/login" className="text-electric hover:text-neon transition-colors duration-200 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;