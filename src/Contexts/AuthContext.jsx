// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // To handle initial loading

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('officer');
    if (storedToken && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('officer');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false); // Finished loading auth state
  }, []);

  const login = (officerData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('officer', JSON.stringify(officerData));
    setToken(userToken);
    setCurrentUser(officerData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('officer');
    setToken(null);
    setCurrentUser(null);
    // Optionally navigate to login page: navigate('/login');
  };

  // You might want to expose isLoading if your ProtectedRoute needs to show a loading spinner
  // while the auth state is being determined from localStorage.
  // For now, ProtectedRoute in App.jsx doesn't handle an explicit loading state from AuthContext.
  // if (isLoading) return <p>Loading authentication...</p>; // Or some spinner

  const value = {
    currentUser,
    token,
    login,
    logout,
    isLoadingAuth: isLoading, // Expose loading state
    // setCurrentUser, // You might expose this if needed for other purposes
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
