import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = (token, userData) => {
    localStorage.setItem('cs_token', token);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    localStorage.removeItem('cs_cart');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
