// EMPLS/src/App.jsx
//importing necessary libraries and components
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter,Routes,Route,Outlet, useLocation,Navigate  } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";


//importing pages and components
import { Layout } from "./Components/Layout";
import  Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Reports from "./Pages/Reports/Reports";
import PoliceOfficers from "./Pages/PoliceOfficers/PoliceOfficers";
import Settings from "./Pages/Settings/Settings";
import NotFound from "./Pages/NotFound/NotFound";
import ManagePost from "./Pages/ManagePost/managePost"; // i need to make changes to this import statment and import the file ./ManagePostPage.jsx
import Criminal from "./Pages/Criminal/CriminalPage";
import Test from "./Pages/Test/Test";
import MessagingPage from "./Pages/MessagingPage/MessagingPage";
import ManagePoliceStationPage from "./Pages/ManagePoliceStationPage/ManagePoliceStationPage";

const queryClient = new QueryClient();

const ProtectedRoute = ()=>{
  const { currentUser } = useAuth();
  const location = useLocation();

  if(!currentUser) {
    return <Navigate to="/login" state={ { from: location} } replace />;
  }
  return (
    <Outlet />
  )
  
};

const NotFoundPage= ()=> <NotFound />;

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/police-officers" element={<PoliceOfficers />} />
                  <Route path="/manage-posts" element={<ManagePost />} />
                  <Route path="/criminals" element={<Criminal />} />
                  <Route path="/messaging" element={<MessagingPage />} />
                  <Route path="/police-stations" element={<ManagePoliceStationPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/search" element={<Test />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Login />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
};

export default App;

