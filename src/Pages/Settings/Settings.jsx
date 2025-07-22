import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { ChevronDown } from 'lucide-react'; // Import an icon for the dropdown
import axios from 'axios'; // Import axios for making HTTP requests
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner'; // Import toast for notifications

// Define a path for the mock station logo
const MOCK_STATION_LOGO_PATH = "/image/fedral.png";

export default function Settings() {
  const { darkMode, toggleDarkMode, language, changeLanguage } = useAppContext();
  const { t } = useTranslation();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  
  const [officerData, setOfficerData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    policeOfficerId: '',
    roleName: '',
    status: '',
    policeOfficerPhoneNumber: '',
    policeOfficerGender: '',
    birthDate: '', // Will store only the year
  });

  const [stationData, setStationData] = useState({
    name: '',
    logo: '',
    phoneNumber: '',
    secPhoneNumber: '',
  });

  const [policeStationInfoOpen, setPoliceStationInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    const fetchOfficerInfo = async () => {
      if (!currentUser || !currentUser.policeOfficerId) {
        setIsLoading(false);
        setFetchError("User information not available. Please log in.");
        console.log("User or policeOfficerId not available yet.");
        return;
      }

      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(`http://localhost:3004/api/setting/display-info/${currentUser.policeOfficerId}`);
        const data = response.data;

        if (data) {
          setOfficerData({
            firstName: data.policeOfficerFname || '',
            middleName: data.policeOfficerMname || '',
            lastName: data.policeOfficerLname || '',
            policeOfficerId: data.policeOfficerId || '',
            roleName: data.policeOfficerRoleName || '',
            status: data.policeOfficerStatus || '',
            policeOfficerPhoneNumber: data.policeOfficerPhoneNumber || '',
            policeOfficerGender: data.policeOfficerGender || '',
            birthDate: data.policeOfficerBirthdate ? new Date(data.policeOfficerBirthdate).getFullYear().toString() : '',
          });

          setStationData({
            name: data.nameOfPoliceStation || 'N/A',
            logo: data.policeStationLogo || '', // e.g., 'uploads/station_logo.png'
            phoneNumber: data.policeStationPhoneNumber || 'N/A',
            secPhoneNumber: data.secPoliceStationPhoneNumber || 'N/A',
          });
        } else {
          setFetchError("No data returned for the officer.");
        }

      } catch (error) {
        console.error("Error fetching officer info:", error);
        setFetchError("Failed to load officer information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfficerInfo();
  }, [currentUser]); // Re-run if currentUser (and thus policeOfficerId) changes

  // This handler is kept for potential future use, though inputs are currently disabled.
  const handleOfficerDataChange = (e) => {
    const { name, value } = e.target;
    setOfficerData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // This function is kept for potential future use.
  const saveOfficerData = () => {
    console.log('Saving officer data:', officerData);
    // Code to save officer data to backend would go here
  };
  
  const savePasswordChanges = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('passwordsDoNotMatch', 'New passwords do not match!'));
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error(t('allPasswordFieldsRequired', 'All password fields are required.'));
      return;
    }
    if (!currentUser || !currentUser.policeOfficerId) {
      toast.error(t('userInfoNotAvailable', 'User information not available. Cannot change password.'));
      return;
    }

    try {
      const payload = {
        policeOfficerId: currentUser.policeOfficerId,
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
      const response = await axios.post('http://localhost:3004/api/setting/updatepassword', payload);
      toast.success(response.data.message || t('passwordUpdatedSuccess', 'Password updated successfully!'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
    } catch (error) {
      console.error("Error updating password:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.message || t('passwordUpdateFailed', 'Failed to update password. Please try again.');
      toast.error(errorMessage);
    }
  };
  
  const stationLogoSrc = useMemo(() => {
    return MOCK_STATION_LOGO_PATH; // Always use the mock image
  }, []); // Empty dependency array as it's now static

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('setting')}</h1>
      
      <Tabs defaultValue="account">
        <TabsList className="w-full border-b mb-4 pb-0 space-x-6">
          <TabsTrigger value="account" className="text-lg">
            {t('accountSettings')}
          </TabsTrigger>
          <TabsTrigger value="system" className="text-lg">
            {t('systemSettings')}
          </TabsTrigger>
          
        </TabsList>
        
        {/* Account Settings Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profileInfo')}</CardTitle>
                <CardDescription>{t('profileInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading && <p>{t('loading') || 'Loading information...'}</p>}
                {fetchError && <p className="text-red-500">{fetchError}</p>}
                {!isLoading && !fetchError && (
                  <>
                    {/* Police Station Info */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={stationLogoSrc}
                            alt={stationData.name || "Police Station"}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = MOCK_STATION_LOGO_PATH; }} // Fallback to mock image
                          />
                          <div>
                            <p className="font-semibold">{stationData.name}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setPoliceStationInfoOpen(!policeStationInfoOpen)}>
                          <ChevronDown className={`h-5 w-5 transform transition-transform ${policeStationInfoOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                      {policeStationInfoOpen && (
                        <div className="mt-3 pl-12 space-y-1 text-sm text-gray-600">
                          <p>Phone: {stationData.phoneNumber}</p>
                          <p>Alt Phone: {stationData.secPhoneNumber}</p>
                        </div>
                      )}
                    </div>

                    {/* Profile Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('firstName')}</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={officerData.firstName} 
                      onChange={handleOfficerDataChange} // Kept for consistency, though disabled
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">{t('Middle Name') || 'Middle Name'}</Label> {/* Added fallback for t function */}
                    <Input 
                      id="middleName" 
                      name="middleName" 
                      value={officerData.middleName} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('lastName')}</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={officerData.lastName} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policeOfficerId">{t('Police Officer Id') || 'Police Officer ID'}</Label> {/* Added fallback */}
                    <Input 
                      id="policeOfficerId" 
                      name="policeOfficerId" 
                      value={officerData.policeOfficerId} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleName">{t('Role Name') || 'Role Name'}</Label> {/* Added fallback */}
                    <Input 
                      id="roleName" 
                      name="roleName" 
                      value={officerData.roleName} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{t('Status') || 'Status'}</Label> {/* Added fallback */}
                    <div
                      id="status"
                      className={`px-3 py-2 rounded-md text-sm font-medium text-white w-full ${
                        // Assuming '1' means active and '0' means blocked. Adjust if your API returns different values.
                        officerData.status === '1' || officerData.status === 1
                          ? 'bg-green-500'
                          : officerData.status === '0' || officerData.status === 0
                          ? 'bg-red-500'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' // Default/unknown status
                      }`}
                    >
                      {officerData.status === '1' || officerData.status === 1 ? t('active', 'Active') : 
                       officerData.status === '0' || officerData.status === 0 ? t('blocked', 'Blocked') : 
                       t('unknown', officerData.status || 'Unknown')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policeOfficerPhoneNumber">{t('Police Officer Phone Number') || 'Phone Number'}</Label> {/* Added fallback */}
                    <Input 
                      id="policeOfficerPhoneNumber" 
                      name="policeOfficerPhoneNumber" 
                      value={officerData.policeOfficerPhoneNumber} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policeOfficerGender">{t('Police Officer Gender') || 'Gender'}</Label> {/* Added fallback */}
                    <Input 
                      id="policeOfficerGender" 
                      name="policeOfficerGender" 
                      value={officerData.policeOfficerGender} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">{t('Birth Date') || 'Birth Date'}</Label> {/* Added fallback */}
                    <Input 
                      id="birthDate" 
                      name="birthDate" 
                      type="text" // Changed type to text
                      value={officerData.birthDate} 
                      onChange={handleOfficerDataChange}
                      disabled
                    />
                  </div>
                </div>
                  </>
                )}
                {/* Save Changes Button was previously removed from this card */}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('Change Password')}</CardTitle>
                <CardDescription>{t('Change Password')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('Current Password')}</Label>
                    <Input 
                      id="currentPassword" 
                      name="currentPassword" 
                      type="password" 
                      value={passwordForm.currentPassword} 
                      onChange={handlePasswordChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('New Password')}</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword" 
                      type="password" 
                      value={passwordForm.newPassword} 
                      onChange={handlePasswordChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('Confirm Password')}</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={passwordForm.confirmPassword} 
                      onChange={handlePasswordChange} 
                    />
                  </div>
                  <Button onClick={savePasswordChanges}>{t('Save Changes')}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* System Settings Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('System Settings')}</CardTitle>
                <CardDescription>{t('System Settings ')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="language">{t('language')}</Label>
                      <p className="text-sm text-gray-500">{t('Language Desc')}</p>
                    </div>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="border rounded-md p-2 dark:bg-gray-700 dark:text-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">{t('English')}</option>
                      <option value="am">{t('Amharic')}</option>
                    </select>
                  </div>
                  
                  
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="darkMode">{t('Dark Mode')}</Label>
                      <p className="text-sm text-gray-500">{t('Dark Mode Desc')}</p>
                    </div>
                    <Switch 
                      id="darkMode" 
                      checked={darkMode} 
                      onCheckedChange={toggleDarkMode} 
                    />
                  </div>
                  
                  
                </div>
              </CardContent>
            </Card>
            
           
          </div>
        </TabsContent>
        
       
       
        
      </Tabs>
    </div>
  );
}
