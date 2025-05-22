import { useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Building } from "lucide-react";
import { useVendors } from "../../hooks/useVendors";
import VendorFormModal from "./VendorFormModal";
import { formatUserData } from "../../utils/userUtils";
import { useTranslation } from "react-i18next";

const VendorsTable = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const {
    vendors,
    loading,
    error,
    handleSearch,
    createVendor,
    updateVendor,
    deleteVendor,
    suspendVendor,
    activateVendor,
    refreshVendors
  } = useVendors();

  const handleCreateVendor = () => {
    setSelectedVendor(null);
    setModalOpen(true);
  };
  
  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  };
  
  const handleFormSubmit = async (vendorData, isEditing) => {
    try {
      if (isEditing) {
        await updateVendor(selectedVendor.id, vendorData);
      } else {
        await createVendor(vendorData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      handleSearch(term);
    }, 300);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await deleteVendor(vendorId);
      } catch (error) {
        console.error("Error deleting vendor:", error);
      }
    }
  };

  const handleToggleStatus = async (vendor) => {
    try {
      if (vendor.status === "Active" || vendor.is_active) {
        await suspendVendor(vendor.id);
      } else {
        await activateVendor(vendor.id);
      }
    } catch (error) {
      console.error("Error toggling vendor status:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshVendors();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">{t('vendors.vendorList')}</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder={t('vendors.searchPlaceholder')}
              className="bg-gray-300 mx-2 text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 text-black " size={18} />
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-black "
            title={t('common.refresh')}
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreateVendor}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title={t('vendors.addNewVendor')}
          >
            <Building size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-800 text-red-100 p-3 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('vendors.company')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('vendors.contactEmail')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('vendors.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('vendors.lastLogin')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('vendors.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-black">
                {t('common.loading')}
                </td>
              </tr>
            ) : vendors && vendors.length > 0 ? (
              vendors.map((apiVendor) => {
                const formattedVendor = formatUserData(apiVendor);
                return (
                  <motion.tr
                    key={formattedVendor.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                            {formattedVendor.name.charAt(0)}
                          </div>
                        </div>
                        <div className="mx-4">
                          <div className="text-sm font-medium text-black">{formattedVendor.name}</div>
                          {formattedVendor.company && (
                            <div className="text-xs text-gray-500">{formattedVendor.company}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{formattedVendor.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          formattedVendor.status === "Active"
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {formattedVendor.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {formattedVendor.last_login ? new Date(formattedVendor.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button 
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => handleEditVendor(formattedVendor)}
                      >
                        {t('common.edit')}
                      </button>
                      <button 
                        className="text-yellow-500 hover:text-yellow-400 mx-2"
                        onClick={() => handleToggleStatus(formattedVendor)}
                      >
                        {formattedVendor.status === "Active" ? t('vendors.suspend') : 
                          t('vendors.activate')}
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300" 
                        onClick={() => handleDeleteVendor(formattedVendor.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-black">
                {t('vendors.noVendorsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <VendorFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        vendor={selectedVendor}
      />
    </motion.div>
  );
};

export default VendorsTable;