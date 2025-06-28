import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import type { User, RegisterData, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (authChecked) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.me();
      setUser(response.data.user);
    } catch {
      // Silently handle auth failures - user is just not logged in
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, [authChecked]);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setUser(response.data.user);
    setAuthChecked(true);
  };

  const register = async (userData: RegisterData) => {
    const response = await authAPI.register(userData);
    setUser(response.data.user);
    setAuthChecked(true);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Silently handle logout errors
    } finally {
      setUser(null);
      setAuthChecked(false);
    }
  };

  useEffect(() => {
    // Only check auth once when component mounts
    if (!authChecked) {
      checkAuth();
    }
  }, [checkAuth, authChecked]);

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