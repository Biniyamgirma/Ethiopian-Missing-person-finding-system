import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext'; // Changed to relative path
import { Edit3Icon } from 'lucide-react';

// Global constant for policeStationId - REMOVED
// const POLICE_STATION_ID = "PS00001";

// Module-scoped variables to store the last fetched zoneId and regionId from town info
let lastFetchedZoneIdFromTownInfo = null;
let lastFetchedRegionIdFromTownInfo = null;

const genders = ["Male", "Female"];
const postStatuses = ["Active", "Pending Review", "Information Needed", "Resolved", "Closed"];
const personStatusesMock = ["Criminal", "Missing", "Victim", "Unknown"];
// Removed regionId and zoneId as they are not directly set by user in AddNewPostForm anymore.
// townId will be populated from currentUser context.
const initialNewPostFormState = {
  townId: '', 
  // regionId: '', zoneId: '', // Removed, will be derived if needed or come from context
  subCity: '1', 
  description: '',
  firstName: '', middleName: '', lastName: '', age: '',
  lastLocation: '', gender: '', officerId: '', stationId: '', // stationId will be populated from context
  status: 'Active', image: null, personStatus: '', // Added personStatus
};


// --- AddNewPostForm Component (defined within ManagePostPage) ---
const AddNewPostForm = ({ onAddPost, t }) => {
  const [postData, setPostData] = useState(initialNewPostFormState);
  const { currentUser } = useAuth(); // Changed to get currentUser
  const [imagePreview, setImagePreview] = useState(null);

  // Removed state for regionsList, zonesList, townsList and their loading/error states

  useEffect(() => {
    // Initialize officerId, stationId, and townId from context
    setPostData(prev => ({
      ...initialNewPostFormState, // Start with a clean slate
      officerId: currentUser?.policeOfficerId || '', 
      stationId: currentUser?.policeStationId || '', 
      townId: currentUser?.townId || '', // Populate townId from currentUser
      // If currentUser also provides regionId and zoneId, and they are needed for local state:
      // regionId: currentUser?.regionId || '',
      // zoneId: currentUser?.zoneId || '',
    }));
  }, [currentUser]); // Depend on currentUser

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setPostData(prev => ({ ...prev, [name]: value })); // value is the ID
    // Removed logic for cascading dropdowns (regionId, zoneId)
  };

  // Removed fetchZonesApi and fetchTownsApi methods

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostData(prev => ({ ...prev, image: file }));
      if (imagePreview) URL.revokeObjectURL(imagePreview); // Revoke previous
      setImagePreview(URL.createObjectURL(file));
    } else {
      setPostData(prev => ({ ...prev, image: null }));
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.townId) { alert("Town ID is missing. Cannot create post."); return; }
    if (!postData.officerId) { alert("Police Officer ID is missing. Cannot create post."); return; }
    if (!postData.stationId) { alert("Police Station ID is missing. Cannot create post."); return; }


    let postStatusIdToSend = null;
    const statusIndex = postStatuses.indexOf(postData.status);
    if (statusIndex !== -1) {
      postStatusIdToSend = statusIndex + 1; // Assuming 1-based ID
    }

    const formData = new FormData();
    formData.append('townId', parseInt(postData.townId, 10)); // townId from context
    formData.append('subCityId', parseInt(postData.subCity) || 1);
    formData.append('postDescription', postData.description);
    formData.append('firstName', postData.firstName);
    formData.append('middelName', postData.middleName); // Server expects "middelName"
    formData.append('lastName', postData.lastName);
    formData.append('age', postData.age ? String(postData.age) : ''); // Send empty string if null for FormData
    formData.append('lastLocation', postData.lastLocation);
    formData.append('gender', postData.gender);
    formData.append('policeOfficerId', postData.officerId);
    formData.append('policeStationId', postData.stationId);
    if (postStatusIdToSend !== null) {
      formData.append('postStatus', postStatusIdToSend);
    }
    formData.append('personStatus', postData.personStatus);
    
    if (postData.image) {
      formData.append('image', postData.image, postData.image.name); // 'image' is the field name multer expects
    }

    console.log("Submitting FormData to http://localhost:3004/api/post/addpost");
    // For debugging FormData:
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }

    try {
      const response = await fetch('http://localhost:3004/api/post/addpost', {
        method: 'POST',
        body: formData, // Send FormData directly, browser sets Content-Type
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Post added successfully via API:', result);
        alert('Post added successfully!');
        
        // Call original onAddPost to update local state with form data (not server payload)
        // If backend returns the full post object including the new imagePath, use that.
        // For now, we'll assume the image name is what we want for local display if needed.
        // The actual image path for display will come from the server on next fetch.
        const localPostData = { ...postData, image: result.imagePath || (postData.image ? postData.image.name : null) };

        onAddPost(localPostData);
        
        // Reset form
        setPostData({ 
          ...initialNewPostFormState, 
          officerId: currentUser?.policeOfficerId || '', 
          stationId: currentUser?.policeStationId || '' ,
          townId: currentUser?.townId || '',
        });
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        // Regions list can remain as it's fetched once initially
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add post. Server returned an error.' }));
        console.error('Failed to add post:', response.status, errorData);
        alert(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('An error occurred while submitting the post.');
    }
  };

  return (
    <Card className="shadow-xl border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
        <CardTitle className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{t('Create New Post')}</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">{t('The Missing Person Report requires essential details to ensure an efficient and accurate investigation. Key inputs include the individuals full name, age, and gender for identification, along with the last seen location and date to establish a timeline.')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="townId">{t('Your Town Id ')}</Label>
              <Input 
                id="townId" 
                name="townId" 
                value={postData.townId || t('Town ID not available')} 
                disabled 
                readOnly 
              />
              {/* Optionally, display townName if available: 
              currentUser.townName && <p className="text-sm text-gray-500">{currentUser.townName}</p> 
              */}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="subCity">{t('Your Sub City')}</Label>
            <Input 
              id="subCity" 
              name="subCity" 
              value={postData.subCity} 
              disabled // Disabled as per requirement
              readOnly // To prevent console warnings about controlled component without onChange
            />
          </div>
          <div className="space-y-1"><Label htmlFor="description">{t('Post Description')}</Label><Textarea id="description" name="description" value={postData.description} onChange={handleInputChange} placeholder={t('postDescriptionPlaceholder')} rows={4} required /></div>
          
          <h3 className="text-lg font-semibold  text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">{t('Person Details Section')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label htmlFor="firstName">{t('First Name')}</Label><Input id="firstName" name="firstName" value={postData.firstName} onChange={handleInputChange} placeholder={t('firstNamePlaceholder')} /></div>
            <div className="space-y-1"><Label htmlFor="middleName">{t('Middle Name')}</Label><Input id="middleName" name="middleName" value={postData.middleName} onChange={handleInputChange} placeholder={t('middleNamePlaceholder')} /></div>
            <div className="space-y-1"><Label htmlFor="lastName">{t('Last Name')}</Label><Input id="lastName" name="lastName" value={postData.lastName} onChange={handleInputChange} placeholder={t('lastNamePlaceholder')} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label htmlFor="age">{t('Age')}</Label><Input id="age" name="age" type="number" value={postData.age} onChange={handleInputChange} placeholder={t('agePlaceholder')} /></div>
            <div className="space-y-1"><Label htmlFor="gender">{t('Gender')}</Label><Select name="gender" onValueChange={(v) => handleSelectChange('gender', v)} value={postData.gender}><SelectTrigger><SelectValue placeholder={t('selectGenderPlaceholder')} /></SelectTrigger><SelectContent>{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label htmlFor="lastLocation">{t('Last Location')}</Label><Input id="lastLocation" name="lastLocation" value={postData.lastLocation} onChange={handleInputChange} placeholder={t('lastLocationPlaceholder')} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="personStatus">{t('personStatus')}</Label>
              <Select name="personStatus" onValueChange={(v) => handleSelectChange('personStatus', v)} value={postData.personStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select PersonStatus Placeholder')} />
                </SelectTrigger>
                <SelectContent>{personStatusesMock.map(ps => <SelectItem key={ps} value={ps}>{ps}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <h3 className="text-lg font-semibold  text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">{t('Administrative Details Section')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label htmlFor="officerId">{t('Police Officer Id')}</Label><Input id="officerId" name="officerId" value={postData.officerId } disabled /></div>
            <div className="space-y-1"><Label htmlFor="stationId">{t('Police Station Id')}</Label><Input id="stationId" name="stationId" value={postData.stationId } disabled /></div>
            <div className="space-y-1"><Label htmlFor="status">{t('Post Status')}</Label><Select name="status" onValueChange={(v) => handleSelectChange('status', v)} value={postData.status} required><SelectTrigger><SelectValue placeholder={t('Select Status Placeholder')} /></SelectTrigger><SelectContent>{postStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>

          <div className="space-y-2"><Label htmlFor="image" className="text-base">{t('Upload Image')}</Label><Input id="image" name="image" type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {imagePreview && (<div className="mt-2"><img src={imagePreview} alt={t('imagePreviewAlt')} className="h-40 w-auto rounded-md object-cover border" /></div>)}
          </div>
          <div className="flex justify-end pt-4"><Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out">{t('submitPostButton')}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
};
const ViewPostsTable = ({ posts, onEditPost, t }) => {
  const [searchTerm, setSearchTerm] = useState('');  
  const filteredPosts = posts.filter(post =>
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${post.firstName || ''} ${post.lastName || ''}`.trim().toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'default'; // Blue/Default
    if (s === 'resolved' || s === 'closed') return 'success'; // Green
    if (s === 'pending review') return 'secondary'; // Gray
    if (s === 'information needed') return 'destructive'; // Red
    return 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{t('allPostsTitle')}</h2>
        <Input placeholder={t('searchPostsPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm w-full sm:w-auto" />
      </div>
      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700/50">
            <TableRow>
              <TableHead className="text-gray-600 dark:text-gray-300">{t('postId')}</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">{t('descriptionSummary')}</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">{t('personName')}</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">{t('status')}</TableHead>
              <TableHead className="text-gray-600 dark:text-gray-300">{t('postedDate')}</TableHead>
              <TableHead className="text-right text-gray-600 dark:text-gray-300">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length > 0 ? filteredPosts.map((post) => (
              <TableRow key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <TableCell className="font-medium text-gray-800 dark:text-gray-100">{post.id}</TableCell>
                <TableCell className="max-w-xs truncate text-gray-600 dark:text-gray-300" title={post.description}>{post.description}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">{`${post.firstName || ''} ${post.lastName || ''}`.trim() || 'N/A'}</TableCell>
                <TableCell><Badge variant={getStatusVariant(post.status)} className="capitalize">{post.status}</Badge></TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">{post.postedDate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEditPost(post)} title={t('editPostTitle')} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"><Edit3Icon className="h-5 w-5" /></Button>
                </TableCell>
              </TableRow>
            )) : (<TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noPostsFound')}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// --- EditPostDialogComponent (defined within ManagePostPage) ---
const EditPostDialogComponent = ({ open, onOpenChange, postToEdit, onUpdatePost, t }) => {
  const [editedData, setEditedData] = useState(null); // Initialize as null

  // State for dynamic dropdowns in Edit Dialog
  const [regionsList, setRegionsList] = useState([]);
  const [isRegionsLoading, setIsRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState(null);

  const [zonesList, setZonesList] = useState([]);
  const [isZonesLoading, setIsZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState(null);

  const [townsList, setTownsList] = useState([]);
  const [isTownsLoading, setIsTownsLoading] = useState(false);
  const [townsError, setTownsError] = useState(null);
  const [isLoadingChecks, setIsLoadingChecks] = useState(false); // State for loading checks

  // State for specific town details
  const [specificTownDetails, setSpecificTownDetails] = useState(null);
  const [isLoadingSpecificTownDetails, setIsLoadingSpecificTownDetails] = useState(false);
  const [specificTownDetailsError, setSpecificTownDetailsError] = useState(null);

  useEffect(() => {
    if (postToEdit) {
       const initialEditData = {
        ...postToEdit,
        subCity: postToEdit.subCity || '1',
        regionId: String(postToEdit.regionId || ''), // Ensure string for Select value
        zoneId: String(postToEdit.zoneId || ''),     // Ensure string for Select value
        townId: String(postToEdit.townId || ''),     // Ensure string for Select value
      };
      setEditedData(initialEditData);

      // Dropdown fetching logic removed
    } else {
      setEditedData(null); // Reset to null when dialog closes or no post
      // Clear dropdowns when dialog closes or no post
      setRegionsList([]);
      setZonesList([]);
      setTownsList([]);
      setSpecificTownDetails(null); // Clear specific town details
      setSpecificTownDetailsError(null);
      setIsLoadingSpecificTownDetails(false);
    }
  }, [postToEdit]); // Depend only on postToEdit

  // Effect to fetch initial switch states based on backend checks
  useEffect(() => {
    const checkPostStatus = async () => {
      if (!postToEdit?.id || !editedData) return; // Ensure editedData is initialized

      setIsLoadingChecks(true);
      let isInZone = false;
      let isInRegion = false;
      let isInCountry = false;

      try {
        // Check Zone status
        const zoneResponse = await fetch(`http://localhost:3004/api/post/cheackPostInZone/${postToEdit.id}`);
        const zoneData = await zoneResponse.json();
        if (zoneResponse.ok && zoneData.success) {
          isInZone = true;
        }

        // Check Region status
        const regionResponse = await fetch(`http://localhost:3004/api/post/cheackPostInRegion/${postToEdit.id}`);
        const regionData = await regionResponse.json();
        if (regionResponse.ok && regionData.success) {
          isInRegion = true;
        }

        // Check Country status (assuming a similar endpoint)
        const countryResponse = await fetch(`http://localhost:3004/api/post/cheackPostInCountry/${postToEdit.id}`);
        const countryData = await countryResponse.json();
        if (countryResponse.ok && countryData.success) {
          isInCountry = true;
        }

      } catch (error) {
        console.error("Error checking post status in zone/region tables:", error);
        // Switches will remain off if there's an error
      } finally {
        setEditedData(prev => ({ // Ensure prev is not null
          ...(prev || {}), // Spread previous data or an empty object if prev is null
          addToZoneTable: isInZone,
          addToRegionTable: isInRegion,
          addToCountryTable: isInCountry,
        }));
        setIsLoadingChecks(false);
      }
    };
    
    if (postToEdit && editedData) { // Only run if postToEdit and editedData are available
        checkPostStatus();
    }
  }, [postToEdit, editedData?.id]); // Re-run if postToEdit changes or editedData.id is available (after initial setup)

  // Removed useEffects for fetching zones and towns for dropdowns
  // as dropdowns are removed.

  // Effect to fetch specific town information (zoneId, regionId)
  useEffect(() => {
    const fetchDetailsForTown = async () => {
      if (!editedData?.townId) {
        setSpecificTownDetails(null);
        setSpecificTownDetailsError(null);
        return;
      }

      setIsLoadingSpecificTownDetails(true);
      setSpecificTownDetailsError(null);
      setSpecificTownDetails(null); // Clear previous details
      try {
        const response = await fetch(`http://localhost:3004/api/country/specificTownInfo/${editedData.townId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch town info. Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.town && data.town.length > 0) {
          const townInfo = data.town[0];
          setSpecificTownDetails(townInfo);

          // Store zoneId and regionId in module-scoped variables
          lastFetchedZoneIdFromTownInfo = townInfo.zoneId;
          lastFetchedRegionIdFromTownInfo = townInfo.regionId;
          console.log("Updated module-scoped vars: Zone ID:", lastFetchedZoneIdFromTownInfo, "Region ID:", lastFetchedRegionIdFromTownInfo);
          // The variables townInfo.zoneId and townInfo.regionId are now available.
          console.log("Fetched specific town info:", townInfo);
          console.log("Zone ID from specificTownInfo:", townInfo.zoneId, "Region ID:", townInfo.regionId);
        } else {
          throw new Error("Town info not found in API response.");
        }
      } catch (error) {
        console.error("Error fetching specific town details:", error);
        setSpecificTownDetailsError(error.message);
      } finally {
        setIsLoadingSpecificTownDetails(false);
      }
    };

    if (open && editedData?.townId) {
      fetchDetailsForTown();
    }
  }, [open, editedData?.townId]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setEditedData(prev => ({ ...prev, [name]: value })); // value is ID
    // Removed logic for cascading dropdowns (regionId, zoneId, townId)
    // as these are no longer selectable inputs.
  };

  const handleSwitchChange = (name, checked) => setEditedData(prev => ({ ...prev, [name]: checked }));

  // Removed fetchRegionsApi, fetchZonesApi, fetchTownsApi methods

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedData?.townId) { // Check if editedData and townId exist
      alert("Please select a town.");
      return;
    }

    const statusIndex = postStatuses.indexOf(editedData.status);
    const postStatusId = statusIndex !== -1 ? statusIndex + 1 : null;

    const payload = {
        townId: parseInt(editedData.townId, 10),
        subCityId: editedData.subCityId ? parseInt(editedData.subCityId, 10) : 1,
        postDescription: editedData.description,
        firstName: editedData.firstName,
        middleName: editedData.middleName, // Ensure this matches backend (middelName vs middleName)
        lastName: editedData.lastName,
        age: editedData.age ? parseInt(editedData.age, 10) : null,
        lastLocation: editedData.lastLocation,
        gender: editedData.gender,
        policeOfficerId: editedData.officerId, // This is policeOfficerId
        policeStationId: editedData.stationId, // This is policeStationId
        postStatus: postStatusId,
        personStatus: editedData.personStatus,
        // No image data is sent as per requirement
    };

    console.log("Submitting update to http://localhost:3004/api/post/editPost/" + postToEdit.id, payload);

    try {
        const response = await fetch(`http://localhost:3004/api/post/editPost/${postToEdit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            let mainUpdateMessage = result.message || 'Post updated successfully!';
            
            // Prepare data for local state update, ensuring it matches the post object structure
            const updatedPostForState = { 
              ...postToEdit, 
              ...editedData, 
              townId: parseInt(editedData.townId, 10), // ensure it's a number if needed by other parts
              regionId: parseInt(editedData.regionId, 10),
              zoneId: parseInt(editedData.zoneId, 10),
              status: editedData.status /* string status for display */ 
            };
            onUpdatePost(updatedPostForState); // Call parent's update handler

            // --- BEGIN: Add to Zone/Region Table Logic ---
            let secondaryOperationsMessages = [];

            // Add to Zone Table
            if (editedData.addToZoneTable && lastFetchedZoneIdFromTownInfo && postToEdit.id) {
                try {
                    const zonePayload = {
                        zoneId: parseInt(lastFetchedZoneIdFromTownInfo, 10),
                        postId: parseInt(postToEdit.id, 10) 
                    };
                    console.log("Attempting to add post to zone table:", zonePayload); // Crucial for debugging
                    const zoneResponse = await fetch('http://localhost:3004/api/post/addPostToZone', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(zonePayload),
                    });
                    const zoneResult = await zoneResponse.json();
                    if (zoneResponse.ok) {
                        console.log('Successfully added post to zone table:', zoneResult.message);
                        secondaryOperationsMessages.push(`Successfully added to zone: ${zoneResult.message || 'Done'}`);
                    } else {
                        console.error('Failed to add post to zone table:', zoneResult.message || zoneResponse.statusText);
                        secondaryOperationsMessages.push(`Failed to add to zone table: ${zoneResult.message || zoneResponse.statusText}`);
                    }
                } catch (error) {
                    console.error('Error adding post to zone table:', error);
                    secondaryOperationsMessages.push(`Error adding to zone table: ${error.message}`);
                }
            }

            // Add to Region Table
            if (editedData.addToRegionTable && lastFetchedRegionIdFromTownInfo && postToEdit.id) {
                 try {
                    const regionPayload = {
                        regionId: parseInt(lastFetchedRegionIdFromTownInfo, 10),
                        postId: parseInt(postToEdit.id, 10)
                    };
                    console.log("Attempting to add post to region table:", regionPayload); // Crucial for debugging
                    const regionResponse = await fetch('http://localhost:3004/api/post/addPostToRegion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(regionPayload),
                    });
                    const regionResult = await regionResponse.json();
                    if (regionResponse.ok) {
                        console.log('Successfully added post to region table:', regionResult.message);
                        secondaryOperationsMessages.push(`Successfully added to region: ${regionResult.message || 'Done'}`);
                    } else {
                        console.error('Failed to add post to region table:', regionResult.message || regionResponse.statusText);
                        secondaryOperationsMessages.push(`Failed to add to region table: ${regionResult.message || regionResponse.statusText}`);
                    }
                } catch (error) {
                    console.error('Error adding post to region table:', error);
                    secondaryOperationsMessages.push(`Error adding to region table: ${error.message}`);
                }
            }

            // Add to Country Table
            if (editedData.addToCountryTable && postToEdit.id) {
                try {
                    const countryPayload = {
                        countryId: 1, // Default countryId
                        postId: parseInt(postToEdit.id, 10)
                    };
                    console.log("Attempting to add post to country table:", countryPayload);
                    const countryResponse = await fetch('http://localhost:3004/api/post/addPostToCountry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(countryPayload),
                    });
                    const countryResult = await countryResponse.json();
                    if (countryResponse.ok) {
                        secondaryOperationsMessages.push(`Successfully added to country: ${countryResult.message || 'Done'}`);
                    } else {
                        secondaryOperationsMessages.push(`Failed to add to country table: ${countryResult.message || countryResponse.statusText}`);
                    }
                } catch (error) {
                    secondaryOperationsMessages.push(`Error adding to country table: ${error.message}`);
                }
            }
            alert(`${mainUpdateMessage}\n${secondaryOperationsMessages.join('\n')}`.trim());
            // --- END: Add to Zone/Region Table Logic ---
        } else {
            console.error('Failed to update post:', response.status, result);
            alert(`Error: ${result.message || response.statusText || 'Failed to update post.'}`);
        }
    } catch (error) {
        console.error('Error submitting post update:', error);
        alert('An error occurred while updating the post.');
    }
  };

  // Render null if editedData is not yet initialized (before postToEdit is set and initial data is populated)
  if (!editedData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b dark:border-gray-700">
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('Edit Post Dialog')} - ID: {postToEdit.id}</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">{t('Edit Post Dialog Description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="editPostForm" className="space-y-4 p-6 overflow-y-auto flex-grow">
          {/* Region, Zone, Town are now displayed as disabled inputs or text */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-regionId">{t('Region')}</Label>
              <Input id="edit-regionId" name="regionId" value={editedData.regionId || ''} disabled readOnly />
              {specificTownDetails?.regionName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{specificTownDetails.regionName}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-zoneId">{t('zone')}</Label>
              <Input id="edit-zoneId" name="zoneId" value={editedData.zoneId || ''} disabled readOnly />
              {specificTownDetails?.zoneName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{specificTownDetails.zoneName}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-townId">{t('town')}</Label>
              <Input id="edit-townId" name="townId" value={editedData.townId || ''} disabled readOnly />
              {specificTownDetails?.townName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{specificTownDetails.townName}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-subCity">{t('subCity')}</Label>
            <Input 
              id="edit-subCity" 
              name="subCity" 
              value={editedData.subCity || '1'} // Default to '1'
              disabled // Disabled as per requirement
              readOnly // To prevent console warnings
            />
          </div>
          <div className="space-y-1"><Label htmlFor="edit-description">{t('postDescription')}</Label><Textarea id="edit-description" name="description" value={editedData.description || ''} onChange={handleInputChange} rows={3} required /></div>
          
          <h3 className="text-md font-semibold pt-1 text-gray-700 dark:text-gray-300 border-t dark:border-gray-600 mt-3 ">{t('Person Details Section')}</h3>
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

          <h3 className="text-md font-semibold pt-1 text-gray-700 dark:text-gray-300 border-t dark:border-gray-600 mt-3 ">{t('Administrative Details Section')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="edit-officerId">{t('policeOfficerId')}</Label><Input id="edit-officerId" name="officerId" value={editedData.officerId || ''} disabled /></div>
            <div className="space-y-1"><Label htmlFor="edit-stationId">{t('policeStationId')}</Label><Input id="edit-stationId" name="stationId" value={editedData.stationId || ''} disabled /></div>
            <div className="space-y-1"><Label htmlFor="edit-status">{t('postStatus')}</Label><Select name="status" onValueChange={(v) => handleSelectChange('status', v)} value={editedData.status || ''} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{postStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          {/* Image input section removed */}

          <h3 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300 border-t dark:border-gray-600 mt-3 ">{t('More Info')}</h3>
          <div className="space-y-4">
            {/* Town Specific Information Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('Town Details')}</h4>
              {isLoadingSpecificTownDetails && <p className="text-xs text-gray-500 dark:text-gray-400">{t('Loading town details...')}</p>}
              {specificTownDetailsError && <p className="text-xs text-red-500">{t('Error loading town details:')} {specificTownDetailsError}</p>}
              {specificTownDetails && !isLoadingSpecificTownDetails && !specificTownDetailsError && (
                <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-md">
                  <p><strong>{t('Town Name')}:</strong> {specificTownDetails.townName}</p>
                  <p><strong>{t('Zone Name')}:</strong> {specificTownDetails.zoneName}</p>
                  <p><strong>{t('Region Name')}:</strong> {specificTownDetails.regionName}</p>
                  
                </div>
              )}
              {!isLoadingSpecificTownDetails && !specificTownDetails && !specificTownDetailsError && editedData?.townId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('No specific details found for this town, or an error occurred.')}</p>
              )}
              {!editedData?.townId && !isLoadingSpecificTownDetails && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Select a town to view its specific details.')}</p>
              )}
            </div>

            {/* Post Distribution Status Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('Post Distribution Status')}</h4>
              {isLoadingChecks ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Checking post distribution status...')}</p>
              ) : (<>
                <div className="flex items-center space-x-2">
                  <Switch id="addToZoneTable" checked={!!editedData.addToZoneTable} onCheckedChange={(c) => handleSwitchChange('addToZoneTable', c)} />
                  <Label htmlFor="addToZoneTable" className="text-sm">{t('Add To Zone Table')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="addToRegionTable" checked={!!editedData.addToRegionTable} onCheckedChange={(c) => handleSwitchChange('addToRegionTable', c)} />
                  <Label htmlFor="addToRegionTable" className="text-sm">{t('Add To Region Table')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="addToCountryTable" checked={!!editedData.addToCountryTable} onCheckedChange={(c) => handleSwitchChange('addToCountryTable', c)} />
                  <Label htmlFor="addToCountryTable" className="text-sm">{t('Add To Country Table')}</Label>
                </div>
              </>)}
            </div>
          </div>
        </form>
        <DialogFooter className="p-6 border-t dark:border-gray-700 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button type="submit" form="editPostForm">{t('saveChangesButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// --- Main ManagePostPage Component ---
export default function ManagePostPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth(); // Changed to get currentUser
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("viewPosts");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [fetchPostsError, setFetchPostsError] = useState(null);

  const transformFetchedPost = useCallback((fetchedPost) => {
    const statusString = postStatuses[parseInt(fetchedPost.postStatus, 10) - 1] || "Unknown Status";
    return {
      id: String(fetchedPost.postId), // Use postId as the unique ID
      townId: fetchedPost.townId, // Expecting number
      zoneId: fetchedPost.zoneId, // Expecting number, needed for edit form
      regionId: fetchedPost.regionId, // Expecting number, needed for edit form
      subCityId: fetchedPost.subCityId, // Expecting number
      subCity: String(fetchedPost.subCityId || '1'), // For display in disabled field
      description: fetchedPost.postDescription,
      firstName: fetchedPost.firstName,
      middleName: fetchedPost.middleName,
      lastName: fetchedPost.lastName,
      age: fetchedPost.age ? parseInt(fetchedPost.age, 10) : null,
      lastLocation: fetchedPost.lastLocation,
      gender: fetchedPost.gender,
      officerId: fetchedPost.policeOfficerId,
      stationId: fetchedPost.policeStationId,
      status: statusString, // Mapped status
      personStatus: fetchedPost.personStatus,
      image: fetchedPost.imagePath,
      postedDate: new Date(fetchedPost.created_at).toISOString().split('T')[0],
      // addToZoneTable, addToRegionTable, addToCountryTable will be set by the
      // checkPostStatus effect in EditPostDialogComponent
    };
  }, []);

  const fetchPostsByStation = useCallback(async () => {
    const currentStationId = currentUser?.policeStationId; // Get stationId from currentUser

    if (!currentStationId) {
      console.warn("Police Station ID from auth context (currentUser.policeStationId) is not available. Cannot fetch posts.");
      setFetchPostsError("Authentication error: Police Station ID not found. Please log in again.");
      setIsLoadingPosts(false);
      setPosts([]); // Clear posts if auth is missing
      return;
    }
    setIsLoadingPosts(true);
    setFetchPostsError(null);
    try {
      const response = await fetch('http://localhost:3004/api/post/policeStation/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policeStationId: currentStationId }), 
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} - ${response.statusText}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(Array.isArray(data.posts) ? data.posts.map(transformFetchedPost) : []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setFetchPostsError(error.message);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [transformFetchedPost, currentUser]); // Dependency changed to currentUser


  const handleAddNewPost = useCallback((newPostData) => {
    // newPostData already contains stationId from the form (which got it from context)
    // newPostData also contains townId from context. regionId and zoneId might not be present
    // if not supplied by currentUser context in AddNewPostForm.
    const newPostWithId = {
      ...newPostData,
      id: `POST${String(Date.now()).slice(-5)}`, // More unique ID for client-side
      postedDate: new Date().toISOString().split('T')[0],
      // regionId and zoneId will be whatever newPostData provides (or undefined)
      // They will be correctly populated upon fetching from server via transformFetchedPost
      townId: parseInt(newPostData.townId, 10) || null,
      // stationId is already part of newPostData, sourced from context in AddNewPostForm
      // addToZoneTable and addToRegionTable will be false by default for new posts
      addToZoneTable: false, 
      addToRegionTable: false,
      addToCountryTable: false, // Initialize for new posts, though primarily managed in edit
    };
    setPosts(prevPosts => [newPostWithId, ...prevPosts]);
    setActiveTab("viewPosts");
  }, []);

  const handleEditPost = useCallback((post) => {
    setPostToEdit(post);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdatePost = useCallback((updatedPostData) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPostData.id ? updatedPostData : post
      )
    );
    setIsEditDialogOpen(false);
    setPostToEdit(null);
  }, []);

  useEffect(() => {
    if (activeTab === "viewPosts") {
      fetchPostsByStation();
    }
  }, [activeTab, fetchPostsByStation]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-600 to-slate-900 dark:from-slate-300 dark:via-slate-200 dark:to-slate-500 sm:text-6xl md:text-7xl">
          <span className="block xl:inline">{t('Missing Person Post Managment Page')}</span>
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
          {t('This page is dedicated to sharing information about missing individuals ')}
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-6 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg shadow">
          <TabsTrigger value="addNewPost" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-blue-300 px-6 py-2.5 rounded-md transition-all duration-150 ease-in-out">{t('addNewPostTab')}</TabsTrigger>
          <TabsTrigger value="viewPosts" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-blue-300 px-6 py-2.5 rounded-md transition-all duration-150 ease-in-out">{t('viewPostsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="addNewPost" className="mt-2">
          <AddNewPostForm onAddPost={handleAddNewPost} t={t} />
        </TabsContent>

        <TabsContent value="viewPosts" className="mt-2">
          {isLoadingPosts && <p className="text-center py-4">{t('loadingPosts')}</p>}
          {fetchPostsError && <p className="text-center py-4 text-red-500">{t('errorLoadingPosts')}: {fetchPostsError}</p>}
          {!isLoadingPosts && !fetchPostsError && (
            <ViewPostsTable
              posts={posts}
              onEditPost={handleEditPost}
              t={t}
            />
          )}
        </TabsContent>
      </Tabs>

      {postToEdit && (
        <EditPostDialogComponent
          open={isEditDialogOpen}
          onOpenChange={(isOpen) => {
            setIsEditDialogOpen(isOpen);
            if (!isOpen) setPostToEdit(null); // Clear postToEdit when dialog closes
          }}
          postToEdit={postToEdit}
          onUpdatePost={handleUpdatePost}
          t={t}
        />
      )}
    </div>
  );
}
