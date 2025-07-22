import React, { useState } from 'react';

const SUB_CITY_ID = 1;

const ReportPopup = ({ post, onClose, onSubmitSuccess, onSubmitError,currentUser }) => {
  const [reportDescription, setReportDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // Default priority
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Derive these values from props. Using useState for them is unnecessary
  // as they are not changed within this component, and calling a setter
  // in the render body causes an infinite loop.
  const policeStationId = currentUser?.policeStationId || '';
  const townId = currentUser?.townId;

  if (!post || !post.originalPost) {
    // Should not happen if managed correctly, but good for safety
    console.error("ReportPopup: Post data is missing.");
    return null;
  }
  const { postId } = post.originalPost;
  
  const priorityMap = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!reportDescription.trim()) {
        setError('Report description is required.');
        setIsLoading(false);
        return;
    }
    if (!policeStationId) {
        setError('Police Station ID is required.');
        setIsLoading(false);
        return;
    }
    if (!townId) {
      setError('User town information is missing.');
      setIsLoading(false);
      return;
    }

    const reportData = {
      postId: postId,
      townId: townId,
      subCityId: SUB_CITY_ID,
      reportDescription: reportDescription,
      PoliceStationId: policeStationId, // Case sensitive as per your API spec
      priority: priorityMap[priority],
    };

    try {
      const response = await fetch('http://localhost:3004/api/report/addReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result.message || "Report submitted successfully!");
      }
      onClose(); // Close popup on success
    } catch (err) {
      console.error("Failed to submit report:", err);
      const errorMessage = err.message || "Failed to submit report. Please try again.";
      setError(errorMessage);
      if (onSubmitError) {
        onSubmitError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]"> {/* Higher z-index */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-lg w-full transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fadeInScale">
        <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Submit Report (Post ID: {postId})</h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-semibold"
            aria-label="Close report popup"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              required
              rows="4"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="Provide details about the report..."
            />
          </div>
          <div>
            <label htmlFor="policeStationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Police Station ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="policeStationId"
              value={policeStationId}
              disabled
              required
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder={policeStationId}
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
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
    </div>
  );
};

export default ReportPopup;
