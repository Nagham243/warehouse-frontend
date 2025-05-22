import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, UserPlus } from "lucide-react";
import { useUsers } from "../../hooks/useUsers";
import UserFormModal from "./UserFormModal";
import { formatUserData } from "../../utils/userUtils";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const UsersTable = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const {
    users,
    loading,
    error,
    handleSearch,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    refreshUsers
  } = useUsers();

  useEffect(() => {
      axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
      axios.defaults.withCredentials = true;
      
      let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      if (!csrfToken) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN' || name === 'csrftoken' || name === '_csrf') {
            csrfToken = decodeURIComponent(value);
            break;
          }
        }
      }
      
      if (csrfToken) {
        axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
        axios.defaults.headers.common['CSRF-Token'] = csrfToken;
        axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
      }
      
      axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
      axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
    }, []);


  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };
  
  const handleFormSubmit = async (userData, isEditing) => {
    try {
      if (isEditing) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser(userData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
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

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.status === "Active" || user.is_active) {
        await suspendUser(user.id);
      } else {
        await activateUser(user.id);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUsers();
    setTimeout(() => setIsRefreshing(false), 500); 
  };
  const isRTL = i18n.language === 'ar';
  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">{t('users.title')}</h2>
        <div className="flex items-center space-x-2">
          <div className="relative mx-2">
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              className="bg-gray-300 text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 text-black" size={18} />
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-black"
            title={t('users.refresh')}
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreateUser}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title={t('users.addNewUser')}
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
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-black uppercase tracking-wider`}>
                {t('users.name')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-black uppercase tracking-wider`}>
                {t('users.email')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-black uppercase tracking-wider`}>
                {t('users.role')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-black uppercase tracking-wider`}>
                {t('users.status')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-black uppercase tracking-wider`}>
                {t('users.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-black">
                  Loading users...
                </td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((apiUser) => {
                const formattedUser = formatUserData(apiUser);
                return (
                  <motion.tr
                    key={formattedUser.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {formattedUser.name.charAt(0)}
                          </div>
                        </div>
                        <div className="mx-4">
                          <div className="text-sm font-medium text-black">{formattedUser.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{formattedUser.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                        {formattedUser.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          formattedUser.status === "Active"
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {formattedUser.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button 
                        className="text-indigo-400 hover:text-indigo-300 mx-2"
                        onClick={() => handleEditUser(formattedUser)}
                      >
                         {t('users.edit')}
                      </button>
                      <button 
                        className="text-yellow-500 hover:text-yellow-400 mx-2"
                        onClick={() => handleToggleStatus(formattedUser)}
                      >
                        {formattedUser.status === "Active" ? t('users.suspend') : t('users.activate')}
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300 mx-2" 
                        onClick={() => handleDeleteUser(formattedUser.id)}
                      >
                        {t('users.delete')}
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-black">
                {t('users.noUsersFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />
    </motion.div>
  );
};

export default UsersTable;