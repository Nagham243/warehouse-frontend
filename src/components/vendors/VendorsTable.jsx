import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, CheckCircle, X, FileText, RefreshCw } from "lucide-react";
import { useTranslation } from 'react-i18next';
import api from "../../services/api";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const VendorsTable = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [classification, setClassification] = useState("");
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingClassification, setIsUpdatingClassification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const vendorsResponse = await api.get("/vendors/");
        setVendors(vendorsResponse.data);
        setFilteredVendors(vendorsResponse.data);
        
        const classificationsResponse = await api.get("/vendors/classification_choices/");
        setClassificationOptions(Object.keys(classificationsResponse.data));
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error.response 
          ? `Failed to fetch data: ${error.response.status} ${error.response.statusText}`
          : `Failed to fetch data: ${error.message}`;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    
    if (!vendors || vendors.length === 0) {
      setFilteredVendors([]);
      return;
    }
    
    const filtered = vendors.filter(
      (vendor) => 
        (vendor.business_name && vendor.business_name.toLowerCase().includes(term)) || 
        (vendor.business_registration_number && vendor.business_registration_number.toLowerCase().includes(term)) ||
        (vendor.business_email && vendor.business_email.toLowerCase().includes(term)) ||
        (vendor.user?.email && vendor.user.email.toLowerCase().includes(term))
    );
    
    setFilteredVendors(filtered);
  }, [searchTerm, vendors]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/vendors/");
      setVendors(response.data);
      setFilteredVendors(response.data);
    } catch (error) {
      const errorMessage = error.response 
        ? `Failed to refresh data: ${error.response.status} ${error.response.statusText}`
        : `Failed to refresh data: ${error.message}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (vendor) => {
    setCurrentVendor(vendor);
    setClassification(vendor.classification || "");
    setShowVerifyModal(true);
  };

  const closeModal = () => {
    setShowVerifyModal(false);
    setCurrentVendor(null);
  };

  const getCsrfToken = () => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (!token) {
    console.warn("CSRF token not found in cookies.");
  }

  return token;
};


  const handleVerify = async () => {
    if (!currentVendor) return;
    
    setIsVerifying(true);
    try {
      const response = await api.post(
        `/vendors/${currentVendor.id}/verify/`, 
        {
          is_verified: true,
          classification: classification
        },
        {
          headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": getCsrfToken(), 
          }
        }
      );
      
      const updatedVendor = response.data;
      
      setVendors(prevVendors => 
        prevVendors.map(vendor => 
          vendor.id === currentVendor.id ? updatedVendor : vendor
        )
      );
      
      closeModal();
    } catch (error) {
      console.error("Error verifying vendor:", error);
      if (error.response?.status === 403) {
        alert("You don't have permission to perform this action.");
      } else {
        alert(`Failed to verify vendor: ${error.message}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClassificationChange = async (vendorId, newClassification) => {
    setIsUpdatingClassification(vendorId);
    try {
      const response = await api.post(
        `/vendors/${vendorId}/change_classification/`, 
        { classification: newClassification },
        {
          headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": getCsrfToken(), 
          },
          withCredentials: true,
        }
      );
      
      const updatedVendor = response.data;
      
      setVendors(prevVendors => 
        prevVendors.map(vendor => 
          vendor.id === vendorId ? updatedVendor : vendor
        )
      );
    } catch (error) {
      console.error("Error changing classification:", error);
      alert(`Failed to update classification: ${error.message}`);
    } finally {
      setIsUpdatingClassification(null);
    }
  };

  const formatClassificationName = (classification) => {
    if (!classification) return "N/A";
    
    return classification
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
        <p className="font-bold">Error loading vendors</p>
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-medium py-1 px-3 rounded flex items-center"
          onClick={handleRefresh}
        >
          <RefreshCw className="mr-1" size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">{t('vendors.vendorList')}</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-lg"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder={t('vendors.searchPlaceholder')}
                className="bg-gray-300 text-black placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
                disabled={loading}
              />
              <Search className="absolute left-3 top-2.5 text-black" size={18} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="animate-spin mr-2" size={24} />
            <p className="text-lg">{t('common.loading')}</p>
          </div>
        ) : filteredVendors && filteredVendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {t('vendors.businessName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {t('vendors.registrationNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {t('vendors.contactEmail')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {t('vendors.classification')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {t('vendors.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {t('vendors.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide divide-gray-300">
                {filteredVendors.map((vendor) => (
                  <motion.tr
                    key={vendor.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {vendor.business_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {vendor.business_registration_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {vendor.email || vendor.user?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {isUpdatingClassification === vendor.id ? (
                        <div className="flex items-center">
                          <RefreshCw className="animate-spin mr-2" size={16} />
                          <span>{t('common.updating')}</span>
                        </div>
                      ) : (
                        <select
                          className="bg-gray-300 text-sm rounded border border-gray-400 p-1"
                          value={vendor.classification || ""}
                          onChange={(e) => handleClassificationChange(vendor.id, e.target.value)}
                          disabled={!vendor.is_verified}
                        >
                          <option value="">Not Classified</option>
                          {classificationOptions.map((option) => (
                            <option key={option} value={option}>
                              {formatClassificationName(option)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vendor.is_verified ? "Verified" : "Pending Verification"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                        onClick={() => handleViewDetails(vendor)}
                        disabled={loading}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">{t('vendors.noVendorsFound')}</p>
          </div>
        )}
      </motion.div>

      {/* Vendor Verification Modal */}
      {showVerifyModal && currentVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-xl mx-auto p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{t('vendors.vendorDetails')}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={isVerifying}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('vendors.businessName')}</p>
                <p className="text-base font-semibold text-black">{currentVendor.business_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('vendors.registrationNumber')}</p>
                <p className="text-base font-semibold text-black">{currentVendor.business_registration_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('users.email')}</p>
                <p className="text-base font-semibold text-black">{currentVendor.email || currentVendor.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('vendors.phone')}</p>
                <p className="text-base font-semibold text-black">{currentVendor.phone_number || "N/A"}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-2">{t('vendors.classification')}</p>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                value={classification || ""}
                onChange={(e) => setClassification(e.target.value)}
                disabled={isVerifying}
              >
                <option value="">{t('vendors.selectClassification')}</option>
                {classificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatClassificationName(option)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">{t('vendors.documents')}</p>
            <div className="flex flex-wrap gap-4">
              {currentVendor.trade_license ? (
                <a 
                  href={currentVendor.trade_license} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border text-black border-gray-200 rounded p-3 flex items-center hover:bg-gray-50"
                >
                  <FileText className="text-blue-500 mr-2" size={20} />
                  <span>{t('vendors.tradeLicense')}</span>
                </a>
              ) : null}
              {currentVendor.tax_certificate ? (
                <a 
                  href={currentVendor.tax_certificate} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border text-black border-gray-200 rounded p-3 flex items-center hover:bg-gray-50"
                >
                  <FileText className="text-green-500 mr-2" size={20} />
                  <span>{t('vendors.taxCertificate')}</span>
                </a>
              ) : null}
              {currentVendor.business_registration_document ? (
                <a 
                  href={currentVendor.business_registration_document} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border text-black border-gray-200 rounded p-3 flex items-center hover:bg-gray-50"
                >
                  <FileText className="text-red-500 mr-2" size={20} />
                  <span>{t('vendors.businessRegistration')}</span>
                </a>
              ) : null}
              {!currentVendor.trade_license && !currentVendor.tax_certificate && !currentVendor.business_registration_document && (
                <p className="text-gray-500">{t('vendors.noDocuments')}</p>
              )}
            </div>
          </div>
            
            <div className="flex justify-end gap-4">
              {!currentVendor.is_verified && (
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !classification}
                  className={`${
                    isVerifying || !classification 
                      ? 'bg-green-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white font-medium py-2 px-4 rounded inline-flex items-center`}
                >
                  {isVerifying ? (
                    <RefreshCw className="animate-spin mr-2" size={18} />
                  ) : (
                    <CheckCircle className="mr-2" size={18} />
                  )}
                  {isVerifying ? t('vendors.verifying') : t('vendors.verifyVendor')}
                </button>
              )}
              {currentVendor.is_verified && (
                <div className="bg-green-100 text-green-800 font-medium py-2 px-4 rounded inline-flex items-center">
                  <CheckCircle className="mr-2" size={18} />
                  {t('vendors.vendorVerified')}
                </div>
              )}
              <button
                onClick={closeModal}
                disabled={isVerifying}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorsTable;
