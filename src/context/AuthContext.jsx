import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'vak_credentials';
const SESSION_KEY = 'vak_session';

const getCredentials = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  const defaults = { username: 'admin', password: 'admin' };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );

  const login = (username, password) => {
    const creds = getCredentials();
    if (username === creds.username && password === creds.password) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  const changeCredentials = (currentPassword, newUsername, newPassword) => {
    const creds = getCredentials();
    if (currentPassword !== creds.password) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: newUsername, password: newPassword }));
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changeCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
