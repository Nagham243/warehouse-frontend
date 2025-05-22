// AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from './api/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthed = await userService.checkAuth();
        setIsAuthenticated(isAuthed);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await userService.login(credentials);
    if (response.success) {
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    }
    return null;
  };

  const logout = async () => {
    await userService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;