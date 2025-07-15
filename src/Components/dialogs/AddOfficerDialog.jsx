import React, { useState } from 'react';
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
import axios from 'axios'; // Import axios
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const initialNewOfficerState = {
  firstName: '',
  middleName: '',
  lastName: '',
  rank: '',
  status: 'Active',
  phoneNumber: '',
  gender: '', // Default gender
  birthDate: '',
  image: null, // For file object or file name after processing
  password: '', // New field for passwordText
  systemRole: '1', // Default to 'Town Officer'
  policeStationId: '', // New field for police station ID
};

export default function AddOfficerDialog({open, onOpenChange, onAddOfficer, t, apiBaseUrl}) {
    const [newPoliceOfficer, setNewPoliceOfficer] = useState(initialNewOfficerState);
    const [isSubmitting, setIsSubitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const { currentUser } = useAuth(); // get current user from context

    const handleInputChenge = (e)=>{
        const {name, value, type, files} = e.target;
        if(type === 'file') {
            setNewPoliceOfficer( prevState => ({...prevState, [name]: files[0] || null}));
        }else {
            setNewPoliceOfficer( prevState=>({...prevState, [name]: value}));
        }
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setIsSubitting(true);
        setSubmitError(null);

        const formData = new FormData();
        formData.append('policeOfficerFnme', newPoliceOfficer.firstName);
        formData.append('policeOfficerMname', newPoliceOfficer.middleName || '');
        formData.append('policeOfficerLname', newPoliceOfficer.lastName);

        if(newPoliceOfficer.image instanceof File) {
            formData.append('profilePicture', newPoliceOfficer.image);
        }
        formData.append('role', parseInt(newPoliceOfficer.systemRole, 10));;
        formData.append('policeOfficerStatus', newPoliceOfficer.status);
        formData.append('policeOfficerPhoneNumber', newPoliceOfficer.phoneNumber);
        formData.append('passwordText', newPoliceOfficer.password);
        formData.append('policeOfficerGender', newPoliceOfficer.gender.toLowerCase());
        formData.append('policeOfficerBirthDate', newPoliceOfficer.birthDate ? new Date(newPoliceOfficer.birthDate).getFullYear().toString() : '');
        formData.append('policeStationId', newPoliceOfficer.policeStationId );

        try {
            const response = await axios.post(`${apiBaseUrl}/api/police/root/register-police-officer`, formData, {
                headers: {
                    'Content-Type': 'multipart/from-data',

                },
            });
            if(response.status === 201 && response.data && response.data.success && response.data.data) {
                const newOfficer = response?.data.data;
                onAddOfficer(newOfficer);
                setNewPoliceOfficer(initialNewOfficerState); // Reset form state
                onOpenChange(false); // Close dialog
            }else {
                const errorMessage = response.data?.message || t('addOfficerErrorNetwork',"An error occurred while adding the officer.");
                setSubmitError(errorMessage);
                console.error('Error adding officer:', errorMessage);
            }
        } catch (error) {
            console.error('Error adding officer:', error);
            const errorMessage = error.response?.data?.message || t('addOfficerErrorNetwork', "An error occurred while adding the officer.");
            setSubmitError(errorMessage);
        } finally {
            setIsSubitting(false);
        }
            }
    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setNewOfficer(initialNewOfficerState); // Reset form if dialog is closed externally
    }}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t('addNewOfficer')}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('fillOfficerDetailsPrompt')}
          </DialogDescription>
          {submitError && (
            <div className="mt-2 p-2 text-sm text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-md">
              {submitError}
            </div>
          )}
        </DialogHeader>
        
        {/* Adjusted padding: p-4 for overall padding, pr-2 to accommodate scrollbar */}
        <form onSubmit={handleSubmit} className="space-y-6 p-4 pr-2 max-h-[70vh] overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar if needed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('firstName')}</Label>
              <Input id="add-firstName" name="firstName" value={newOfficer.firstName} onChange={handleInputChange} placeholder={t('firstNamePlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-middleName" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('middleName')}</Label>
              <Input id="add-middleName" name="middleName" value={newOfficer.middleName} onChange={handleInputChange} placeholder={t('middleNamePlaceholder')} className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('lastName')}</Label>
              <Input id="add-lastName" name="lastName" value={newOfficer.lastName} onChange={handleInputChange} placeholder={t('lastNamePlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumber')}</Label>
              <Input id="add-phoneNumber" name="phoneNumber" type="tel" value={newOfficer.phoneNumber} onChange={handleInputChange} placeholder={t('phoneNumberPlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('gender')}</Label>
              <select id="add-gender" name="gender" value={newOfficer.gender} onChange={handleInputChange} required className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:border-blue-400">
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-birthDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('birthDate')}</Label>
              <Input id="add-birthDate" name="birthDate" type="date" value={newOfficer.birthDate} onChange={handleInputChange} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-rank" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('rank')}</Label>
                <Input id="add-rank" name="rank" value={newOfficer.rank} onChange={handleInputChange} placeholder={t('rankPlaceholder')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</Label>
                <select id="add-status" name="status" value={newOfficer.status || 'Active'} onChange={handleInputChange} required className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:border-blue-400">
                  <option value="Active">{t('active')}</option>
                  <option value="Leave">{t('leave')}</option>
                </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('passwordLabel', 'Password')}</Label>
              <Input id="add-password" name="password" type="password" value={newOfficer.password} onChange={handleInputChange} placeholder={t('passwordPlaceholder', 'Enter password')} required className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-systemRole" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('systemRoleLabel', 'System Role')}</Label>
              <select id="add-systemRole" name="systemRole" value={newOfficer.systemRole} onChange={handleInputChange} required className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:border-blue-400">
                <option value="1">{t('roleTownOfficer', 'Town Officer')}</option>
                <option value="2">{t('roleZoneOfficer', 'Zone Officer')}</option>
                <option value="3">{t('roleRegionOfficer', 'Region Officer')}</option>
                <option value="4">{t('roleRootAdmin', 'Root Admin')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-policeStationId" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('policeStationId', 'Police Station ID')}</Label>
            <Input id="add-policeStationId" name="policeStationId" value={newOfficer.policeStationId} onChange={handleInputChange} placeholder={t('policeStationIdPlaceholder', 'Enter police station ID')} required 
                   className="mt-1 bg-white dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500" 
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="add-image" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('officerImage')}</Label>
            <Input id="add-image" name="image" type="file" onChange={handleInputChange} accept="image/*" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-primary/30 file:text-primary dark:file:text-blue-300 hover:file:bg-primary/20 dark:hover:file:bg-primary/40"/>
            {newOfficer.image && typeof newOfficer.image === 'object' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {newOfficer.image.name}</p>
            )}
          </div>
          
          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">{isSubmitting ? t('addingOfficerProgress', "Adding...") : t('addOfficer')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    );
        };
    
