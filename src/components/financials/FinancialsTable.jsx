import { useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, UserPlus } from "lucide-react";
import { useFinancials } from "../../hooks/useFinancials";
import FinancialFormModal from "./FinancialFormModal";
import { formatUserData } from "../../utils/userUtils";
import { useTranslation } from "react-i18next";

const FinancialsTable = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFinancial, setSelectedFinancial] = useState(null);
  const {
    financials,
    loading,
    error,
    handleSearch,
    createFinancial,
    updateFinancial,
    deleteFinancial,
    suspendFinancial,
    activateFinancial,
    refreshFinancials
  } = useFinancials();

  const handleCreateFinancial = () => {
    setSelectedFinancial(null);
    setModalOpen(true);
  };
  
  const handleEditFinancial = (financial) => {
    setSelectedFinancial(financial);
    setModalOpen(true);
  };
  
  const handleFormSubmit = async (financialData, isEditing) => {
    try {
      if (isEditing) {
        await updateFinancial(selectedFinancial.id, financialData);
      } else {
        await createFinancial(financialData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving financial user:", error);
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

  const handleDeleteFinancial = async (financialId) => {
    if (window.confirm("Are you sure you want to delete this financial user?")) {
      try {
        await deleteFinancial(financialId);
      } catch (error) {
        console.error("Error deleting financial user:", error);
      }
    }
  };

  const handleToggleStatus = async (financial) => {
    try {
      if (financial.status === "Active" || financial.is_active) {
        await suspendFinancial(financial.id);
      } else {
        await activateFinancial(financial.id);
      }
    } catch (error) {
      console.error("Error toggling financial user status:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshFinancials();
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
        <h2 className="text-xl font-semibold text-black">{t('financials.title')}</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder={t('financials.searchPlaceholder')}
              className="bg-gray-300 mx-2 text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 text-black" size={18} />
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-black"
            title={t('common.refresh')}
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreateFinancial}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title={t('financials.addNewFinancial')}
          >
            <UserPlus size={18} />
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
              {t('financials.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('financials.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('financials.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('financials.lastLogin')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('financials.actions')}
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
            ) : financials && financials.length > 0 ? (
              financials.map((apiFinancial) => {
                const formattedFinancial = formatUserData(apiFinancial);
                return (
                  <motion.tr
                    key={formattedFinancial.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {formattedFinancial.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-black mx-2">{formattedFinancial.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{formattedFinancial.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          formattedFinancial.status === "Active"
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {formattedFinancial.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {formattedFinancial.last_login ? new Date(formattedFinancial.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button 
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => handleEditFinancial(formattedFinancial)}
                      >
                        {t('common.edit')}
                      </button>
                      <button 
                        className="text-yellow-500 hover:text-yellow-400 mx-2"
                        onClick={() => handleToggleStatus(formattedFinancial)}
                      >
                        {formattedFinancial.status === "Active" ? t('financials.suspend') : 
                          t('financials.activate')}
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300" 
                        onClick={() => handleDeleteFinancial(formattedFinancial.id)}
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
                {t('financials.noFinancialsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <FinancialFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        financial={selectedFinancial}
      />
    </motion.div>
  );
};

export default FinancialsTable;