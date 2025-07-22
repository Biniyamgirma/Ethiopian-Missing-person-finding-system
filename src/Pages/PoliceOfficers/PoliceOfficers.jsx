import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming Select components are available if you want to use shadcn/ui Select
import AddOfficerDialog from '@/components/dialogs/AddOfficerDialog'; // We will create this
import EditOfficerDialog from '@/components/dialogs/EditOfficerDialog'; // We will create this
import ViewOfficerDialog from '@/components/dialogs/ViewOfficerDialog'; // We will create this
import axios from 'axios';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Uncomment if using shadcn/ui Select
import { useAuth } from '@/contexts/AuthContext';

// Define constants for API interaction
const API_BASE_URL = "http://localhost:3004"; // Adjust if your API serves images from a different base or path

export default function PoliceOfficers() {
  const { t } = useTranslation();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  
  // State for all officers fetched from API (master list)
  const [allApiOfficers, setAllApiOfficers] = useState([]);
  // State for officers to be displayed (can be filtered)
  const [officers, setOfficers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading and error states for API call
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // State for the officer being edited or viewed
  const [officerToEdit, setOfficerToEdit] = useState(null);
  const [officerToView, setOfficerToView] = useState(null);
  
  // Define options for Status and Role dropdowns, using t for localization
  const STATUS_OPTIONS = [
    { value: "Active", label: t('status.active', "Active") },
    { value: "Blocked", label: t('status.blocked', "Blocked") }
  ];

  const ROLE_OPTIONS = [
    { value: "1", label: t('roles.townOfficer', "Town Officer") },
    { value: "2", label: t('roles.zoneAdmin', "Zone Admin") },
    { value: "3", label: t('roles.regionAdmin', "Region Admin") },
    { value: "4", label: t('roles.rootAdmin', "Root Admin") }
  ];

  const transformOfficerData = (apiOfficer) => ({
    id: apiOfficer.policeOfficerId,
    firstName: apiOfficer.policeOfficerFname,
    middleName: apiOfficer.policeOfficerMname || "",
    lastName: apiOfficer.policeOfficerLname,
    rank: apiOfficer.policeOfficerRoleName,
    station: apiOfficer.policeStationId, // Displaying ID, consider mapping to name if possible in a real app
    status: apiOfficer.policeOfficerStatus === 0 ? "Active" : "Blocked", // Or "Leave" based on specific mapping
    phoneNumber: apiOfficer.policeOfficerPhoneNumber,
    gender: apiOfficer.policeOfficerGender,
    birthDate: apiOfficer.policeOfficerBirthdate, // API provides year "2025", might need formatting/handling
    image: apiOfficer.profilepicture ? `${API_BASE_URL}/uploads/${apiOfficer.profilepicture}` : null,
    // Other fields like passwordText and role from API are intentionally omitted here
    // to prevent them from being passed to ViewOfficerDialog, as per requirements.
  });

  useEffect(() => {
    const zoneId = "17"; // Default zoneId as per requirement

    const fetchOfficers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Changed to GET request and new URL
        const response = await axios.get(`${API_BASE_URL}/api/admin/zonePoliceOfficer/${zoneId}`);
        
        // Adjusted response data handling: API now returns an array directly
        if (response.data && Array.isArray(response.data)) {
          const transformed = response.data.map(transformOfficerData);
          setAllApiOfficers(transformed);
          setOfficers(transformed);
        } else {
          // Handle cases where response.data is not an array (e.g., unexpected API response format)
          setError(t('errors.fetchFailedMalformed', 'Failed to fetch officers: Data is not in the expected format.'));
          setAllApiOfficers([]);
          setOfficers([]);
        }
      } catch (err) {
        // Improved error message from catch block
        setError(err.response?.data?.message || err.message || t('errors.fetchGeneric', 'An error occurred while fetching officers.'));
        console.error("API call failed:", err);
        setAllApiOfficers([]);
        setOfficers([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOfficers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]); // Updated dependencies: zoneId is static, currentUser.policeStationId is not used for this fetch.
  // Removed `t` from dependencies for this effect to prevent potential infinite loops
  // if `t` function reference changes on every render.

  // Helper function to filter officers based on a query
  const filterOfficers = (officersList, query) => {
    if (!query) {
      return officersList;
    }
    const lowerCaseQuery = query.toLowerCase();
    return officersList.filter(officer => 
      officer.id.toLowerCase().includes(lowerCaseQuery) ||
      `${officer.firstName} ${officer.middleName} ${officer.lastName}`.toLowerCase().includes(lowerCaseQuery) ||
      officer.firstName.toLowerCase().includes(lowerCaseQuery) ||
      (officer.middleName && officer.middleName.toLowerCase().includes(lowerCaseQuery)) ||
      officer.lastName.toLowerCase().includes(lowerCaseQuery) ||
      (officer.station && officer.station.toLowerCase().includes(lowerCaseQuery))
    );
  };
  
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setOfficers(filterOfficers(allApiOfficers, query));
  };
  
  // Receives raw API data for the newly added officer
  const handleAddOfficerLogic = (addedApiOfficer) => {
    const transformedNewOfficer = transformOfficerData(addedApiOfficer);
    const newMasterList = [...allApiOfficers, transformedNewOfficer];
    setAllApiOfficers(newMasterList);
    setOfficers(filterOfficers(newMasterList, searchQuery));
  };

  const handleOpenEditDialog = (officer) => {
    setOfficerToEdit(officer);
    setEditDialogOpen(true);
  };
  
  // Receives already transformed officer data from EditOfficerDialog
  const handleUpdateOfficerLogic = (updatedOfficerData) => {
    const newMasterList = allApiOfficers.map(officer => 
      officer.id === updatedOfficerData.id ? updatedOfficerData : officer
    );
    setAllApiOfficers(newMasterList);
    setOfficers(filterOfficers(newMasterList, searchQuery));
    
    setEditDialogOpen(false);
    setOfficerToEdit(null);
  };

  const handleOpenViewDialog = (officer) => {
    setOfficerToView(officer);
    setViewDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen p-4 md:p-6 text-gray-900 dark:text-gray-100">{t('loadingOfficers')}...</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-center text-red-500 dark:text-red-400">Error: {error}. {t('pleaseTryAgainLater')}</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('policeOfficer')}</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">{t('addNewOfficer')}</Button>
      </div>

      <AddOfficerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddOfficer={handleAddOfficerLogic}
        policeStationId={currentUser?.policeStationId} // Pass dynamic policeStationId
        apiBaseUrl={API_BASE_URL}
        statusOptions={STATUS_OPTIONS}
        roleOptions={ROLE_OPTIONS}
        t={t} // Pass translation function
      />

      {officerToEdit && (
        <EditOfficerDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          officerToEdit={officerToEdit}
          onUpdateOfficer={handleUpdateOfficerLogic}
          apiBaseUrl={API_BASE_URL} // Pass for consistency, EditOfficerDialog might need it
          statusOptions={STATUS_OPTIONS}
          roleOptions={ROLE_OPTIONS}
          t={t} // Pass translation function
        />
      )}

      {officerToView && (
        <ViewOfficerDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          officerToView={officerToView}
          apiBaseUrl={API_BASE_URL} // Pass for consistency, ViewOfficerDialog might need it for images
          t={t} // Pass translation function
        />
      )}
      
      <div className="flex pb-4">
        <Input
          placeholder={t('searchOfficers')}
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-sm bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        />
      </div>
      
      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow className="dark:border-gray-700">
              <TableHead className="text-gray-700 dark:text-gray-300">{t('id')}</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">{t('fullName')}</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">{t('rank')}</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">{t('station')}</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">{t('status')}</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">{t('phoneNumber')}</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id} className="dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{officer.id}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{`${officer.firstName} ${officer.middleName ? officer.middleName + ' ' : ''}${officer.lastName}`}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{officer.rank}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{officer.station}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    officer.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {officer.status}
                  </span>
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{officer.phoneNumber}</TableCell>
                <TableCell>
                  <div className="flex space-x-2 ">
                    <Button variant="outline" size="sm" onClick={() => handleOpenViewDialog(officer)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">{t('view')}</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(officer)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">{t('edit')}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
