// Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth for user authentication and role managment
import axios from 'axios'; // axios for API calls is imported here
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// // Define your backend's base URL if profilePicture from currentUser is a filename
// const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL; // Adjust if your backend URL is different

// // Default image path (from public folder)
// const DEFAULT_IMAGE_PATH = import.meta.env.VITE_DEFAULT_IMAGE_PATH; // As per your requirement // i need to put a fallback image in here
// const DEFAULT_FALLBACK_NAME = import.meta.env.VITE_DEFAULT_FALLBACK_NAME || 'User'; // Fallback name if currentUser doesn't have names

export function Header({ username }) {
  // const { toggleDarkMode, darkMode, toggleSidebar } = useAppContext();
  // const { t } = useTranslation();
  // const navigate = useNavigate();
  // const { logout, currentUser } = useAuth(); // Get logout function and currentUser from AuthContext

  // const [profilePicSrc, setProfilePicSrc] = useState(DEFAULT_IMAGE_PATH);
  // const [displayName, setDisplayName] = useState(username || DEFAULT_FALLBACK_NAME);
  // const [notificationCount, setNotificationCount] = useState(0); // State for actual notification count


  // useEffect(() => {
  //   if (currentUser) {
  //     // Set profile picture from currentUser
  //     if (currentUser.profilePicture) {
  //       // Assuming profilePicture is a filename and needs the API_BASE_URL
  //       setProfilePicSrc(`${API_BASE_URL}/uploads/${currentUser.profilePicture}`);
  //     } else {
  //       setProfilePicSrc(DEFAULT_IMAGE_PATH);
  //     }

  //     // Set display name for alt text from currentUser
  //     if (currentUser.firstName && currentUser.lastName) {
  //       setDisplayName(`${currentUser.firstName} ${currentUser.lastName}`);
  //     } else if (currentUser.firstName) { // If only first name is available
  //       setDisplayName(currentUser.firstName);
  //     } else if (username) { // Fallback to prop if currentUser doesn't have names
  //       setDisplayName(username || DEFAULT_FALLBACK_NAME);
  //     } else {
  //       setDisplayName(DEFAULT_FALLBACK_NAME);
  //     }
  //   } else {
  //     // No currentUser, use defaults or prop for alt text and profile picture
  //     setProfilePicSrc(DEFAULT_IMAGE_PATH);
  //     setDisplayName(username || DEFAULT_FALLBACK_NAME);
  //   }
  // // Re-run if currentUser or the username prop changes.
  // }, [currentUser, username]); 

  // useEffect(() => {
  //   const fetchNotificationCount = async () => {
  //     if (currentUser && currentUser.policeStationId) {
  //       try {
  //         const response = await axios.post(`${API_BASE_URL}/api/notification/numberOfUnReadMessages`, {
  //           policeStationId: currentUser.policeStationId,
  //         });
  //         if (response.data && typeof response.data.rowCount === 'number') {
  //           setNotificationCount(response.data.rowCount);
  //         } else {
  //           console.warn("Unexpected response format for notification count:", response.data);
  //           setNotificationCount(0); // Default to 0 if format is wrong
  //         }
  //       } catch (error) {
  //         console.error("Error fetching notification count:", error);
  //         setNotificationCount(0); // Default to 0 on error
  //       }
  //     }
  //   };

  //   fetchNotificationCount();
  // }, [currentUser]); // Re-fetch when currentUser changes (e.g., after login or if policeStationId updates)

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            // onClick={toggleSidebar} 
            className="mr-2"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 dark:text-white" />
          </Button>
          <h1 className="text-lg font-medium dark:text-white">APC - Amhara Police Commission</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            // onClick={toggleDarkMode}
            className="rounded-full"
            aria-label="Toggle dark mode"
          >
            {/* {darkMode ? <Sun className="h-5 w-5 dark:text-white" /> : <Moon className="h-5 w-5" />} */}
          </Button>

          {/* Notification Icon: Conditionally render based on currentUser.role */}
          {/* {currentUser && currentUser.role <= 1 && ( */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              // onClick={() => navigate('/reports')} // Add onClick handler for navigation
            > */}
              {/* <Bell className="h-5 w-5 dark:text-white" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </Button> */}
          {/* )} */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-gray-300">
                  <img 
                    // src={profilePicSrc}
                    // alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* <span className="hidden md:inline dark:text-white">{currentUser && currentUser.firstName && currentUser.middleName */}
            {/* ? ` ${currentUser.firstName.toUpperCase()} ${currentUser.middleName.toUpperCase()}` : " Guest"}</span> */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="flex items-center gap-2"
                // onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4" />
                {/* <span>{t("setting")}</span> */}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-600"
                // onClick={logout} // Call logout function on click
              >
                <LogOut className="w-4 h-4" />
                {/* <span>{t("logout")}</span> */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}