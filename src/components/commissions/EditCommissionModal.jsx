import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { updateCommission } from '../CommissionManager.js';

const EditCommissionModal = ({ isOpen, onClose, classification, currentPercentage, onSave }) => {
  const { t } = useTranslation();
  const [percentage, setPercentage] = useState(parseFloat(currentPercentage) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && currentPercentage !== undefined && currentPercentage !== null) {
      setPercentage(parseFloat(currentPercentage) || 0);
      setError(null); // Clear any previous errors when modal opens
    }
  }, [isOpen, currentPercentage]);

  if (!isOpen) return null;

  const csrftoken = getCookie('csrftoken');
  fetch(url, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(data)
  });

  // Enhanced CSRF token retrieval with multiple fallback methods
  const getCSRFToken = () => {
    try {
      // Method 1: Check meta tag (recommended Django setup)
      const metaToken = document.querySelector('meta[name="csrf-token"]');
      if (metaToken && metaToken.getAttribute('content')) {
        return metaToken.getAttribute('content');
      }
      
      // Method 2: Check Django's default meta tag
      const djangoMeta = document.querySelector('meta[name="csrf_token"]');
      if (djangoMeta && djangoMeta.getAttribute('content')) {
        return djangoMeta.getAttribute('content');
      }
      
      // Method 3: Get from cookies with multiple possible names
      const cookieNames = ['csrftoken', 'csrfmiddlewaretoken', 'csrf_token'];
      const decodedCookie = decodeURIComponent(document.cookie);
      
      for (const cookieName of cookieNames) {
        const name = `${cookieName}=`;
        const cookieArray = decodedCookie.split(';');
        
        for (let i = 0; i < cookieArray.length; i++) {
          let cookie = cookieArray[i].trim();
          if (cookie.indexOf(name) === 0) {
            const token = cookie.substring(name.length);
            if (token && token !== '') {
              return token;
            }
          }
        }
      }
      
      // Method 4: Check if there's a global CSRF token variable
      if (window.csrf_token) {
        return window.csrf_token;
      }
      
      console.warn('No CSRF token found. This may cause authentication issues.');
      return '';
    } catch (error) {
      console.error('Error retrieving CSRF token:', error);
      return '';
    }
  };

  // Create axios instance with comprehensive configuration
  const createAxiosInstance = () => {
    const csrfToken = getCSRFToken();
    const baseURL = import.meta.env.VITE_API_URL || '';
    
    console.log('Creating axios instance with CSRF token:', csrfToken ? 'Found' : 'Not found');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
      headers['X-CSRF-TOKEN'] = csrfToken; // Alternative header name
    }
    
    return axios.create({
      baseURL,
      withCredentials: true,
      timeout: 30000, // 30 seconds
      headers,
      // Ensure cookies are sent with requests
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'X-CSRFToken'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate input
      if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }

      if (!classification) {
        throw new Error('Classification is required');
      }

      const axiosInstance = createAxiosInstance();
      
      console.log('Submitting commission update:', {
        classification,
        percentage,
        currentPercentage
      });

      // Step 1: Get all commissions
      let allCommissionsResponse;
      try {
        allCommissionsResponse = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/commissions/`, {
          params: { commission_type: 'vendor_type' }
        });
      } catch (fetchError) {
        console.error('Error fetching commissions:', fetchError);
        
        if (fetchError.response?.status === 401 || fetchError.response?.status === 403) {
          throw new Error('Your session has expired. Please refresh the page and log in again.');
        }
        throw new Error('Failed to fetch commission data. Please try again.');
      }

      // Step 2: Process response data
      const responseData = allCommissionsResponse.data;
      let commissions = [];
      
      if (Array.isArray(responseData)) {
        commissions = responseData;
      } else if (responseData && Array.isArray(responseData.results)) {
        commissions = responseData.results;
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        commissions = responseData.data;
      } else {
        console.error('Unexpected commission data structure:', responseData);
        throw new Error('Invalid response format from server');
      }

      console.log('Retrieved commissions:', commissions);

      // Step 3: Find the specific commission
      const targetClassification = classification.toLowerCase().trim();
      const commission = commissions.find(comm => {
        if (!comm || !comm.details) return false;
        
        const commClassification = comm.details.vendor_classification;
        if (!commClassification) return false;
        
        return commClassification.toLowerCase().trim() === targetClassification;
      });

      if (!commission) {
        console.error('Available commissions:', commissions.map(c => ({
          id: c.id,
          classification: c.details?.vendor_classification,
          percentage: c.percentage
        })));
        throw new Error(`No commission found for "${classification}" classification. Please check if this classification exists.`);
      }

      console.log('Found commission to update:', commission);

      // Step 4: Update the commission
      const updatePayload = {
        percentage: parseFloat(percentage)
      };

      console.log('Attempting to update commission:', {
        id: commission.id,
        url: `${import.meta.env.VITE_API_URL}/api/commissions/${commission.id}/`,
        payload: updatePayload,
        currentData: commission
      });

      // Try the update with additional headers that might be required
      const updateConfig = {
        params: { commission_type: 'vendor_type' },
        headers: {
          ...axiosInstance.defaults.headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Add referer header which some Django setups require
      if (window.location) {
        updateConfig.headers['Referer'] = window.location.href;
      }

      const updateResponse = await axiosInstance.patch(
        `${import.meta.env.VITE_API_URL}/api/commissions/${commission.id}/`,
        updatePayload,
        updateConfig
      );

      // Step 5: Handle success
      if (updateResponse.status >= 200 && updateResponse.status < 300) {
        console.log("Commission successfully updated:", updateResponse.data);
        
        // Call the onSave callback with the updated data
        if (typeof onSave === 'function') {
          onSave(targetClassification, parseFloat(percentage));
        }
        
        // Close the modal
        onClose();
      } else {
        throw new Error(`Unexpected response status: ${updateResponse.status}`);
      }

    } catch (err) {
      console.error("Error updating commission:", err);
      
      let errorMessage = "An unexpected error occurred while updating the commission.";

      if (err.message && (
        err.message.includes('session has expired') || 
        err.message.includes('Authentication required') ||
        err.message.includes('Percentage must be between') ||
        err.message.includes('Classification is required') ||
        err.message.includes('No commission found') ||
        err.message.includes('Failed to fetch commission data')
      )) {
        errorMessage = err.message;
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.log("Error response:", { status, data });
        
        switch (status) {
          case 400:
            errorMessage = data?.detail || data?.error || "Invalid request. Please check your input.";
            break;
          case 401:
            errorMessage = "Your session has expired. Please refresh the page and log in again.";
            break;
          case 403:
            console.log('403 Error details:', {
              url: err.config?.url,
              method: err.config?.method,
              headers: err.config?.headers,
              data: data
            });
            
            if (data?.code === "auth_required" || 
                data?.error?.includes("Authentication") ||
                data?.message?.includes("Authentication") ||
                data?.detail?.includes("Authentication")) {
              errorMessage = "Authentication required. Please refresh the page and log in again.";
            } else if (data?.detail?.includes("CSRF") || data?.error?.includes("CSRF")) {
              errorMessage = "Security token error. Please refresh the page and try again.";
            } else if (data?.detail?.includes("permission") || data?.error?.includes("permission")) {
              errorMessage = "You don't have permission to modify commission rates. Please contact an administrator.";
            } else if (data?.detail?.includes("method") || data?.error?.includes("method")) {
              errorMessage = "Invalid request method. The server doesn't allow this type of update.";
            } else {
              // Provide more specific error message for commission updates
              const baseMessage = data?.detail || data?.error || data?.message || "Access denied";
              errorMessage = `${baseMessage}. This might be due to: insufficient permissions, incorrect user role, or server configuration. Please contact your administrator.`;
            }
            break;
          case 404:
            errorMessage = "Commission not found. The data may have been deleted or moved.";
            break;
          case 422:
            errorMessage = data?.detail || data?.error || "Invalid data provided. Please check your input.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later or contact support.";
            break;
          default:
            errorMessage = data?.error || data?.detail || data?.message || `Server error (${status}). Please try again.`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your internet connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageChange = (e) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    
    // Allow empty string or valid numbers
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
      setPercentage(value === '' ? 0 : numValue);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-black text-lg font-medium">
            Edit {classification} Commission
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            disabled={isSubmitting}
            type="button"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
              {t('commissions.percentageLabel', 'Commission Percentage (%)')}
            </label>
            <input
              type="number"
              id="percentage"
              min="0"
              max="100"
              step="0.01"
              value={percentage}
              onChange={handlePercentageChange}
              className="text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              required
              disabled={isSubmitting}
              placeholder="Enter percentage (0-100)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Default {classification} commission is {getDefaultRate(classification)}%
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || percentage < 0 || percentage > 100}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving', 'Saving...')}
                </>
              ) : (
                t('common.saveChanges', 'Save Changes')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getDefaultRate(classification) {
  const DEFAULT_RATES = {
    'bronze': 20.00,
    'silver': 15.00,
    'gold': 10.00,
    'platinum': 5.00,
    'special': 'Custom'
  };
  
  return DEFAULT_RATES[classification?.toLowerCase()] || 'Custom';
}

export default EditCommissionModal;
