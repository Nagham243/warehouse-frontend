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

 
  const getCSRFToken = () => {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    
    const axiosInstance = axios.create({
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken(),  
        'Content-Type': 'application/json'
      }
    });

    try {
      
      const allCommissionsResponse = await axiosInstance.get('/api/commissions/', {
        params: { commission_type: 'vendor_type' }
      });

      const commissions = Array.isArray(allCommissionsResponse.data)
        ? allCommissionsResponse.data
        : allCommissionsResponse.data.results || [];

      
      const commission = commissions.find(comm => 
        comm.details?.vendor_classification?.toLowerCase() === classification.toLowerCase()
      );

      if (!commission) {
        throw new Error(`No commission found for ${classification} classification`);
      }

     
      const updateResponse = await axiosInstance.patch(`/api/commissions/${commission.id}/`, {
        percentage: percentage
      }, {
        params: { commission_type: 'vendor_type' }
      });

     
      if (updateResponse.status >= 200 && updateResponse.status < 300) {
        console.log("Commission successfully updated:", updateResponse.data);
        onSave(classification.toLowerCase(), percentage);
        onClose();
      } else {
        throw new Error("Server returned an unsuccessful status code");
      }
    } catch (err) {
      console.error("Error updating commission:", err);
      
      
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
        
        
        if (err.response.status === 403) {
          if (err.response.data?.code === "auth_required" || 
              err.response.data?.error === "Authentication required" ||
              err.response.data?.detail?.includes("CSRF")) {
            setError("Authentication error. Please try refreshing the page and logging in again.");
          } else if (err.response.data?.detail?.includes("permission")) {
            setError("You don't have permission to modify commission rates. Please contact an administrator.");
          } else {
            setError(err.response.data?.detail || "Access denied. Please check your permissions.");
          }
        } else {
z
          setError(
            err.response.data?.error || 
            err.response.data?.detail || 
            err.response.data?.message || 
            `Server error: ${err.response.status}`
          );
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(err.message || "Failed to send request.");
      }
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
