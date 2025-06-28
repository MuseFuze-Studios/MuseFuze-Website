import React, { useState } from 'react';
import { Send, Users, Code, Palette, Gamepad2, AlertTriangle } from 'lucide-react';
import { validateInput, sanitizeInput, RateLimiter } from '../utils/security';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimiter] = useState(() => new RateLimiter(3, 300000)); // 3 attempts per 5 minutes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const clientId = `${navigator.userAgent}-${window.location.hostname}`;
    if (!rateLimiter.isAllowed(clientId)) {
      setErrors({ general: 'Too many attempts. Please wait 5 minutes before trying again.' });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    if (!validateInput(formData.name, 'name')) {
      newErrors.name = 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)';
    }
    
    if (!validateInput(formData.email, 'email')) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    if (!validateInput(formData.message, 'message')) {
      newErrors.message = 'Please enter a valid message (no special characters or scripts)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Sanitize all inputs before processing
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        role: sanitizeInput(formData.role),
        message: sanitizeInput(formData.message)
      };
      
      // In a real application, you would send this to a secure backend
      console.log('Secure form submission:', sanitizedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Thanks for your interest! We\'ll be in touch soon.');
      setFormData({ name: '', email: '', role: '', message: '' });
    } catch {
      setErrors({ general: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Basic input sanitization on change
    const sanitizedValue = sanitizeInput(value);
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const openRoles = [
  {
    icon: Code,
    title: "Web Developer",
    description: "React, Node.js, and clean code practices"
  },
  {
    icon: Gamepad2,
    title: "Game Designer",
    description: "Unity devs with a feel for moment to moment gameplay"
  },
  {
    icon: Palette,
    title: "UX Designer",
    description: "Photoshop, Figma, and player-first design mindset"
  },
  {
    icon: Users,
    title: "3D Artist",
    description: "Stylized or realistic asset creators using Blender"
  }
];


  return (
    <section id="join-us" className="py-20 bg-black relative">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyber/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
            Join Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          <p className="text-xl font-rajdhani text-gray-200 max-w-3xl mx-auto mb-8">
            Ready to push boundaries and create the impossible? We're looking for passionate creators, 
            fearless innovators, and digital rebels who dare to think differently.
          </p>
          <p className="text-lg font-rajdhani text-gray-300">
            If you've got the skills and the hunger to change the game, we want to hear from you.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Open Roles */}
          <div className="mb-16">
            <h3 className="text-3xl font-orbitron font-bold text-center mb-12 text-white">Open Positions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {openRoles.map((role) => (
                <div
                  key={role.title}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-electric/30 transition-all duration-300 hover:shadow-2xl hover:shadow-electric/20 text-center group hover:bg-white/10"
                >
                  <role.icon className="h-12 w-12 text-electric mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                  <h4 className="text-lg font-orbitron font-bold mb-2 text-white">{role.title}</h4>
                  <p className="text-gray-300 font-rajdhani text-sm">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-orbitron font-bold mb-6 text-center text-white">Get In Touch</h3>
              
              {errors.general && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-400 font-rajdhani">{errors.general}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      maxLength={50}
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.name 
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-white/20 focus:border-electric focus:ring-electric/20'
                      }`}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      maxLength={100}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                    Interested Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.role 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/20 focus:border-electric focus:ring-electric/20'
                    }`}
                  >
                    <option value="">Select a role</option>
                    <option value="developer">Full-Stack Developer</option>
                    <option value="game-dev">Game Developer</option>
                    <option value="designer">UI/UX Designer</option>
                    <option value="3d-artist">3D Artist</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.role}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                    Tell us about yourself *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    maxLength={1000}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 font-rajdhani resize-none text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.message 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/20 focus:border-electric focus:ring-electric/20'
                    }`}
                    placeholder="What makes you a perfect fit for MuseFuze? Show us your passion, skills, and what drives you to create..."
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-400 font-rajdhani">{errors.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 font-rajdhani">
                    {formData.message.length}/1000 characters
                  </p>
                </div>
                
                <p className="mt-8 text-center text-sm text-gray-400 font-rajdhani max-w-xl mx-auto">
                  <strong>Note:</strong> We’re currently a startup with limited funds. Roles are unpaid but commission-based, and all revenue earned is fairly shared with contributors. We grow together — and you’ll always be credited for your work.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold text-lg rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;