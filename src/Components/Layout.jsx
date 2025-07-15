/// for layout styling and structure
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '@/contexts/AppContext';

export function Layout() {
  const { darkMode, sidebarCollapsed } = useAppContext();
  
  return (
    <div className={`flex h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Header username="Biniyam Girma" />
        <div className="flex-1 overflow-y-auto p-6 dark:text-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
