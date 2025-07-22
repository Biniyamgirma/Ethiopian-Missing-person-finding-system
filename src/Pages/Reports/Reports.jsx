import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Assuming this path is correct
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Assuming this path is correct
import { X } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth



const IMAGE_BASE_URL = "http://localhost:3004/uploads/"; // Adjust if your image serving path is different

export default function Reports() {
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  // Holds a copy of the report data for editing in the popup
  const [editableReportDetails, setEditableReportDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPoliceDetailsInPopup, setShowPoliceDetailsInPopup] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      if (!currentUser || !currentUser.policeStationId) {
        setError("User not authenticated or police station ID not available.");
        setIsLoading(false);
        setNotifications([]);
        return;
      }

      try {
        const policeStationId = currentUser.policeStationId;
        const response = await fetch('http://localhost:3004/api/report/getReportsSpecificToPoliceStation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ policeStationId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Assuming the API returns an array of reports directly,
        // or if it's nested, adjust data.reports accordingly.
        // API response is { count: N, reports: [...] }
        if (data && data.reports) {
          const transformedReports = data.reports.map(report => ({
            alertId: String(report.alertId), // Ensure alertId is a string if used as key/id
            firstName: report.firstName,
            middleName: report.middleName,
            lastName: report.lastName,
            age: String(report.age).replace('.0',''), // API sends "12.0"
            gender: report.gender,
            town: report.lastLocation, // Map lastLocation to town
            localPoliceId: report.localPoliceStationId, // Map
            postPoliceId: report.postPoliceStationId, // Map
            message: report.reportDescription, // Map reportDescription to message
            isread:  report.isread == 0? true : false, // Convert 0/1 to boolean, // Convert 0/1 to boolean
            priority: report.priority,
            reportedTime: report.created_at, // Map created_at to reportedTime
            // Include other fields needed for the popup/details view
            imagePath: report.imagePath,
            personStatus: report.personStatus,
            nameOfPoliceStation: report.nameOfPoliceStation,
            policeStationLogo: report.policeStationLogo,
            policeStationPhoneNumber: report.policeStationPhoneNumber,
            secPoliceStationPhoneNumber: report.secPoliceStationPhoneNumber,
          }));
          setNotifications(transformedReports);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError(err.message);
        setNotifications([]); // Clear notifications on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [currentUser]); // Re-fetch if currentUser changes

  // Sort notifications: unread first, then by priority, then by time (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isread !== b.isread) {
      return a.isread ? 1 : -1;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(b.reportedTime) - new Date(a.reportedTime);
  });


  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 1: // High
        return 'border-l-4 border-red-500';
      case 2: // Medium
        return 'border-l-4 border-yellow-500';
      case 3: // Low
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300'; // Default or unknown priority
    }
  };

  const handleMarkAsRead = (alertId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(report =>
        report.alertId === alertId ? { ...report, isread: true } : report
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(report => ({ ...report, isread: true }))
    );
  };

  const handleViewDetails = (report) => {
    // Set a copy of the report for editing, so original state isn't directly mutated by inputs
    setEditableReportDetails({ ...report });
    setShowPoliceDetailsInPopup(false); // Reset police details visibility on new popup open
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditableReportDetails(null);
    setShowPoliceDetailsInPopup(false); // Reset on close
  };

  // Handles changes in the popup's input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableReportDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const togglePoliceDetails = () => {
    setShowPoliceDetailsInPopup(prev => !prev);
  }
  
  // Formats date string to be more readable
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const allRead = notifications.every(n => n.isread);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">Incoming Reports</h1>
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={allRead}
          className="transition-colors duration-150 ease-in-out hover:bg-blue-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 disabled:opacity-50"
        >
          {allRead ? 'All Reports Read' : 'Mark All as Read'}
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">Loading reports...</p>
          {/* You can add a spinner icon here */}
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-10 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">
          <p className="text-xl text-red-600 dark:text-red-400">Error fetching reports: {error}</p>
        </div>
      )}

      {!isLoading && !error && sortedNotifications.length === 0 ? (
         <div className="text-center py-10">
            <p className="text-xl text-gray-500 dark:text-gray-400">No reports available at the moment.</p>
         </div>
      ) : (!isLoading && !error && sortedNotifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotifications.map((report) => (
            <Card 
              key={report.alertId} 
              className={`
                ${getPriorityStyle(report.priority)} 
                ${
                  !report.isread == true ? 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl' : 'bg-gray-100 dark:bg-gray-700 shadow-md'}
                transition-all duration-300 ease-in-out rounded-lg overflow-hidden
              `}
            >
              <CardHeader className="pb-2 pt-4 px-4 ">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {report.firstName || 'N/A'} {report.lastName || ''}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Sighting in: {report.town || 'Unknown Location'}</CardDescription>
                     <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                      Reported: <span className='font-medium text-gray-700 dark:text-gray-300'>{formatDateTime(report.reportedTime)}</span>
                    </CardDescription>
                  </div>
                  {!report.isread && (
                    <div 
                      className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0" 
                      title="Unread"
                    ></div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{report.message || 'No details provided.'}</p>
                <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Age: <span className='font-medium text-gray-700 dark:text-gray-300'>{report.age || 'N/A'}</span>, Gender: <span className='font-medium text-gray-700 dark:text-gray-300'>{report.gender || 'N/A'}</span>
                </CardDescription>
                 <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Local Station: <span className='font-medium text-gray-700 dark:text-gray-300'>{report.localPoliceId || 'N/A'}</span>
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-2 pb-3 px-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                {
                
                !report.isread && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMarkAsRead(report.alertId)}
                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700"
                  >
                    Mark as Read
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={() => handleViewDetails(report)}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:hover:bg-blue-500"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ))}

      {/* Popup Modal */}
      {showPopup && editableReportDetails && (
        // Ensure z-50 is high enough to be on top of other page elements.
        // If overlapping persists, check z-index of other fixed/absolute positioned elements.
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <Card className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-in-out scale-95 animate-fadeIn">
            <CardHeader className="bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Report Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleClosePopup} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Review the information for the report concerning {editableReportDetails.firstName} {editableReportDetails.lastName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={editableReportDetails.firstName || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    id="middleName"
                    value={editableReportDetails.middleName || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={editableReportDetails.lastName || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={editableReportDetails.age || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <select
                    name="gender"
                    id="gender"
                    value={editableReportDetails.gender || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                 <div>
                  <label htmlFor="town" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Town of Sighting</label>
                  <input
                    type="text"
                    name="town"
                    id="town"
                    value={editableReportDetails.town || ''} // Mapped from lastLocation
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="localPoliceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sighting Location Police Station</label>
                  <input
                    type="text"
                    name="localPoliceId"
                    id="localPoliceId"
                    value={editableReportDetails.localPoliceId || ''} // Mapped from localPoliceStationId
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="postPoliceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Original Reporting Police Station</label>
                  <input
                    type="text"
                    name="postPoliceId"
                    id="postPoliceId"
                    value={editableReportDetails.postPoliceId || ''} // Mapped from postPoliceStationId
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                 <div className="sm:col-span-2">
                  <label htmlFor="reportedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reported Date & Time</label>
                  <input
                    type="datetime-local"
                    name="reportedTime"
                    id="reportedTime"
                    value={editableReportDetails.reportedTime ? new Date(editableReportDetails.reportedTime).toISOString().substring(0,16) : ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    readOnly // If this is just for display from created_at
                  /> 
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Post Description / Sighting Details</label>
                  <textarea
                    name="message"
                    id="message"
                    rows="4"
                    value={editableReportDetails.message || ''} // Mapped from reportDescription
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  ></textarea>
                </div>
              </div>

              {/* Person's Image Display Container */}
              {editableReportDetails.imagePath && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Associated Person's Image</label>
                  <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    <img 
                      src={`${IMAGE_BASE_URL}${editableReportDetails.imagePath}`} 
                      alt={`Image of ${editableReportDetails.firstName} ${editableReportDetails.lastName}`}
                      className="max-w-full max-h-60 object-contain rounded-md shadow-sm" 
                    />
                  </div>
                </div>
              )}

              {/* Police Station Info Container */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={togglePoliceDetails}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && togglePoliceDetails()}
                >
                  {editableReportDetails.policeStationLogo && (
                    <img src={`${IMAGE_BASE_URL}${editableReportDetails.policeStationLogo}`} alt={`${editableReportDetails.nameOfPoliceStation} Logo`} className="w-12 h-12 object-contain rounded-md bg-white p-1 shadow-sm"/>
                  )}
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{editableReportDetails.nameOfPoliceStation || 'Police Station Information'}</h3>
                   <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{showPoliceDetailsInPopup ? 'Hide Details' : 'Show Details'}</span>
                </div>
                {showPoliceDetailsInPopup && editableReportDetails.nameOfPoliceStation && (
                  <div className="mt-3 pl-4 pr-2 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-md space-y-1 animate-fadeIn">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Primary Phone:</span> {editableReportDetails.policeStationPhoneNumber || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Secondary Phone:</span> {editableReportDetails.secPoliceStationPhoneNumber || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3 p-4 bg-gray-50 dark:bg-gray-700/60 border-t border-gray-200 dark:border-gray-600">
              <Button 
                variant="outline" 
                onClick={handleClosePopup}
                className="transition-colors duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
              >
                Back
              </Button>
              {/* If you want to save changes, you'd add a Save button here and a handler:
                <Button 
                  onClick={handleSaveChanges} // You would need to implement handleSaveChanges
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button> 
              */}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Basic CSS for fadeIn animation (can be in a global CSS file or <style> tag in HTML) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        body { // Ensure body takes full height for modal overlay
          font-family: 'Inter', sans-serif; // Example font
        }
        // Add Tailwind JIT classes if not automatically picked up for dynamic classes like line-clamp
      `}</style>
    </div>
  );
}


// Then add it to your tailwind.config.js: plugins: [require('@tailwindcss/line-clamp'),],
