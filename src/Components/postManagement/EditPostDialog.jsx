import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch"; // For the escalation options


const genders = ["Male", "Female"];
const postStatuses = ["Active", "Pending Review", "Information Needed", "Resolved", "Closed"];

export default function EditPostDialog({ open, onOpenChange, postToEdit, onUpdatePost, t }) {
  const [editedData, setEditedData] = useState({});
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  //const [prevImage, setPrevImage] = useState(null); // To hold the previous image URL]
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (postToEdit) {
      setEditedData({ ...postToEdit });
      setSelectedRegion(postToEdit.region || '');
      setSelectedZone(postToEdit.zone || '');
      // If postToEdit.image is a filename (string) and you have a way to construct a URL:
      // setImagePreview(constructImageUrl(postToEdit.image));
      // For now, if it's a string, we assume it's just a name and don't show preview unless a new file is selected.
      if (typeof postToEdit.image === 'string' && postToEdit.image) {
         setImagePreview(`https://placehold.co/100x100?text=${postToEdit.image.substring(0,10)}`); // Placeholder for existing image
      } else {
        setImagePreview(null);
      }
    } else {
      setEditedData({}); // Reset if no post to edit
      setSelectedRegion('');
      setSelectedZone('');
      setImagePreview(null);
    }
  }, [postToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setEditedData(prev => ({ ...prev, [name]: value }));
    if (name === 'region') {
      setSelectedRegion(value);
      setEditedData(prev => ({ ...prev, zone: '', town: '' }));
      setSelectedZone('');
    }
    if (name === 'zone') {
      setSelectedZone(value);
      setEditedData(prev => ({ ...prev, town: '' }));
    }
  };

  const handleSwitchChange = (name, checked) => {
    setEditedData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData(prev => ({ ...prev, image: file, newImageSelected: true })); // Mark that a new image is selected
      setImagePreview(URL.createObjectURL(file));
    } else {
      // If user cancels file selection, revert to original image or clear preview
      setEditedData(prev => ({ ...prev, image: postToEdit.image, newImageSelected: false }));
      if (typeof postToEdit.image === 'string' && postToEdit.image) {
        setImagePreview(`https://placehold.co/100x100?text=${postToEdit.image.substring(0,10)}`);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let dataToSubmit = { ...editedData };
    if (editedData.image instanceof File) {
      // If a new image was selected (it's a File object), store its name.
      // In a real app, upload the file and store the URL/path.
      dataToSubmit.image = editedData.image.name;
    } else {
      // Otherwise, keep the existing image name (string) or null.
      dataToSubmit.image = postToEdit.image;
    }
    delete dataToSubmit.newImageSelected; // Clean up helper flag

    onUpdatePost(dataToSubmit);
  };

  if (!postToEdit) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) { // Reset preview if dialog is closed
            setImagePreview(null);
            setEditedData({});
        }
    }}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('editPostDialog')} - ID: {postToEdit.id}</DialogTitle>
          <DialogDescription>{t('editPostDialogDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-1 overflow-y-auto flex-grow">
          {/* Form fields similar to AddNewPostTab, pre-filled with editedData */}
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="edit-region">{t('region')}</Label><Select name="region" onValueChange={(v) => handleSelectChange('region', v)} value={editedData.region || ''}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label htmlFor="edit-zone">{t('zone')}</Label><Select name="zone" onValueChange={(v) => handleSelectChange('zone', v)} value={editedData.zone || ''} disabled={!selectedRegion}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(zonesByRegion[selectedRegion] || []).map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label htmlFor="edit-town">{t('town')}</Label><Select name="town" onValueChange={(v) => handleSelectChange('town', v)} value={editedData.town || ''} disabled={!selectedZone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(townsByZone[selectedZone] || []).map(twn => <SelectItem key={twn} value={twn}>{twn}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-1"><Label htmlFor="edit-subCity">{t('subCity')}</Label><Input id="edit-subCity" name="subCity" value={editedData.subCity || ''} onChange={handleInputChange} /></div>
          
          {/* Description */}
          <div className="space-y-1"><Label htmlFor="edit-description">{t('postDescription')}</Label><Textarea id="edit-description" name="description" value={editedData.description || ''} onChange={handleInputChange} rows={3} required /></div>

          {/* Person Details */}
          <h3 className="text-md font-semibold pt-1 text-gray-700 dark:text-gray-300">{t('personDetailsSectionTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="edit-firstName">{t('firstName')}</Label><Input id="edit-firstName" name="firstName" value={editedData.firstName || ''} onChange={handleInputChange} /></div>
            <div className="space-y-1"><Label htmlFor="edit-middleName">{t('middleName')}</Label><Input id="edit-middleName" name="middleName" value={editedData.middleName || ''} onChange={handleInputChange} /></div>
            <div className="space-y-1"><Label htmlFor="edit-lastName">{t('lastName')}</Label><Input id="edit-lastName" name="lastName" value={editedData.lastName || ''} onChange={handleInputChange} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="edit-age">{t('age')}</Label><Input id="edit-age" name="age" type="number" value={editedData.age || ''} onChange={handleInputChange} /></div>
            <div className="space-y-1"><Label htmlFor="edit-gender">{t('gender')}</Label><Select name="gender" onValueChange={(v) => handleSelectChange('gender', v)} value={editedData.gender || ''}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label htmlFor="edit-lastLocation">{t('lastLocation')}</Label><Input id="edit-lastLocation" name="lastLocation" value={editedData.lastLocation || ''} onChange={handleInputChange} /></div>
          </div>

          {/* Admin Details */}
          <h3 className="text-md font-semibold pt-1 text-gray-700 dark:text-gray-300">{t('administrativeDetailsSectionTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="edit-officerId">{t('policeOfficerId')}</Label><Input id="edit-officerId" name="officerId" value={editedData.officerId || ''} disabled /></div>
            <div className="space-y-1"><Label htmlFor="edit-stationId">{t('policeStationId')}</Label><Input id="edit-stationId" name="stationId" value={editedData.stationId || ''} disabled /></div>
            <div className="space-y-1"><Label htmlFor="edit-status">{t('postStatus')}</Label><Select name="status" onValueChange={(v) => handleSelectChange('status', v)} value={editedData.status || ''} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{postStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="edit-imageFile">{t('uploadImage')}</Label>
            <Input id="edit-imageFile" name="imageFile" type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {imagePreview && (
              <div className="mt-2"><img src={imagePreview} alt={t('imagePreviewAlt')} className="h-32 w-auto rounded-md object-cover border" /></div>
            )}
            {typeof postToEdit.image === 'string' && postToEdit.image && !editedData.newImageSelected && (
                 <p className="text-xs text-gray-500">Current image: {postToEdit.image}</p>
            )}
          </div>

          {/* Additional Features/Switches */}
          <h3 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">{t('escalationOptionsTitle')}</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2"><Switch id="addToZoneTable" checked={editedData.addToZoneTable || false} onCheckedChange={(c) => handleSwitchChange('addToZoneTable', c)} /><Label htmlFor="addToZoneTable">{t('addToZoneTableSwitch')}</Label></div>
            <div className="flex items-center space-x-2"><Switch id="addToRegionTable" checked={editedData.addToRegionTable || false} onCheckedChange={(c) => handleSwitchChange('addToRegionTable', c)} /><Label htmlFor="addToRegionTable">{t('addToRegionTableSwitch')}</Label></div>
            <div className="flex items-center space-x-2"><Switch id="addToCountryTable" checked={editedData.addToCountryTable || false} onCheckedChange={(c) => handleSwitchChange('addToCountryTable', c)} /><Label htmlFor="addToCountryTable">{t('addToCountryTableSwitch')}</Label></div>
          </div>
        </form>
        <DialogFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button type="submit" form="editPostForm" onClick={handleSubmit}>{t('saveChangesButton')}</Button> {/* Associate with form if submit is outside */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}