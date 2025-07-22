import React from 'react';

// Define the base URL for images, consistent with other components
const IMAGE_BASE_URL = 'http://localhost:3004/uploads/';

const PostDetailPopup = ({ post, onClose, onReportClick,t }) => {
  if (!post || !post.originalPost) {
    // If post or originalPost is not available, don't render anything or show a loading/error state
    return null; 
  }

  const {
    postId,
    townId,
    subCityId,
    postDescription,
    firstName,
    middleName,
    lastName,
    age,
    lastLocation,
    gender,
    policeOfficerId,
    policeStationId,
    postStatus, // You might want to map this to a human-readable string
    personStatus,
    imagePath,
    created_at,
    // Fields specific to country posts (and potentially others, ensure they exist or handle gracefully)
    townName,
    zoneName,
    regionName,
    policeOfficerFname,
    policeOfficerMname,
    policeOfficerLname,
    policeOfficerRoleName,
    nameOfPoliceStation
  } = post.originalPost;

  // Construct the image URL using the IMAGE_BASE_URL and the imagePath (filename)
  const imageUrl = imagePath ? `${IMAGE_BASE_URL}${imagePath}` : null;
  const sourceTab = post.sourceTab; // Get the sourceTab from the post prop

  const getPostStatusText = (status) => {
    // Example mapping, adjust based on your actual status codes
    if (status === 5) return "Active";
    if (status === 1) return "Resolved";
    if (status === 2) return "Pending";
    // Add other statuses as needed
    return `Unknown (${status})`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fadeInScale">
        <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Post Details <span className="text-blue-500">(ID: {postId})</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-semibold"
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {imageUrl && (
            <div className="md:col-span-1 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Image</h3>
              <img 
                src={imageUrl} 
                alt={`Image for post ${postId} by ${firstName}`} 
                className="w-full h-auto max-h-80 rounded-md object-contain border dark:border-gray-700 shadow-md"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevent looping
                  currentTarget.style.display = 'none'; // Hide if image not found
                  // Optionally, show a placeholder
                  const placeholder = document.createElement('div');
                  placeholder.textContent = 'Image not available';
                  placeholder.className = 'w-full h-40 flex items-center justify-center text-gray-500 border dark:border-gray-700 rounded-md';
                  currentTarget.parentNode.appendChild(placeholder);
                }}
              />
            </div>
          )}
          
          <div className={`md:col-span-${imageUrl ? '2' : '3'} space-y-3`}>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-700 pb-1">Information</h3>
            <DetailItem label="Full Name" value={`${firstName} ${middleName || ''} ${lastName}`} />
            <DetailItem label="Description" value={postDescription} isBlock={true} />
            <DetailItem label="Age" value={age ? parseFloat(age).toFixed(0) : 'N/A'} />
            <DetailItem label="Gender" value={gender} />
            <DetailItem label="Last Seen Location" value={lastLocation} />
            <DetailItem label="Person Status" value={personStatus} className={personStatus === 'CRIMINAL' ? 'text-red-500 font-bold' : personStatus === 'MISSING' ? 'text-yellow-500 font-bold' : ''} />
            <DetailItem label="Post Status" value={getPostStatusText(postStatus)} />
            <DetailItem label="Reported At" value={new Date(created_at).toLocaleString()} />

            {sourceTab === 'country' ? (
              <>
                <DetailItem label="Location" value={`${townName || 'N/A'}, ${zoneName || 'N/A'}, ${regionName || 'N/A'}`} isBlock={true}/>
                <DetailItem label="Reporting Officer" value={`${policeOfficerFname || ''} ${policeOfficerMname || ''} ${policeOfficerLname || ''} (${policeOfficerRoleName || 'N/A'})`} isBlock={true}/>
                <DetailItem label="Police Station" value={nameOfPoliceStation} />
              </>
            ) : (
              <>
                {/* Display these only if not a country post, or if they are relevant for other tabs */}
                {townId && <DetailItem label="Town ID" value={townId} />}
                {subCityId && <DetailItem label="SubCity ID" value={subCityId} />}
                {policeOfficerId && <DetailItem label="Officer ID" value={policeOfficerId} />}
                {policeStationId && <DetailItem label="Station ID" value={policeStationId} />}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3">
          {onReportClick && (
            <button
              onClick={() => onReportClick(post)} // Pass the current post data
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg w-full md:w-auto transition-colors duration-150"
            >
              Report This Post
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg w-full md:w-auto transition-colors duration-150"
          >
            Close
          </button>
        </div>
      </div>
      {/* Basic CSS for animation (add to your global CSS or a <style> tag if needed) */}
      <style jsx global>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const DetailItem = ({ label, value, isBlock = false, className = '' }) => (
  <div className={`text-sm ${isBlock ? 'flex flex-col' : 'grid grid-cols-2'}`}>
    <strong className="text-gray-600 dark:text-gray-400">{label}:</strong>
    <span className={`text-gray-800 dark:text-gray-200 ${className} ${isBlock ? 'mt-1' : ''}`}>{value || 'N/A'}</span>
  </div>
);

export default PostDetailPopup;