import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';

const UserFormModal = ({ isOpen, onClose, onSubmit, user }) => {
  const { t } = useTranslation();
  const isEditing = !!user;
  
  const defaultFormData = {
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
    user_type: "client",
    is_active: true
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        password: "",
        password_confirm: "", 
        user_type: user.role?.toLowerCase() || "client",
        is_active: user.status === "Active"
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = t('errors.usernameRequired');
    if (!formData.email.trim()) newErrors.email = t('errors.emailRequired');
    if (!formData.first_name.trim()) newErrors.first_name = t('errors.firstNameRequired');
    if (!formData.last_name.trim()) newErrors.last_name = t('errors.lastNameRequired');
    
    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = t('errors.passwordRequired');
      } else if (formData.password.length < 8) {
        newErrors.password = t('errors.passwordLength');
      }
      
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = t('errors.passwordMatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      if (isEditing && !submitData.password) {
        delete submitData.password;
        delete submitData.password_confirm;
      }
      
      onSubmit(submitData, isEditing);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-gray-300 rounded-xl p-6 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? t('users.editUser') : t('users.createUser')}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.username')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded border text-black ${
                  errors.username ? "border-red-500" : "border-gray-400"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded border text-black ${
                  errors.email ? "border-red-500" : "border-gray-400"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.firstName')}</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded border text-black ${
                  errors.first_name ? "border-red-500" : "border-gray-400"
                }`}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.lastName')}</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded border text-black ${
                  errors.last_name ? "border-red-500" : "border-gray-400"
                }`}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded border text-black ${
                  errors.password ? "border-red-500" : "border-gray-400"
                }`}
                placeholder={isEditing ? t('users.passwordPlaceholder') : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.confirmPassword')}</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded border text-black ${
                  errors.password_confirm ? "border-red-500" : "border-gray-400"
                }`}
                placeholder={isEditing ? t('users.passwordPlaceholder') : ""}
              />
              {errors.password_confirm && (
                <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.userType')}</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 rounded border border-gray-400 text-black"
              >
                <option value="client">{t('users.types.client')}</option>
                <option value="vendor">{t('users.types.vendor')}</option>
                <option value="financial">{t('users.types.financialManager')}</option>
                <option value="technical">{t('users.types.technicalSupport')}</option>
                <option value="admin">{t('users.types.superAdmin')}</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">{t('users.active')}</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 ">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg mx-2"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isEditing ? t('users.updateUser') : t('users.createUser')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserFormModal;