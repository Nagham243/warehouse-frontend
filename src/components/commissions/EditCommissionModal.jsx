import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const EditCommissionModal = ({ isOpen, onClose, classification, currentPercentage, onSave }) => {
  const { t, i18n } = useTranslation();
  const [percentage, setPercentage] = useState(parseFloat(currentPercentage) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && currentPercentage) {
      setPercentage(parseFloat(currentPercentage) || 0);
    }
  }, [isOpen, currentPercentage]);

  if (!isOpen) return null;

  // Improved CSRF token retrieval
  const getCSRFToken = () => {
    // Try multiple methods to get CSRF token
    
    // Method 1: Check meta tag (common Django setup)
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken) {
      return metaToken.getAttribute('content');
    }
    
    // Method 2: Check cookies
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    
    // Method 3: Try alternative cookie names
    const altNames = ['csrfmiddlewaretoken=', 'X-CSRFToken='];
    for (const altName of altNames) {
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(altName) === 0) {
          return cookie.substring(altName.length, cookie.length);
        }
      }
    }
    
    return '';
  };

  // Create axios instance with better defaults
  const createAxiosInstance = () => {
    const csrfToken = getCSRFToken();
    
    return axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        // Try both common CSRF header names
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const axiosInstance = createAxiosInstance();
      
      // Add request interceptor for better error handling
      axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error('Axios interceptor caught error:', error);
          return Promise.reject(error);
        }
      );

      // First, verify authentication by making a simple GET request
      try {
        await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/auth/check/`); // Adjust this endpoint as needed
      } catch (authError) {
        if (authError.response?.status === 401 || authError.response?.status === 403) {
          throw new Error('Authentication required. Please refresh the page and log in again.');
        }
      }

      // Get all commissions
      const allCommissionsResponse = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/commissions/`, {
        params: { commission_type: 'vendor_type' }
      });

      const commissions = Array.isArray(allCommissionsResponse.data)
        ? allCommissionsResponse.data
        : allCommissionsResponse.data.results || [];

      // Find the specific commission
      const commission = commissions.find(comm => 
        comm.details?.vendor_classification?.toLowerCase() === classification.toLowerCase()
      );

      if (!commission) {
        throw new Error(`No commission found for ${classification} classification`);
      }

      // Update the commission
      const updatePayload = {
        percentage: percentage
      };

      console.log('Updating commission with payload:', updatePayload);
      console.log('Commission ID:', commission.id);

      const updateResponse = await axiosInstance.patch(
        `${import.meta.env.VITE_API_URL}/api/commissions/${commission.id}/`,
        updatePayload,
        {
          params: { commission_type: 'vendor_type' }
        }
      );

      // Success handling
      if (updateResponse.status >= 200 && updateResponse.status < 300) {
        console.log("Commission successfully updated:", updateResponse.data);
        onSave(classification.toLowerCase(), percentage);
        onClose();
      } else {
        throw new Error(`Unexpected response status: ${updateResponse.status}`);
      }

    } catch (err) {
      console.error("Error updating commission:", err);
      
      let errorMessage = "An unexpected error occurred.";

      if (err.message && err.message.includes('Authentication required')) {
        errorMessage = err.message;
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.log("Error response data:", data);
        console.log("Error response status:", status);
        
        switch (status) {
          case 401:
            errorMessage = "Your session has expired. Please refresh the page and log in again.";
            break;
          case 403:
            if (data?.code === "auth_required" || 
                data?.error === "Authentication required" ||
                data?.message?.includes("Authentication required")) {
              errorMessage = "Authentication required. Please refresh the page and log in again.";
            } else if (data?.detail?.includes("CSRF")) {
              errorMessage = "Security token error. Please refresh the page and try again.";
            } else if (data?.detail?.includes("permission")) {
              errorMessage = "You don't have permission to modify commission rates. Please contact an administrator.";
            } else {
              errorMessage = data?.detail || data?.error || data?.message || "Access denied. Please check your permissions.";
            }
            break;
          case 404:
            errorMessage = "Commission not found. The data may have been deleted or moved.";
            break;
          case 422:
            errorMessage = data?.detail || "Invalid data provided. Please check your input.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.error || data?.detail || data?.message || `Server error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-black text-lg font-medium">Edit {classification} Commission</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isSubmitting}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
              {t('commissions.percentageLabel')}
            </label>
            <input
              type="number"
              id="percentage"
              min="0"
              max="100"
              step="0.01"
              value={percentage}
              onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
              className="text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Default {classification} commission is {getDefaultRate(classification)}%
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white mx-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
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
  
  return DEFAULT_RATES[classification.toLowerCase()] || 'Custom';
}

export default EditCommissionModal;
