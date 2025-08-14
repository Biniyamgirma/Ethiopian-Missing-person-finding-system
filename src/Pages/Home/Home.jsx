import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PostDetailPopup from '@/components/PostDetailPopup';
import ReportPopup from '@/components/ReportPopup'; 
import Toast from '@/components/Toast'; 

import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const IMAGE_BASE_URL = 'http://localhost:3004/uploads/'; // Base URL for images from the backend uploads folder
const COUNTRY_ID = 1; // Global variable for countryId


export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [originalTableData, setOriginalTableData] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [fetchedZoneId, setFetchedZoneId] = useState(null); 
  const [fetchedRegionId, setFetchedRegionId] = useState(null);
  const { currentUser } = useAuth(); 

  const allPossibleTabs = ['city', 'zone', 'region', 'country'];

  const tabsToDisplay = React.useMemo(() => {
    if (currentUser) {
      if (currentUser.role === 2) { // Zone Admin: Can see country, region, zone
        return allPossibleTabs.filter(tab => tab !== 'city'); // Hides city
      } else if (currentUser.role === 3) { // Region Admin: Can see country, region
        return allPossibleTabs.filter(tab => tab !== 'city' && tab !== 'zone');
      }
      else if (currentUser.role === 4) {
        return allPossibleTabs.filter(tab => tab === 'country');
      }
    }
    return allPossibleTabs; 
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState(''); 

  useEffect(() => {
    // This effect ensures that activeTab is always valid based on tabsToDisplay.
    // It sets an initial tab or updates it if the current one becomes invalid (e.g., due to role change).
    if (tabsToDisplay.length > 0) {
      if (!activeTab || !tabsToDisplay.includes(activeTab)) {
        // Set to the first available tab (which is the highest priority due to allPossibleTabs order)
        setActiveTab(tabsToDisplay[0]);
      }
    } else if (activeTab !== '') {
      // No tabs are displayable, so clear activeTab
      setActiveTab('');
    }
  }, [tabsToDisplay, activeTab]);

  const townId = currentUser?.townId;
  const policeStationID = currentUser?.policeStationID;

  // useEffect to fetch zoneId and regionId based on townId
  useEffect(() => {
    const fetchTownSpecificInfo = async () => {
      if (townId) { // Only run if townId is available
        try {
          const response = await fetch(`http://localhost:3004/api/country/specificTownInfo/${townId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for town info`);
          }
          const data = await response.json();
          if (data.town && data.town.length > 0) {
            const townInfo = data.town[0];
            setFetchedZoneId(townInfo.zoneId);
            setFetchedRegionId(townInfo.regionId);
          } else {
            console.error("Town info not found or empty array in response:", data);
            setFetchedZoneId(null);
            setFetchedRegionId(null);
          }
        } catch (error) {
          console.error("Failed to fetch town specific info:", error);
          setFetchedZoneId(null);
          setFetchedRegionId(null);
        }
      }
    };

    fetchTownSpecificInfo();
  }, [townId]); 

  // useEffect to fetch data for the active tab
  useEffect(() => {
    const fetchDataForTab = async () => {
      setSearchQuery(''); 
      setTableData([]); 
      setOriginalTableData([]); 

      if (activeTab === 'city') {
        if (!townId) {
          console.log("Town ID not available for city tab. Waiting for currentUser to load.");
          return;
        }
        try {
          const response = await fetch('http://localhost:3004/api/post/city', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ townId: townId }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const transformedData = data.posts.map(post => ({
            id: `CITY-${post.postId}`, // Use postId as part of the ID
            fname: post.firstName,
            lname: post.lastName,
            mname: post.middleName,
            date: new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: '2-digit', day: '2-digit',
            }),
            postState: post.postStatus === 0 ? 'active' : 'inactive', 
            personState: post.personStatus,
            picture: post.imagePath || '', // Stored imagePath
            originalPost: post, // Keep original post data if needed for details
          }));
          setTableData(transformedData);
          setOriginalTableData(transformedData);
        } catch (error) {
          console.error("Failed to fetch city data:", error);
          setTableData([]);
          setOriginalTableData([]);
        }
      } else if (activeTab === 'zone') {
        if (fetchedZoneId === null) {
          console.log("Zone ID not yet fetched or unavailable for zone tab.");
          return; // Don't fetch if fetchedZoneId is missing
        }
        try {
          const response = await fetch('http://localhost:3004/api/post/zone', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zoneId: fetchedZoneId }), // Use fetchedZoneId
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const transformedData = data.posts.map(post => ({
            id: `ZONE-${post.postId}`, // Use postId as part of the ID
            fname: post.firstName,
            lname: post.lastName,
            mname: post.middleName,
            date: new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: '2-digit', day: '2-digit',
            }),
            postState: post.postStatus === 5 ? 'active' : 'inactive', // Assuming 5 means active
            personState: post.personStatus,
            picture: post.imagePath || '', // Store imagePath
            originalPost: post, // Keep original post data if needed for details
          }));
          setTableData(transformedData);
          setOriginalTableData(transformedData);
        } catch (error) {
          console.error("Failed to fetch zone data:", error);
          setTableData([]);
          setOriginalTableData([]);
        }
      } else if (activeTab === 'region') {
        if (fetchedRegionId === null) {
          console.log("Region ID not yet fetched or unavailable for region tab.");
          return; // Don't fetch if fetchedRegionId is missing
        }
        try {
          const response = await fetch('http://localhost:3004/api/post/region', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ regionId: fetchedRegionId }), // Use fetchedRegionId
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const transformedData = data.posts.map(post => ({
            id: `REGION-${post.postId}`, // Use postId as part of the ID
            fname: post.firstName,
            lname: post.lastName,
            mname: post.middleName,
            date: new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: '2-digit', day: '2-digit',
            }),
            postState: post.postStatus === 0 ? 'active' : 'inactive', // Assuming 5 means active, adjust if needed
            personState: post.personStatus,
            picture: post.imagePath || '', // Store imagePath
            originalPost: post, // Keep original post data if needed for details
          }));
          setTableData(transformedData);
          setOriginalTableData(transformedData);
        } catch (error) {
          console.error("Failed to fetch region data:", error);
          setTableData([]);
          setOriginalTableData([]);
        }
      } else if (activeTab === 'country') {
        // Fetch data for the country tab
        // This typically doesn't depend on townId, fetchedZoneId, or fetchedRegionId
        try {
          const response = await fetch('http://localhost:3004/api/post/country', { // Assuming this is the endpoint for all country posts
            method: 'POST', // Or 'GET' if your backend is set up that way
            headers: {
              'Content-Type': 'application/json',
            },
             body: JSON.stringify({ countryId: COUNTRY_ID }), // Send countryId in the body
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for country data`);
          }
          const data = await response.json();
          const transformedData = data.posts.map(post => ({
            id: `COUNTRY-${post.postId}`,
            fname: post.firstName,
            lname: post.lastName,
            mname: post.middleName,
            date: new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: '2-digit', day: '2-digit',
            }),
            postState: post.postStatus === 1 ? 'active' : 'inactive', // Assuming 1 is active for country posts based on example
            personState: post.personStatus,
            picture: post.imagePath || '',
            originalPost: post,
            sourceTab: 'country', // Add sourceTab to identify the origin for PostDetailPopup
          }));
          setTableData(transformedData);
          setOriginalTableData(transformedData);
        } catch (error) {
          console.error("Failed to fetch country data:", error);
          setTableData([]);
          setOriginalTableData([]);
        }
      } 
    };

    fetchDataForTab();
  }, [activeTab, townId, fetchedZoneId, fetchedRegionId]); // Dependencies remain appropriate

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setTableData(originalTableData); // Reset to original data for the tab
      return;
    }

    const filtered = originalTableData.filter(row =>
      (row.id?.toString().toLowerCase() || '').includes(query) ||
      (row.fname?.toLowerCase() || '').includes(query) ||
      (row.lname?.toLowerCase() || '').includes(query) ||
      (row.mname?.toLowerCase() || '').includes(query) ||
      (row.personState?.toLowerCase() || '').includes(query)
    );

    setTableData(filtered);
  };

  const handleViewDetail = (post) => {
    setSelectedPostForDetail(post);
    setShowDetailPopup(true);
    console.log('View Detail:', post.id, post.originalPost);
  };

  // Handler for the "Report" button in the table row
  const handleReportPostFromTable = (post) => {
    setPostToReport(post);
    setShowReportPopup(true);
    console.log('Report Post from table:', post.id, post.originalPost);
  };

  // Handler for the "Report This Post" button in PostDetailPopup
  const handleShowReportPopupFromDetail = (post) => {
    setPostToReport(post); // Set the post to be reported
    // setShowDetailPopup(false); // Optionally close detail popup, or let ReportPopup overlay
    setShowReportPopup(true); // Show the report popup
  };

  const handleReportSubmitSuccess = (message) => {
    setToastMessage(message);
    setToastType('success');
    setShowReportPopup(false); // Close report popup
    setPostToReport(null); // Clear the post to report
  };
  const handleReportSubmitError = (message) => {
    setToastMessage(message);
    setToastType('error');
    // ReportPopup will display its own error, but toast can be an additional feedback
  };

  const getTableTitle = () => {
    switch (activeTab) {
      case 'city': return 'City Post Table';
      case 'zone': return 'Zone Post Table';
      case 'region': return 'Region Post Table';
      case 'country': return 'Country Post Table';
      default: return 'Post Table';
    }
  };

  return (
    <div className="space-y-6 p-6 dark:bg-gray-900 dark:text-white min-h-screen" >
      <div className="bg-blue-50 p-4 rounded-lg dark:bg-gray-800">
        <h2 className="text-lg font-medium">
          {currentUser && currentUser.firstName && currentUser.middleName
            ? `WELCOME ${currentUser.firstName.toUpperCase()} ${currentUser.middleName.toUpperCase()}`
            : "WELCOME Guest"}
        </h2>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-6">
          {currentUser && currentUser.nameOfPoliceStation
            ? currentUser.nameOfPoliceStation.toUpperCase()
            : "POLICE COMMISSION"} {/* Fallback if nameOfPoliceStation is not available */}
        </h1>

        <div className="flex space-x-1 mb-6">
          {tabsToDisplay.map((tabName) => (
            <button
              key={tabName}
              className={`flex-1 py-3 px-4 capitalize transition-all rounded ${
                activeTab === tabName
                  ? 'bg-white font-semibold dark:bg-gray-700'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
              onClick={() => setActiveTab(tabName)}
            >
              {tabName} Post
            </button>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">{getTableTitle()}</h2>

        <div className="mb-4">
          <Input
            placeholder={`Search ${activeTab} posts by ID, name, or person state...`}
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-full"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          {tableData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No {activeTab} posts found
            </div>
          ) : (
            <table className="w-full text-sm min-w-[800px]"> {/* Added min-width for better responsiveness on small screens */}
              <thead className="bg-gray-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">POST ID</th>
                  <th className="px-4 py-3 text-left">FNAME</th>
                  <th className="px-4 py-3 text-left">LNAME</th>
                  <th className="px-4 py-3 text-left">MNAME</th>
                  <th className="px-4 py-3 text-left">DATE</th>
                  <th className="px-4 py-3 text-left">POST STATE</th>
                  <th className="px-4 py-3 text-left">PERSON STATE</th>
                  <th className="px-4 py-3 text-left">PICTURE</th>
                  <th className="px-4 py-3 text-left">ACTION</th>
                </tr>
              </thead>
              <tbody>
  {tableData.map((row) => (
    <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="px-4 py-3"> {/* Display original postId */}
        {(activeTab === 'city' || activeTab === 'zone' || activeTab === 'region' || activeTab === 'country') && row.originalPost
          ? row.originalPost.postId
          : row.id
        }

      </td>
      <td className="px-4 py-3">{row.fname}</td>
      <td className="px-4 py-3">{row.lname}</td>
      <td className="px-4 py-3">{row.mname}</td>
      <td className="px-4 py-3">{row.date}</td>
      <td className="px-4 py-3">
        <span className={`inline-block w-3 h-3 rounded-full ${row.postState === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </td>
      <td className={`px-4 py-3 ${row.personState === 'CRIMINAL' ? 'text-red-600 font-semibold' : ''}`}>
        {row.personState}
      </td>
      <td className="px-4 py-3">
        {/* Simplified image display logic */}
        {row.picture ? (
          <img
            src={`${IMAGE_BASE_URL}${row.picture}`} // Use full path with base URL
            alt={`Post by ${row.fname}`}
            className="w-10 h-10 rounded-full object-cover"
            
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span>👤</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="text-blue-600 hover:underline text-sm"
          >
            View
          </button>
          <button
            onClick={() => handleReportPostFromTable(row)}
            className="text-red-600 hover:underline text-sm"
          >
            Report
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          )}
        </div>
       
        {showDetailPopup && selectedPostForDetail && (
          <PostDetailPopup
            post={selectedPostForDetail}
            onClose={() => setShowDetailPopup(false)}
            
            onReportClick={handleShowReportPopupFromDetail} // Pass the handler
          />
        )}
        {showReportPopup && postToReport && (
          <ReportPopup
            post={postToReport}
            currentUser={currentUser}
            onClose={() => {
              setShowReportPopup(false);
              setPostToReport(null);
            }}
            onSubmitSuccess={handleReportSubmitSuccess}
            onSubmitError={handleReportSubmitError}
          />
        )}

        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />

        
      </div>
            
    </div>

  );
}
