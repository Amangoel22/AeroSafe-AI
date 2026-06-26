import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email, password, selectedRole) => {
    // TODO: Replace with backend API call
    // await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    if (email && password) {
      setUser({ email, name: email.split('@')[0] });
      setRole(selectedRole || 'admin');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    // TODO: Replace with backend API call
    // await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const value = {
    user,
    role,
    isAuthenticated,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
