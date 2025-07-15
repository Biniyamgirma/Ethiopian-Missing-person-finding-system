import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Car, // Assuming this was for "Manage Post" or similar
  ShieldAlert,
  MessageCircle,
  Settings,
  Building, // Icon for Police Station
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if necessary

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/police-officers", label: "Police Officers", icon: Users },
  { href: "/police-cars", label: "Manage Post", icon: Car }, // Or "Police Vehicles"
  { href: "/criminals", label: "Criminals", icon: ShieldAlert },
  { href: "/policeStation", label: "Manage Police Station", icon: Building }, // New Item
  { href: "/messaging", label: "Messaging", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed: propCollapsed }) {
  const location = useLocation();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  // Use context if sidebarCollapsed is managed globally and not passed as prop
  // const { sidebarCollapsed } = useAppContext();
  // const collapsed = propCollapsed !== undefined ? propCollapsed : sidebarCollapsed;
  const collapsed = propCollapsed; // Assuming collapsed is passed as a prop from Layout

  return (
    <aside
      className={cn(
        "bg-background border-r text-foreground flex flex-col transition-all duration-300 ease-in-out dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-center h-16">
        <Link to="/" className="flex items-center space-x-2" title="APC Home">
          <img
            src="/image/fedral.png" // Assuming fedral.jpg is in public/images/
            alt="APC Logo"
            width={collapsed ? 28 : 24}
            height={collapsed ? 28 : 24}
            className="object-contain" // Ensures the image fits without being cropped, adjust if needed
          />
          {!collapsed && <span className="text-xl font-semibold">APC</span>}
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1.5">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href) && item.href.length > 1);
          const label = item.label;

          let showItem = true; // By default, show the item

          if (!currentUser) {
            // If user is not authenticated, hide links that have any role-based restrictions
            const restrictedLabelsForUnauthenticated = ["Police Officers", "Manage Police Station", "Manage Post", "Reports"];
            if (restrictedLabelsForUnauthenticated.includes(label)) {
              showItem = false;
            }
          } else {
            const role = currentUser.role;

            // Rule for "Police Officers" (Show if role >= 2)
            if (label === "Police Officers") {
              if (role < 2) {
                showItem = false;
              }
            }
            // Rules for links to be hidden if role is 2 or 3
            else if (label === "Manage Post" || label === "Reports") {
              if (role === 2 || role === 3) {
                showItem = false;
              }
            }
            // Rule for "Manage Police Station" (Show if role > 2; Hide if role <= 2)
            else if (label === "Manage Police Station") {
              if (role <= 2) { // This hides it for role 0, 1, and 2
                showItem = false;
              }
            }
            // Other items (Dashboard, Criminals, Messaging, Settings) default to showItem = true
            // and are not affected by these specific role conditions if the user is authenticated.
          }

          return showItem ? (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 p-2.5 rounded-md hover:bg-muted dark:hover:bg-gray-700 transition-colors",
                isActive && "bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <IconComponent size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ) : null; // If showItem is false, render nothing for this item
        })}
      </nav>
      {/* Optional: User profile or logout button at the bottom */}
    </aside>
  );
}