import { useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, UserPlus } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import ClientFormModal from "./ClientFormModal";
import { formatUserData } from "../../utils/userUtils";
import { useTranslation } from "react-i18next";

const ClientsTable = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const {
    clients,
    loading,
    error,
    handleSearch,
    createClient,
    updateClient,
    deleteClient,
    suspendClient,
    activateClient,
    refreshClients
  } = useClients();

  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };
  
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };
  
  const handleFormSubmit = async (clientData, isEditing) => {
    try {
      if (isEditing) {
        await updateClient(selectedClient.id, clientData);
      } else {
        await createClient(clientData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving client:", error);
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

  const handleDeleteClient = async (clientId) => {
    if (window.confirm(t('clients.confirmDelete'))) {
      try {
        await deleteClient(clientId);
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const handleToggleStatus = async (client) => {
    try {
      if (client.status === "Active" || client.is_active) {
        await suspendClient(client.id);
      } else {
        await activateClient(client.id);
      }
    } catch (error) {
      console.error("Error toggling client status:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshClients();
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
        <h2 className="text-xl font-semibold text-black">{t('clients.title')}</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder={t('clients.searchPlaceholder')}
              className="bg-gray-300 mx-2 text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 text-black" size={18} />
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-black "
            title={t('common.refresh')}
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreateClient}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title={t('clients.addNewClient')}
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
              {t('clients.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('clients.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('clients.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('clients.lastLogin')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              {t('clients.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-black">
                {t('clients.loadingClients')}
                </td>
              </tr>
            ) : clients && clients.length > 0 ? (
              clients.map((apiClient) => {
                const formattedClient = formatUserData(apiClient);
                return (
                  <motion.tr
                    key={formattedClient.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-green-500 flex items-center justify-center text-white font-semibold">
                            {formattedClient.name.charAt(0)}
                          </div>
                        </div>
                        <div className="mx-4">
                          <div className="text-sm font-medium text-black">{formattedClient.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{formattedClient.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          formattedClient.status === "Active"
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {formattedClient.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {formattedClient.last_login ? new Date(formattedClient.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button 
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => handleEditClient(formattedClient)}
                      >
                        {t('common.edit')}
                      </button>
                      <button 
                        className="text-yellow-500 hover:text-yellow-400 mx-2"
                        onClick={() => handleToggleStatus(formattedClient)}
                      >
                        {formattedClient.status === "Active" ? t('clients.suspend') : 
                          t('clients.activate')}
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300" 
                        onClick={() => handleDeleteClient(formattedClient.id)}
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
                {t('clients.noClientsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <ClientFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        client={selectedClient}
      />
    </motion.div>
  );
};

export default ClientsTable;