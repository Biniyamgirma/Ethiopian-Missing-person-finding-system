import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";


// Updated form fields for text inputs
const textInputFormFields = [
  { name: 'nameOfPoliceStation', label: 'Station Name', type: 'text', required: true },
  { name: 'policeStationPhoneNumber', label: 'Primary Contact Number', type: 'tel', required: true },
  { name: 'secPoliceStationPhoneNumber', label: 'Secondary Contact Number', type: 'tel', required: false },
];

const initialNewStationData = {
  nameOfPoliceStation: '',
  policeStationPhoneNumber: '',
  secPoliceStationPhoneNumber: '',
  policeStationLogo: '', // Will store the filename of the logo
  selectedRegion: '', // Will store rootId
  selectedZone: '',   // Will store zoneId (not directly in payload, but used for selection)
  selectedTown: '',   // Will store townId
};

const GLOBAL_ROOT_ID = 1; // Global variable for rootId

const ManagePoliceStationPage = () => {
  const [activeTab, setActiveTab] = useState('view'); // 'add', 'view'
  const [stations, setStations] = useState([]);
  const [newStation, setNewStation] = useState(initialNewStationData);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { darkMode: isDarkMode, toggleDarkMode } = useAppContext(); // Use context
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const logoFileInputRef = useRef(null);

  const [selectedStationDetails, setSelectedStationDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // State for dynamic dropdowns
  const [regionsData, setRegionsData] = useState([]);
  const [isRegionsLoading, setIsRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState(null);

  const [zonesData, setZonesData] = useState([]);
  const [isZonesLoading, setIsZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState(null);

  const [townsData, setTownsData] = useState([]);
  const [isTownsLoading, setIsTownsLoading] = useState(false);
  const [townsError, setTownsError] = useState(null);

  const fetchPoliceStations = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('http://localhost:3004/api/admin/getPoliceStations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rootId: GLOBAL_ROOT_ID }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // Map API data to the structure expected by the table/details view
      const formattedStations = result.data.map(station => ({
        id: station.policeStationId,
        name: station.nameOfPoliceStation,
        // Use townName, zoneName, and regionName from the API response
        location: `Town: ${station.townName || 'N/A'}, Zone: ${station.zoneName || 'N/A'}, Region: ${station.regionName || 'N/A'}`,
        contact: station.policeStationPhoneNumber,
        secPoliceStationPhoneNumber: station.secPoliceStationPhoneNumber,
        policeStationLogo: station.policeStationLogo,
        // Keep original API data if needed for details
        ...station
      }));
      setStations(formattedStations);
    } catch (error) {
      console.error("Failed to fetch police stations:", error);
      setFetchError(error.message);
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegionsData = async () => {
    setIsRegionsLoading(true);
    setRegionsError(null);
    try {
      const response = await fetch('http://localhost:3004/api/country/allRegion');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRegionsData(data.regions || []);
    } catch (error) {
      console.error("Failed to fetch regions:", error);
      setRegionsError(error.message);
      setRegionsData([]);
    } finally {
      setIsRegionsLoading(false);
    }
  };

  const fetchZonesData = async (regionId) => {
    if (!regionId) {
      setZonesData([]);
      return;
    }
    setIsZonesLoading(true);
    setZonesError(null);
    try {
      const response = await fetch(`http://localhost:3004/api/country/specificZone/${regionId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assuming API returns { message: "...", zones: [{ zoneId: ..., zoneName: ... }] }
      setZonesData(data.zones || []);
    } catch (error) {
      console.error(`Failed to fetch zones for region ${regionId}:`, error);
      setZonesError(error.message);
      setZonesData([]);
    } finally {
      setIsZonesLoading(false);
    }
  };

  const fetchTownsData = async (zoneId) => {
    if (!zoneId) {
      setTownsData([]);
      return;
    }
    setIsTownsLoading(true);
    setTownsError(null);
    try {
      const response = await fetch(`http://localhost:3004/api/country/specificTown/${zoneId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assuming API returns { message: "...", towns: [{ townId: ..., townName: ... }] }
      setTownsData(data.towns || []);
    } catch (error) {
      console.error(`Failed to fetch towns for zone ${zoneId}:`, error);
      setTownsError(error.message);
      setTownsData([]);
    } finally {
      setIsTownsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchPoliceStations();
    }
    // Fetch regions if add tab is active and regionsData is empty or there was a previous error
    if (activeTab === 'add' && (regionsData.length === 0 || regionsError)) {
      fetchRegionsData();
    }
  }, [activeTab, regionsData.length, regionsError]); // Add dependencies to refetch if error occurred


  const handleInputChange = (e, formSetter) => {
    const { name, value } = e.target;
    formSetter(prevState => ({ ...prevState, [name]: value }));
  };

  const handleNewStationRegionChange = (value) => {
    setNewStation(prevState => ({
      ...prevState,
      selectedRegion: value,
      selectedZone: '', // Reset dependent field
      selectedTown: '',   // Reset dependent field
    }));
    setZonesData([]); // Clear previous zones
    setTownsData([]); // Clear previous towns
    if (value) {
      fetchZonesData(value);
    }
  };

  const handleNewStationZoneChange = (value) => {
    setNewStation(prevState => ({
      ...prevState,
      selectedZone: value,
      selectedTown: '', // Reset dependent field
    }));
    setTownsData([]); // Clear previous towns
    if (value) {
      fetchTownsData(value);
    }
  };

  const handleNewStationTownChange = (value) => {
    setNewStation(prevState => ({
      ...prevState,
      selectedTown: value,
    }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setNewStation(prev => ({ ...prev, policeStationLogo: file.name })); // Store filename in newStation state
    } else {
      setSelectedLogoFile(null);
      setLogoPreviewUrl(null);
      setNewStation(prev => ({ ...prev, policeStationLogo: "" }));
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = ""; // Clear the file input
      }
    }
  };


  const handleAddStation = async (e) => {
    e.preventDefault();
    if (!newStation.nameOfPoliceStation || !newStation.policeStationPhoneNumber || !newStation.selectedRegion || !newStation.selectedZone || !newStation.selectedTown) {
      alert("Station Name, Primary Contact, Region, Zone, and Town are required.");
      return;
    }

    const formData = new FormData();
    formData.append('nameOfPoliceStation', newStation.nameOfPoliceStation);
    formData.append('policeStationPhoneNumber', newStation.policeStationPhoneNumber);
    if (newStation.secPoliceStationPhoneNumber) {
      formData.append('secPoliceStationPhoneNumber', newStation.secPoliceStationPhoneNumber);
    }
    
    if (newStation.policeStationLogo) {
        formData.append('policeStationLogo', newStation.policeStationLogo); // Send filename
    }
    formData.append('townId', parseInt(newStation.selectedTown, 10));
    formData.append('subCityId', String(1));
    formData.append('rootId', parseInt(newStation.selectedRegion, 10));

    if (selectedLogoFile) {
      formData.append('logoFile', selectedLogoFile); // Key for the actual file
    }

    try {
      const response = await fetch('http://localhost:3004/api/police/root/add-police-station', {
        method: 'POST',
        
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add station and parse error response.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

   
      fetchPoliceStations(); // Refetch to get the latest list including the new one
      setNewStation(initialNewStationData); // Reset form
      // Reset dynamic dropdown data as well
      setZonesData([]);
      setTownsData([]);
      setActiveTab('view');
      setSelectedLogoFile(null);
      setLogoPreviewUrl(null);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";

      alert('Police station added successfully!');
    } catch (error) {
      console.error('Error adding police station:', error);
      alert(`Error adding police station: ${error.message}`);
    }
  };

  const handleViewStationDetails = (station) => {
    setSelectedStationDetails(station);
    setIsDetailModalOpen(true);
  };

  const renderFormFields = (formData, changeHandler) => {
    return textInputFormFields.map(field => ( // Use textInputFormFields here
      <div key={field.name} className="space-y-1">
        <Label
          htmlFor={`${activeTab}-${field.name}`}
          // Shadcn Label component handles its own styling
        >
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          type={field.type}
          name={field.name}
          id={`${activeTab}-${field.name}`}
          value={formData[field.name] || ''} // Ensure value is not undefined
          onChange={(e) => handleInputChange(e, changeHandler)}
          required={field.required}
          placeholder={field.label}
          // Shadcn Input component handles its own styling
        />
      </div>
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Add New Police Station
            </h2>
            <form
              onSubmit={handleAddStation}
              className={`space-y-6 p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              {/* Station Name - Full width */}
              {textInputFormFields
                .filter(field => field.name === 'nameOfPoliceStation')
                .map(field => (
                  <div key={field.name} className="space-y-1">
                    <Label htmlFor={`add-${field.name}`}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                    <Input type={field.type} name={field.name} id={`add-${field.name}`} value={newStation[field.name] || ''} onChange={(e) => handleInputChange(e, setNewStation)} required={field.required} placeholder={field.label} />
                  </div>
                ))}

              {/* Phone Numbers - In a row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {textInputFormFields
                  .filter(field => field.name === 'policeStationPhoneNumber' || field.name === 'secPoliceStationPhoneNumber')
                  .sort((a, b) => (a.name === 'policeStationPhoneNumber' ? -1 : 1))
                  .map(field => (
                    <div key={field.name} className="flex-1 space-y-1">
                      <Label htmlFor={`add-${field.name}`}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                      <Input type={field.type} name={field.name} id={`add-${field.name}`} value={newStation[field.name] || ''} onChange={(e) => handleInputChange(e, setNewStation)} required={field.required} placeholder={field.label} />
                    </div>
                  ))}
              </div>

              {/* Police Station Logo - File Input */}
              <div className="space-y-1">
                <Label htmlFor="add-logoFile">Police Station Logo</Label>
                <Input
                  id="add-logoFile"
                  type="file"
                  name="logoFile"
                  ref={logoFileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/*"
                  className="mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {logoPreviewUrl && (
                  <div className={`mt-2 border rounded-md overflow-hidden shadow-sm w-full aspect-[16/9] max-w-xs ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <img
                      src={logoPreviewUrl}
                      alt="Logo Preview"
                      className="w-full h-full object-contain" // Changed to object-contain for better logo visibility
                    />
                  </div>
                )}
                 {/* Display filename if no preview (e.g. if loaded from existing data without file object) */}
                {!logoPreviewUrl && newStation.policeStationLogo && (
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Current logo: {newStation.policeStationLogo}
                    </p>
                )}
              </div>
              {/* Region Dropdown */}
              {/* Region, Zone, Town Dropdowns - In a row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1">
                <Label htmlFor="add-region">
                  Region <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newStation.selectedRegion}
                  onValueChange={handleNewStationRegionChange}
                  required
                >
                  <SelectTrigger id="add-region" className="w-full">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {isRegionsLoading && <SelectItem value="loading_regions" disabled>Loading regions...</SelectItem>}
                    {regionsError && <SelectItem value="error_regions" disabled>Error: {regionsError}</SelectItem>}
                    {!isRegionsLoading && !regionsError && regionsData.length === 0 && <SelectItem value="no_regions" disabled>No regions found</SelectItem>}
                    {regionsData.map(region => (
                      <SelectItem key={region.regionId} value={String(region.regionId)}>{region.regionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="flex-1 space-y-1">
                <Label htmlFor="add-zone">
                  Zone <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newStation.selectedZone}
                  onValueChange={handleNewStationZoneChange}
                  required
                  disabled={!newStation.selectedRegion || isZonesLoading || zonesData.length === 0 && !zonesError}
                >
                  <SelectTrigger id="add-zone" className="w-full">
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {isZonesLoading && <SelectItem value="loading_zones" disabled>Loading zones...</SelectItem>}
                    {zonesError && <SelectItem value="error_zones" disabled>Error: {zonesError}</SelectItem>}
                    {!isZonesLoading && !zonesError && zonesData.length === 0 && <SelectItem value="no_zones" disabled>No zones found for selected region</SelectItem>}
                    {zonesData.map(zone => (
                      <SelectItem key={zone.zoneId} value={String(zone.zoneId)}>{zone.zoneName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="flex-1 space-y-1">
                <Label htmlFor="add-town">
                  Town <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newStation.selectedTown}
                  onValueChange={handleNewStationTownChange}
                  required
                  disabled={!newStation.selectedZone || isTownsLoading || townsData.length === 0 && !townsError}
                >
                  <SelectTrigger id="add-town" className="w-full">
                    <SelectValue placeholder="Select Town" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {isTownsLoading && <SelectItem value="loading_towns" disabled>Loading towns...</SelectItem>}
                    {townsError && <SelectItem value="error_towns" disabled>Error: {townsError}</SelectItem>}
                    {!isTownsLoading && !townsError && townsData.length === 0 && <SelectItem value="no_towns" disabled>No towns found for selected zone</SelectItem>}
                    {townsData.map(town => (
                      <SelectItem key={town.townId} value={String(town.townId)}>{town.townName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              </div>

              <Button
                type="submit"
               
              >
                Add Station
              </Button>
            </form>
          </div>
        );
      case 'view':
        return (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Police Stations List
            </h2>
            <div className={`overflow-x-auto shadow rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {['ID', 'Name', 'Location', 'Actions'].map(header => (
                    // {['ID', 'Name', 'Location', 'Contact', 'Head Officer'].map(header => ( // Removed 'Actions'
                      <th
                        key={header}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {stations.length === 0 ? (
                    <tr>
                      <td // isLoading and fetchError checks will handle this better
                        colSpan="4" // Adjusted colspan since 'Head Officer' is removed
                        className={`px-6 py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        No police stations found.
                      </td>
                    </tr>
                  ) : (
                    stations.map(station => (
                      <tr key={station.id}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {station.id}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {station.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {station.location}
                        </td>
                       
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStationDetails(station)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'loading': // A pseudo-tab or state for loading
        return (
          <div className="text-center py-12">
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading police stations...</p>
            
          </div>
        );
      case 'error': // A pseudo-tab or state for error
        return (
          <div className="text-center py-12 text-red-500">
            <p className="text-xl">Error loading police stations: {fetchError}</p>
            <Button onClick={fetchPoliceStations} className="mt-4">Try Again</Button>
          </div>
        );
      default:
        return <p>Select a tab</p>;
    }
  };

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm focus:outline-none disabled:opacity-50 ${
        activeTab === tabName
          ? `${isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-500 text-indigo-600'}`
          : `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Manage Police Stations
        </h1>
        <button
          onClick={toggleDarkMode} // Use toggleDarkMode from context
          className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 focus:ring-yellow-500 focus:ring-offset-gray-900'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-indigo-500 focus:ring-offset-gray-100'
          }`}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className={`block w-full focus:ring-sky-400 focus:border-sky-400 rounded-md ${isDarkMode ? 'bg-sky-400 border-sky-400 text-white' : 'border-gray-300'}`}
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            <option value="view">View Stations</option>
            <option value="add">Add Station</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <TabButton tabName="view" label="View Stations" />
              <TabButton tabName="add" label="Add New Station" />
            </nav>
          </div>
        </div>
      </div>

      <div>
        {isLoading && activeTab === 'view' ? (
          <div className="text-center py-12"><p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading police stations...</p></div>
        ) : fetchError && activeTab === 'view' ? (
          <div className="text-center py-12 text-red-500"><p className="text-xl">Error: {fetchError}</p><Button onClick={fetchPoliceStations} className="mt-4">Try Again</Button></div>
        ) : renderContent()}
      </div>

      {selectedStationDetails && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className={`sm:max-w-lg ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white'}`}>
            <DialogHeader>
              <DialogTitle className={isDarkMode ? 'text-gray-50' : 'text-gray-900'}>
                Police Station Details
              </DialogTitle>
            </DialogHeader>
            <div className={`space-y-3 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedStationDetails.policeStationLogo && (
                <div className="mb-4 text-center"> {/* Centered the logo block */}
                  <Label className={`font-semibold block mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Logo</Label>
                  <div className={`mt-1 border rounded-lg overflow-hidden shadow-md w-48 h-32 mx-auto p-1 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}> {/* Enhanced image container */}
                    <img
                      src={selectedStationDetails.policeStationLogo.startsWith('http') || selectedStationDetails.policeStationLogo.startsWith('blob:') ? selectedStationDetails.policeStationLogo : `http://localhost:3004/uploads/${selectedStationDetails.policeStationLogo}`} // Adjust path as needed
                      alt={`${selectedStationDetails.name || selectedStationDetails.nameOfPoliceStation} Logo`}
                      className="w-full h-full object-contain" // object-contain is good for logos
                    />
                  </div>
                </div>
              )}
              <p><strong className="font-semibold">Station ID:</strong> {selectedStationDetails.id || selectedStationDetails.policeStationId}</p>
              <p><strong className="font-semibold">Name:</strong> {selectedStationDetails.name || selectedStationDetails.nameOfPoliceStation}</p>
              {/* Display townName, zoneName, regionName. Fallback to IDs if names are not available. */}
              <p><strong className="font-semibold">Location Details:</strong>
                Town: {selectedStationDetails.townName || `(ID: ${selectedStationDetails.townId})`},
                Zone: {selectedStationDetails.zoneName || `(ID: ${selectedStationDetails.zoneId})`},
                Region: {selectedStationDetails.regionName || `(ID: ${selectedStationDetails.regionId})`}</p>
              <p><strong className="font-semibold">Primary Contact:</strong> {selectedStationDetails.contact || selectedStationDetails.policeStationPhoneNumber}</p>
              {selectedStationDetails.secPoliceStationPhoneNumber && (
                <p><strong className="font-semibold">Secondary Contact:</strong> {selectedStationDetails.secPoliceStationPhoneNumber}</p>
              )}
              {/* Add more details as needed */}
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManagePoliceStationPage;
