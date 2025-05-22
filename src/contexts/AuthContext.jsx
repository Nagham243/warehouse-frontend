// src/contexts/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import userService from '../api/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const isAuth = await userService.checkAuth();
      setAuthenticated(isAuth);
      setLoading(false);
    };
    check();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
