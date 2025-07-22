import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const initialPostState = {
  townId: '', // Will be set from context if the currentuser is logged in
  subCity: '',
  description: '',
  firstName: '',
  middleName: '',
  lastName: '',
  age: '',
  lastLocation: '',
  gender: '',
  officerId: '', // Auto-selected
  stationId: '', // Auto-selected
  status: 'Active',
  image: null,
};

const genders = ["Male", "Female"];
const postStatuses = ["Active", "Pending Review", "Information Needed", "Resolved", "Closed"];

export default function AddNewPostTab({ onAddPost, t }) {
  const [postData, setPostData] = useState(initialPostState);
  const [imagePreview, setImagePreview] = useState(null);
  const { currentUser } = useAuth(); // Get currentUser

  useEffect(() => {
    // Set officerId, stationId from localStorage (if available)
    // and townId from currentUser context
    setPostData(prev => ({
      ...prev,
      officerId: localStorage.getItem('policeOfficerId') || 'PO_Default',
      stationId: localStorage.getItem('policeStationId') || 'PS_Default',
      townId: currentUser?.townId || '', // Set townId from currentUser
    }));
  }, [currentUser]); // Re-run if currentUser changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setPostData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you might want to upload the image file here and get a URL/filename
    const dataToSubmit = {
      ...postData,
      image: postData.image ? postData.image.name : null, // Store filename for simplicity,
      townId: currentUser?.townId || postData.townId, // Ensure townId is up-to-date
    };
    onAddPost(dataToSubmit);
    setPostData(initialPostState); // Reset form
    setImagePreview(null);
    // Re-set officer/station ID and townId
     setPostData(prev => ({
      ...initialPostState, // Reset other fields
      officerId: localStorage.getItem('policeOfficerId') || 'PO_Default',
      stationId: localStorage.getItem('policeStationId') || 'PS_Default',
      townId: currentUser?.townId || '',
    }));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{t('CreateNewPost')}</CardTitle>
        <CardDescription>{t('CreateNewPostDescription', 'Create a new post   ')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Details - Town ID is now from context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="townId">{t('townId') || 'Town ID'}</Label>
              <Input 
                id="townId" 
                name="townId" 
                value={postData.townId} 
                disabled // Display only, as it comes from context
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="subCity">{t('subCity')}</Label>
            <Input id="subCity" name="subCity" value={postData.subCity} onChange={handleInputChange} placeholder={t('subCityPlaceholder')} />
          </div>

          {/* Post Description */}
          <div className="space-y-1">
            <Label htmlFor="description">{t('postDescription')}</Label>
            <Textarea id="description" name="description" value={postData.description} onChange={handleInputChange} placeholder={t('postDescriptionPlaceholder')} rows={4} required />
          </div>

          {/* Person Details (if applicable) */}
          <h3 className="text-lg font-semibold pt-2 text-gray-700 dark:text-gray-300">{t('personDetailsSectionTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label htmlFor="firstName">{t('firstName')}</Label><Input id="firstName" name="firstName" value={postData.firstName} onChange={handleInputChange} placeholder={t('firstNamePlaceholder')} /></div>
            <div className="space-y-1"><Label htmlFor="middleName">{t('middleName')}</Label><Input id="middleName" name="middleName" value={postData.middleName} onChange={handleInputChange} placeholder={t('middleNamePlaceholder')} /></div>
            <div className="space-y-1"><Label htmlFor="lastName">{t('lastName')}</Label><Input id="lastName" name="lastName" value={postData.lastName} onChange={handleInputChange} placeholder={t('lastNamePlaceholder')} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label htmlFor="age">{t('age')}</Label><Input id="age" name="age" type="number" value={postData.age} onChange={handleInputChange} placeholder={t('agePlaceholder')} /></div>
            <div className="space-y-1">
              <Label htmlFor="gender">{t('gender')}</Label>
              <Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)} value={postData.gender}>
                <SelectTrigger><SelectValue placeholder={t('selectGenderPlaceholder')} /></SelectTrigger>
                <SelectContent>{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label htmlFor="lastLocation">{t('lastLocation')}</Label><Input id="lastLocation" name="lastLocation" value={postData.lastLocation} onChange={handleInputChange} placeholder={t('lastLocationPlaceholder')} /></div>
          </div>

          {/* Officer & Status Details */}
          <h3 className="text-lg font-semibold pt-2 text-gray-700 dark:text-gray-300">{t('administrativeDetailsSectionTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="officerId">{t('policeOfficerId')}</Label>
              <Input id="officerId" name="officerId" value={postData.officerId} disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="stationId">{t('policeOfficerId')}</Label>
              <Input id="stationId" name="stationId" value={postData.stationId} disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">{t('postStatus')}</Label>
              <Select name="status" onValueChange={(value) => handleSelectChange('status', value)} value={postData.status} required>
                <SelectTrigger><SelectValue placeholder={t('selectStatusPlaceholder')} /></SelectTrigger>
                <SelectContent>{postStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-base">{t('UploadImageOfThePerson')}</Label>
            <Input id="image" name="image" type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt={t('imagePreviewAlt')} className="h-40 w-auto rounded-md object-cover border" />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              {t('submitPostButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}