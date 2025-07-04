import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import type { User, RegisterData, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const checkAuth = useCallback(async (force = false) => {
    // Only check auth once unless forced
    if (initialized && !force) return;
    
    setLoading(true);
    try {
      const response = await authAPI.me();
      setUser(response.data.user);
      console.log('Auth check successful:', response.data.user.email);
    } catch {
      // Silently handle auth failures - user is just not logged in
      setUser(null);
      console.log('Auth check failed - user not logged in');
    } finally {
      setLoading(false);
      if (!initialized) setInitialized(true);
    }
  }, [initialized]);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setUser(response.data.user);
    console.log('Login successful:', response.data.user.email);
  };

  const register = async (userData: RegisterData) => {
    const response = await authAPI.register(userData);
    setUser(response.data.user);
    console.log('Registration successful:', response.data.user.email);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      console.log('Logout successful');
    } catch {
      // Silently handle logout errors
      console.log('Logout request failed, but clearing local state');
    } finally {
      setUser(null);
      setInitialized(false);
    }
  };

  useEffect(() => {
    // Check auth when component mounts
    if (!initialized) {
      checkAuth();
    }
  }, [checkAuth, initialized]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};