import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from '@/hooks/useTranslation';
import { UserSearch, Palette, Ruler, Weight, CalendarDays, VenetianMask, CheckCircle, XCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Filter options
const filterOptions = {
  faceColor: ["All", "Light", "Medium", "Dark"],
  hairColor: ["All", "Black", "Brown", "Blonde", "Red", "Gray", "Other"],
  height: ["All", "<160cm", "160-165cm", "165-170cm", "170-175cm", "175-180cm", "180-185cm", ">185cm"],
  bodyType: ["All", "Slim", "Average", "Athletic", "Heavy"],
  ageRange: ["All", "18-25", "26-35", "36-45", "46-55", "56+"],
  gender: ["All", "Male", "Female"],
};

const FilterIcon = ({ filterKey }) => {
  switch (filterKey) {
    case 'faceColor': return <Palette className="h-4 w-4 mr-2 text-gray-500" />;
    case 'hairColor': return <Palette className="h-4 w-4 mr-2 text-gray-500" />;
    case 'height': return <Ruler className="h-4 w-4 mr-2 text-gray-500" />;
    case 'bodyType': return <Weight className="h-4 w-4 mr-2 text-gray-500" />;
    case 'ageRange': return <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />;
    case 'gender': return <VenetianMask className="h-4 w-4 mr-2 text-gray-500" />;
    default: return null;
  }
};

export default function CriminalPage() {
  const { t } = useTranslation();
  const [criminalsList, setCriminalsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    faceColor: "All",
    hairColor: "All",
    height: "All",
    bodyType: "All",
    ageRange: "All",
    gender: "All",
  });

  const fetchCriminals = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('http://localhost:3004/api/criminals/getAllCriminals');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCriminalsList(data.criminals || []);
    } catch (error) {
      console.error("Failed to fetch criminals:", error);
      setFetchError(error.message);
      setCriminalsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCriminals(); }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  const filteredCriminals = useMemo(() => {
    return criminalsList.filter(criminal => {
      const nameMatch = `${criminal.firstName} ${criminal.middleName || ''} ${criminal.lastName}`.toLowerCase().includes(searchTerm);
      
      const filterMatch = Object.keys(filters).every(key => {
        if (filters[key] === "All") return true;
        if (key === "ageRange") {
          if (!criminal.age) return false;
          const [minStr, maxStr] = filters[key].split('-');
          const min = parseInt(minStr.replace('<', '').replace('>', '').replace('+', ''), 10);
          const max = maxStr ? parseInt(maxStr, 10) : Infinity;
          
          if (filters[key].startsWith('<')) return criminal.age < min;
          if (filters[key].startsWith('>')) return criminal.age > min;
          if (filters[key].endsWith('+')) return criminal.age >= min;
          return criminal.age >= min && criminal.age <= max;
        }
        // Ensure criminal[key] exists and is a string before calling toLowerCase()
        return criminal[key] && typeof criminal[key] === 'string' && criminal[key].toLowerCase() === filters[key].toLowerCase();
      });

      return nameMatch && filterMatch;
    });
  }, [searchTerm, filters, criminalsList]);

  // State for toasts and dialog
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const initialCriminalState = {
    photo: "", // This will hold the filename for display, not the file object
    firstName: "",
    middleName: "",
    lastName: "",
    faceColor: "",
    hairColor: "",
    height: "",
    bodyType: "",
    age: "",
    gender: "",
    fileNumber: "",
    policeStationId: ""
  };
  const [newCriminal, setNewCriminal] = useState(initialCriminalState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null); // Ref for the file input

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCriminal(prevCriminal => ({
      ...prevCriminal,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      // Optionally update newCriminal.photo with filename for display if needed
      setNewCriminal(prev => ({ ...prev, photo: file.name }));
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
      setNewCriminal(prev => ({ ...prev, photo: "" }));
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewCriminal(initialCriminalState);
    setSelectedFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const handleAddCriminal = async () => {
    if (!newCriminal.firstName || !newCriminal.lastName || !newCriminal.fileNumber || !selectedFile) {
      setErrorMessage(t("PleasefillinFirstName,LastName,FileNumberandselectaphoto."));
      setShowErrorToast(true);
      return;
    }

    setShowSuccessToast(false);
    setSuccessMessage('');
    setShowErrorToast(false);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('photo', selectedFile); // Key 'photo' must match backend (multer)
    formData.append('firstName', newCriminal.firstName);
    formData.append('middleName', newCriminal.middleName);
    formData.append('lastName', newCriminal.lastName);
    formData.append('faceColor', newCriminal.faceColor);
    formData.append('hairColor', newCriminal.hairColor);
    formData.append('height', newCriminal.height);
    formData.append('bodyType', newCriminal.bodyType);
    formData.append('age', newCriminal.age ? parseInt(newCriminal.age, 10) : '');
    formData.append('gender', newCriminal.gender);
    formData.append('fileNumber', newCriminal.fileNumber);
    formData.append('policeStationId', newCriminal.policeStationId);

    console.log("Sending new criminal data via FormData...");

    try {
      const response = await fetch('http://localhost:3004/api/criminals/addCriminal', {
        method: 'POST',
        body: formData, // FormData sets Content-Type automatically
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      console.log('Criminal added successfully:', data);
      setSuccessMessage(data.message || t('criminalAddedSuccessfully'));
      fetchCriminals(); // Refetch the list of criminals
      setShowSuccessToast(true);
      handleDialogClose();
    } catch (error) {
      console.error('Error adding criminal:', error.message);
      setErrorMessage(error.message || 'Failed to add criminal. Please try again.');
      setShowErrorToast(true);
    }
  };

  // Effect to hide success toast after a delay
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Effect to hide error toast after a delay
  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => setShowErrorToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  // Note: FileReader's data URLs (base64) don't need explicit URL.revokeObjectURL.

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900 dark:to-slate-800 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-600 to-slate-900 dark:from-slate-300 dark:via-slate-200 dark:to-slate-500 sm:text-6xl md:text-7xl">
          {t('amharaPoliceCriminalDatabase')}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('Addandmanagecriminalsefficientlywithouruser-friendlyinterface.')}
        </p>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>{t('addNewCriminal')}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('AddNewCriminal')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
              {/* Photo Upload and Preview Section */}
              <div className="md:col-span-1 space-y-2"> {/* Takes full width on small, half on medium+ */}
                <Label htmlFor="photoFile">{t('CriminalPhoto')}</Label>
                <Input
                  id="photoFile"
                  type="file"
                  name="photo"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mb-2"
                />
                {imagePreviewUrl && (
                  <div className="mt-2 border rounded-md overflow-hidden shadow-sm w-full aspect-square max-w-xs mx-auto md:mx-0"> {/* Centered on small, left on medium+ */}
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Form fields container */}
              <div className="md:col-span-1 space-y-4"> {/* Takes full width on small, half on medium+ */}
                <div>
                  <Label htmlFor="firstName">{t('firstName')}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={newCriminal.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">{t('middleName')}</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    placeholder="Middle Name"
                    value={newCriminal.middleName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('lastName')}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={newCriminal.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                 <div>
                  <Label htmlFor="fileNumber">{t('fileNumber')}</Label>
                  <Input
                    id="fileNumber"
                    name="fileNumber"
                    placeholder="File Number"
                    value={newCriminal.fileNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="policeStationId">{t('policeStationID')}</Label>
                  <Input
                    id="policeStationId"
                    name="policeStationId"
                    placeholder="Police Station ID"
                    value={newCriminal.policeStationId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            
              {/* Other attributes spread across the grid */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, faceColor: value }))} value={newCriminal.faceColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('FaceColor')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.faceColor.slice(1).map(color => (
                      <SelectItem key={color} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, hairColor: value }))} value={newCriminal.hairColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("HairColor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.hairColor.slice(1).map(color => (
                      <SelectItem key={color} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, height: value }))} value={newCriminal.height}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("Height")}/>
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.height.slice(1).map(height => (
                      <SelectItem key={height} value={height}>
                        {height}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, bodyType: value }))} value={newCriminal.bodyType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("bodyType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.bodyType.slice(1).map(bodyType => (
                      <SelectItem key={bodyType} value={bodyType.toLowerCase()}>
                        {bodyType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <Label htmlFor="age">{t('age')}</Label>
                  <Input
                    id="age"
                    type="number"
                    name="age"
                    placeholder={t("age")}
                    value={newCriminal.age}
                    onChange={handleInputChange}
                  />
                </div>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, gender: value }))} value={newCriminal.gender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.gender.slice(1).map(gender => (
                      <SelectItem key={gender} value={gender.toLowerCase()} >
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDialogClose}>{t('cancel')}</Button>
              <Button onClick={handleAddCriminal}>{t('addCriminal')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-3 z-50">
        {showSuccessToast && (
          <div className="flex items-center bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-md">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <div><p className="font-bold">Success</p><p>{successMessage}</p></div>
          </div>
        )}
        {showErrorToast && (
          <div className="flex items-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-md">
            <XCircle className="h-6 w-6 text-red-500 mr-2" />
            <div><p className="font-bold">Error</p><p>{errorMessage}</p></div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <Card className="mb-8 shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
            <UserSearch className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
            {t('filterCriminalsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            type="search"
            placeholder={t('searchByNamePlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="text-base py-3 px-4 shadow-inner dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`filter-${key}`} className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                  <FilterIcon filterKey={key} />
                  {t(key.charAt(0).toUpperCase() + key.slice(1) + 'FilterLabel')}
                </Label>
                <Select
                  value={filters[key]}
                  onValueChange={(value) => handleFilterChange(key, value)}
                >
                  <SelectTrigger id={`filter-${key}`} className="w-full shadow-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue placeholder={t('selectOptionPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option} value={option}>
                        {t(option.toLowerCase().replace(/\s+/g, '') + 'OptionLabel', option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criminals Grid */}
      {isLoading ? (
        <div className="text-center py-12"><p className="text-xl text-gray-500 dark:text-gray-400">Loading criminals...</p></div>
      ) : fetchError ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-xl">Error loading criminals: {fetchError}</p>
          <Button onClick={fetchCriminals} className="mt-4">{t('tryAgain')}</Button>
        </div>
      ) : filteredCriminals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCriminals.map(criminal => (
            <Card key={criminal.criminalId || criminal.fileNumber} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-0 relative">
                <img
                  src={criminal.photo ? (criminal.photo.startsWith('http') || criminal.photo.startsWith('blob:') ? criminal.photo : `http://localhost:3004/uploads/${criminal.photo}`) : 'https://placehold.co/400x300?text=No+Image'}
                  alt={`${criminal.firstName} ${criminal.lastName}`}
                  className="w-full h-64 object-cover object-center"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {criminal.firstName} {criminal.middleName} {criminal.lastName}
                </CardTitle>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {t('fileNumberLabel')}: {criminal.fileNumber}
                </p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>{t('ageLabel')}:</strong> {criminal.age || 'N/A'}</p>
                  <p><strong>{t('genderLabel')}:</strong> {criminal.gender || 'N/A'}</p>
                  <p><strong>{t('heightLabel')}:</strong> {criminal.height || 'N/A'}</p>
                  <p><strong>{t('bodyTypeLabel')}:</strong> {criminal.bodyType || 'N/A'}</p>
                  <p><strong>{t('hairColorLabel')}:</strong> {criminal.hairColor || 'N/A'}</p>
                  <p><strong>{t('faceColorLabel')}:</strong> {criminal.faceColor || 'N/A'}</p>
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600 flex justify-start items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Police Station ID: {criminal.policeStationId || 'N/A'}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <img src="/placeholder-no-results.svg" alt={t('noResultsFoundAlt')} className="mx-auto h-40 w-40 mb-4 opacity-70" />
          <p className="text-xl text-gray-500 dark:text-gray-400">{t('noCriminalsMatchFilters')}</p>
        </div>
      )}
    </div>
  );
}