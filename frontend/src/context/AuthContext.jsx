import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aai_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('aai_role') || 'admin';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('aai_isAuthenticated') === 'true';
  });

  const login = async (email, password, selectedRole) => {
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Invalid email or password");
      }

      const data = await res.json();
      const dbUser = data.user;

      const normalizedDbRole = dbUser.role.toLowerCase();
      const normalizedSelectedRole = selectedRole.toLowerCase();

      if (normalizedDbRole !== normalizedSelectedRole) {
        throw new Error(`Unauthorized. You are registered as an ${dbUser.role}, but selected the ${selectedRole} portal.`);
      }

      const userData = { 
        id: dbUser.id, 
        email: dbUser.email, 
        name: dbUser.full_name || dbUser.email.split('@')[0] 
      };

      setUser(userData);
      setRole(normalizedDbRole);
      setIsAuthenticated(true);

      localStorage.setItem('aai_user', JSON.stringify(userData));
      localStorage.setItem('aai_role', normalizedDbRole);
      localStorage.setItem('aai_isAuthenticated', 'true');
      localStorage.setItem('aai_token', data.access_token);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message || "Connection failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aai_user');
    localStorage.removeItem('aai_role');
    localStorage.removeItem('aai_isAuthenticated');
    localStorage.removeItem('aai_token');
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('aai_role', newRole);
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
