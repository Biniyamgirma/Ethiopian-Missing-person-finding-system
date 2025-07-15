// AppContext.jsx is used for managing global application state for the application
// such as dark mode language preferences and sidebar state.
// This context can be used throughout the application to access and modify these states.
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Load preferences from localStorage on initial load
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    const storedLanguage = localStorage.getItem('language') || 'en';
    const storedSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    setDarkMode(storedDarkMode);
    setLanguage(storedLanguage);
    setSidebarCollapsed(storedSidebarCollapsed);
  }, []);
  
  // Update localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('language', language);
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [darkMode, language, sidebarCollapsed]);
  
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };
  
  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        changeLanguage,
        sidebarCollapsed,
        toggleSidebar
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return React.useContext(AppContext);
}
