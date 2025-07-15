import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export default function EditOfficerDialog({
  open,
  onOpenChange,
  officerToEdit,
  onUpdateOfficer,
  t,
  
}) {
  const [editedOfficer, setEditedOfficer] = useState(() => officerToEdit ? { ...officerToEdit } : {});
  const { currentUser } = useAuth(); // Get currentUser from AuthContext

  useEffect(() => {
    if (officerToEdit) {
      // Initialize status
      let initialStatus = 'Active'; // Default
      if (typeof officerToEdit.status === 'number') {
        // Assuming 0 is Active, 1 is Leave/Inactive/Blocked
        initialStatus = officerToEdit.status === 0 ? 'Active' : 'Blocked';
      } else if (typeof officerToEdit.status === 'string') {
        const lowerCaseStatus = officerToEdit.status.toLowerCase();
        if (lowerCaseStatus === 'blocked' || lowerCaseStatus === 'inactive' || lowerCaseStatus === 'leave') {
          initialStatus = 'Blocked'; // Map these strings to 'Blocked'
        } else {
          initialStatus = 'Active'; // Default to Active for other strings
        }
      }

      // Initialize systemRole (assuming officerToEdit.rank was the role label, or officerToEdit.systemRoleId is available)
      // The dropdown will use values "1", "2", "3", "4"
      const roleLabelToIdMap = {
        "TownOfficer": "1",
        "ZoneOfficer": "2",
        "RegionOfficer": "3",
        "RootAdmin": "4",
      };
      let initialSystemRole = "1"; // Default to 'Town Officer'
      if (officerToEdit.systemRoleId) {
        initialSystemRole = String(officerToEdit.systemRoleId);
      } else if (officerToEdit.rank && roleLabelToIdMap[officerToEdit.rank]) {
        initialSystemRole = roleLabelToIdMap[officerToEdit.rank];
      } else if (officerToEdit.role && ["1", "2", "3", "4"].includes(String(officerToEdit.role))) {
        initialSystemRole = String(officerToEdit.role);
      }

      setEditedOfficer(prev => ({
        ...officerToEdit,
        ...prev, // Keep any previous edits if component re-renders without officerToEdit changing
        status: initialStatus,
        systemRole: initialSystemRole, // Use 'systemRole' for the state field
      }));
    } else {
      setEditedOfficer({});
    }
  }, [officerToEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setEditedOfficer(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setEditedOfficer(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure officerToEdit and its ID are available, crucial for an update operation.
    if (!officerToEdit || !officerToEdit.id) {
      // Consider displaying an error message to the user (e.g., using a toast notification library or a state variable).
      // Example: 
      alert("Cannot update officer: Officer ID is missing. Please contact support.");
      return; // Prevent submission if ID is missing
    }

    const officerDataToUpdate = {
      ...editedOfficer, // Includes fields like firstName, lastName, phoneNumber, etc.
      id: officerToEdit.id, // Explicitly ensure the ID from the original prop is included for the update.
      status: editedOfficer.status === "Active" ? 0 : 1, // Convert to backend numeric format
      role: parseInt(editedOfficer.systemRole, 10), // Convert systemRole ID to integer, send as 'role'
    };

    // Handle the 'image' field specifically.
    // If 'editedOfficer.image' is a File object, it means a new image has been selected.
    // We pass the File object itself. The 'onUpdateOfficer' function (in the parent component)
    // will be responsible for creating FormData if the backend expects a multipart/form-data request.
    // If 'editedOfficer.image' is a string, it's the path/URL of the existing image, or null.
    officerDataToUpdate.image = editedOfficer.image;

    // Remove the temporary 'systemRole' string if the backend only expects 'role' as integer
    delete officerDataToUpdate.systemRole; 

    onUpdateOfficer(officerDataToUpdate);
  };
  if (!officerToEdit) return null; // Don't render if no officer is selected for editing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t('editOfficerDetails')}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('updateOfficerInformationPrompt')} {officerToEdit.firstName} {officerToEdit.lastName}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-4 pr-2 max-h-[70vh] overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar if needed */}
          
          <Input id="edit-id" name="id" value={editedOfficer.id || ''} readOnly disabled className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('firstName')}</Label>
              <Input id="edit-firstName" name="firstName" value={editedOfficer.firstName || ''} onChange={handleInputChange} placeholder={t('firstNamePlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-middleName" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('middleName')}</Label>
              <Input id="edit-middleName" name="middleName" value={editedOfficer.middleName || ''} onChange={handleInputChange} placeholder={t('middleNamePlaceholder')} className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('lastName')}</Label>
              <Input id="edit-lastName" name="lastName" value={editedOfficer.lastName || ''} onChange={handleInputChange} placeholder={t('lastNamePlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumber')}</Label>
              <Input id="edit-phoneNumber" name="phoneNumber" type="tel" value={editedOfficer.phoneNumber || ''} onChange={handleInputChange} placeholder={t('phoneNumberPlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('gender')}</Label>
              <select id="edit-gender" name="gender" value={editedOfficer.gender || 'Male'} onChange={handleInputChange} required className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:border-blue-400">
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('birthDate')}</Label>
              <Input id="edit-birthDate" name="birthDate" type="text" value={editedOfficer.birthDate || ''} onChange={handleInputChange} placeholder={t('birthDatePlaceholder', 'YYYY-MM-DD')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rank" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('systemRoleLabel', 'System Role')}</Label>
                <select
                  id="edit-systemRole"
                  name="systemRole" // Changed from 'rank'
                  value={editedOfficer.systemRole || '1'} // Default to '1' (Town Officer)
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:border-blue-400"
                >
                  {/* <option value="" disabled>{t('selectRolePlaceholder', 'Select Role')}</option> // Optional: if you want a placeholder */}
                  <option value="1">{t('roleTownOfficer', 'Town Officer')}</option>
                  <option value="2">{t('roleZoneOfficer', 'Zone Officer')}</option>
                  <option value="3">{t('roleRegionOfficer', 'Region Officer')}</option>
                  <option value="4">{t('roleRootAdmin', 'Root Admin')}</option>
                </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</Label>
                <select
                  id="edit-status"
                  name="status"
                  value={editedOfficer.status || 'Active'} // Default to 'Active'
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:border-blue-400"
                >
                  {/* <option value="" disabled>{t('selectStatusPlaceholder', 'Select Status')}</option> // Optional placeholder */}
                  <option value="Active">{t('active', 'Active')}</option>
                  <option value="Blocked">{t('blocked', 'Leave')}</option>
                  {/* Backend expects 0 for Active, 1 for Leave/Inactive */}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-station" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('policeStation')}</Label>
                <Input id="edit-station" name="station" value={editedOfficer.station || ''} onChange={handleInputChange} placeholder={t('policeStationPlaceholder')} disabled className="mt-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('officerImage')}</Label>
            <Input id="edit-image" name="image" type="file" onChange={handleInputChange} accept="image/*" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-primary/30 file:text-primary dark:file:text-blue-300 hover:file:bg-primary/20 dark:hover:file:bg-primary/40"/>
            {editedOfficer.image && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current: {typeof editedOfficer.image === 'string' ? editedOfficer.image : editedOfficer.image?.name || ''}
              </p>
            )}
          </div>
          
          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">{t('saveChanges')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}