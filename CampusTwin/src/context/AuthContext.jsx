import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campustwin_token'));
  const [loading, setLoading] = useState(true);

  // refreshUser: fetch current user profile from server
  const refreshUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('campustwin_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return null;
      }
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        return res.user;
      } else {
        localStorage.removeItem('campustwin_token');
        setToken(null);
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Failed to load user profile:', err.message);
      localStorage.removeItem('campustwin_token');
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('campustwin_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('campustwin_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('campustwin_token');
    setToken(null);
    setUser(null);
    try {
      authService.logout();
    } catch (e) {
      // Ignored
    }
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUserState,
        isAuthenticated: !!user,
        role: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
