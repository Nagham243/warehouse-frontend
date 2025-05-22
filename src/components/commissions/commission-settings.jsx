import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Edit, Trash2, Plus, Filter, ArrowUpDown, Check, X, RefreshCw } from "lucide-react";
import { useTranslation } from 'react-i18next';

const CommissionSettings = () => {
  const { t, i18n } = useTranslation();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [sortField, setSortField] = useState("updated_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCommission, setCurrentCommission] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    commission_type: "vendor_type",
    percentage: "",
    is_active: true,
    vendor_classification: "bronze",
    start_date: "",
    end_date: "",
    category: "",
    subcategory: ""
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCommissions();
    fetchCategories();
  }, [selectedType, sortField, sortDirection]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedType !== "all") {
        params.commission_type = selectedType;
      }
      
      const response = await axios.get("/api/commissions/", {
        params,
        withCredentials: true
      });
      
      let data = response.data;
      
      data = sortData(data, sortField, sortDirection);
      
      setCommissions(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setError("Failed to load commission data. Please try again later.");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await axios.get("/api/categories/", {
        withCredentials: true
      });
      setCategories(categoriesResponse.data);
      
      const subcategoriesResponse = await axios.get("/api/subcategories/", {
        withCredentials: true
      });
      setSubcategories(subcategoriesResponse.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      if (field === "percentage") {
        return direction === "asc" 
          ? parseFloat(a[field]) - parseFloat(b[field])
          : parseFloat(b[field]) - parseFloat(a[field]);
      }
      
      if (field === "created_at" || field === "updated_at") {
        return direction === "asc"
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }
      
      if (a[field] && b[field]) {
        return direction === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      
      return 0;
    });
  };

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      commission_type: "vendor_type",
      percentage: "",
      is_active: true,
      vendor_classification: "bronze",
      start_date: "",
      end_date: "",
      category: "",
      subcategory: ""
    });
    setCurrentCommission(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (commission) => {
    const formattedData = {
      name: commission.name,
      description: commission.description || "",
      commission_type: commission.commission_type,
      percentage: commission.percentage,
      is_active: commission.is_active,
      vendor_classification: commission.vendor_classification || "bronze",
      start_date: commission.start_date ? commission.start_date.split("T")[0] : "",
      end_date: commission.end_date ? commission.end_date.split("T")[0] : "",
      category: commission.category?.id || "",
      subcategory: commission.subcategory?.id || ""
    };
    
    setFormData(formattedData);
    setCurrentCommission(commission);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = t('commissionSettings.errors.nameRequired');
    }
    
    if (!formData.percentage || isNaN(parseFloat(formData.percentage))) {
      errors.percentage = t('commissionSettings.errors.validPercentage');
    } else if (parseFloat(formData.percentage) < 0 || parseFloat(formData.percentage) > 100) {
      errors.percentage = t('commissionSettings.errors.percentageRange');
    }
    
    if (formData.commission_type === "time_period") {
      if (!formData.start_date) {
        errors.start_date = t('commissionSettings.errors.startDateRequired');
      }
      if (!formData.end_date) {
        errors.end_date = t('commissionSettings.errors.endDateRequired');
      } else if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
        errors.end_date = t('commissionSettings.errors.endDateAfterStart');
      }
    } else if (formData.commission_type === "offer_type") {
      if (!formData.category) {
        errors.category = t('commissionSettings.errors.categoryRequired');
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submissionData = {
      ...formData,
      percentage: parseFloat(formData.percentage)
    };
    
    if (submissionData.commission_type !== "vendor_type") {
      delete submissionData.vendor_classification;
    }
    
    if (submissionData.commission_type !== "time_period") {
      delete submissionData.start_date;
      delete submissionData.end_date;
    }
    
    if (submissionData.commission_type !== "offer_type") {
      delete submissionData.category;
      delete submissionData.subcategory;
    } else if (!submissionData.subcategory) {
      delete submissionData.subcategory;
    }
    
    try {
      let response;
      
      if (currentCommission) {
        response = await axios.put(`/api/commissions/${currentCommission.id}/`, submissionData, {
          withCredentials: true
        });
        setSuccessMessage("Commission updated successfully!");
      } else {
        response = await axios.post("/api/commissions/", submissionData, {
          withCredentials: true
        });
        setSuccessMessage("Commission created successfully!");
      }
      
      fetchCommissions();
      
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (err) {
      console.error("Error saving commission:", err);
      
      if (err.response && err.response.data) {
        const backendErrors = {};
        Object.keys(err.response.data).forEach(key => {
          backendErrors[key] = err.response.data[key][0];
        });
        setFormErrors({
          ...formErrors,
          ...backendErrors
        });
      } else {
        setError("Failed to save commission. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this commission? This action cannot be undone.")) {
      return;
    }
    
    try {
      await axios.delete(`/api/commissions/${id}/`, {
        withCredentials: true
      });
      
      fetchCommissions();
      setSuccessMessage("Commission deleted successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Error deleting commission:", err);
      setError("Failed to delete commission. Please try again.");
    }
  };

  const getCommissionTypeName = (type) => {
    switch (type) {
      case "vendor_type": return "Vendor Type";
      case "time_period": return "Time Period";
      case "offer_type": return "Offer Type";
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderTypeSpecificFields = () => {
    switch (formData.commission_type) {
      case "vendor_type":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('commissionSettings.vendorClassification')}
            </label>
            <select
              name="vendor_classification"
              value={formData.vendor_classification}
              onChange={handleInputChange}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bronze">{t('vendorClassifications.bronze')}</option>
              <option value="silver">{t('vendorClassifications.silver')}</option>
              <option value="gold">{t('vendorClassifications.gold')}</option>
              <option value="platinum">{t('vendorClassifications.platinum')}</option>
            </select>
          </div>
        );
        
      case "time_period":
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('commissionSettings.startDate')}
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.start_date ? "border-red-500" : "border-gray-300"}`}
              />
              {formErrors.start_date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.start_date}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('commissionSettings.endDate')}
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.end_date ? "border-red-500" : "border-gray-300"}`}
              />
              {formErrors.end_date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.end_date}</p>
              )}
            </div>
          </>
        );
        
      case "offer_type":
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('commissionSettings.category')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.category ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">{t('commissionSettings.selectCategory')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {formErrors.category && (
                <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('commissionSettings.subcategoryOptional')}
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.category}
              >
                <option value="">{t('commissionSettings.allSubcategories')}</option>
                {subcategories
                  .filter(subcat => subcat.category.toString() === formData.category.toString())
                  .map(subcat => (
                    <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                  ))
                }
              </select>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  const getExtraDetails = (commission) => {
    switch (commission.commission_type) {
      case "vendor_type":
        return commission.vendor_classification ? (
          <span className="text-xs text-black">
            {commission.vendor_classification.charAt(0).toUpperCase() + commission.vendor_classification.slice(1)} vendors
          </span>
        ) : null;
        
      case "time_period":
        return commission.start_date && commission.end_date ? (
          <span className="text-xs text-gray-500">
            {formatDate(commission.start_date)} to {formatDate(commission.end_date)}
          </span>
        ) : null;
        
      case "offer_type":
        return (
          <span className="text-xs text-gray-500">
            {commission.category?.name || "Any category"}
            {commission.subcategory ? ` > ${commission.subcategory.name}` : ""}
          </span>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">{t('commissionSettings.title')}</h1>
              <p className="text-sm text-gray-600">{t('commissionSettings.subtitle')}</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <div className="p-2 bg-gray-400 text-white">
                  <Filter size={16} />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="py-2 px-3 focus:outline-none bg-transparent text-black"
                >
                  <option value="vendor_type">{t('commissionTypes.vendorType')}</option>
                  <option value="time_period">{t('commissionTypes.timePeriod')}</option>
                  <option value="offer_type">{t('commissionTypes.offerType')}</option>
                </select>
              </div>
              
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>{t('commissionSettings.newCommission')}</span>
              </button>
              
              <button
                onClick={fetchCommissions}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              <p>{successMessage}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
            </div>
          ) : commissions.length === 0 ? (
            <div className="bg-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">{t('commissionSettings.noCommissions')}</p>
              <button
                onClick={openCreateModal}
                className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus size={16} />
                <span>{t('commissionSettings.newCommission')}</span>
              </button>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mb-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("name")}
                      >
                        {t('commissionSettings.name')}
                        {sortField === "name" && (
                          <ArrowUpDown size={14} className={sortDirection === "asc" ? "rotate-180" : ""} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("commission_type")}
                      >
                        {t('commissionSettings.type')}
                        {sortField === "commission_type" && (
                          <ArrowUpDown size={14} className={sortDirection === "asc" ? "rotate-180" : ""} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("percentage")}
                      >
                        {t('commissionSettings.rate')}
                        {sortField === "percentage" && (
                          <ArrowUpDown size={14} className={sortDirection === "asc" ? "rotate-180" : ""} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {t('commissionSettings.status')}
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("updated_at")}
                      >
                        {t('commissionSettings.lastUpdated')}
                        {sortField === "updated_at" && (
                          <ArrowUpDown size={14} className={sortDirection === "asc" ? "rotate-180" : ""} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="relative px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-300">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-200">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-black">{commission.name}</span>
                          {commission.description && (
                            <span className="text-xs text-gray-500 truncate max-w-xs">{commission.description}</span>
                          )}
                          {getExtraDetails(commission)}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-opacity-20"
                          style={{
                            backgroundColor: commission.commission_type === "vendor_type" ? "rgba(99, 102, 241, 0.2)" :
                              commission.commission_type === "time_period" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
                            color: commission.commission_type === "vendor_type" ? "#6366F1" :
                              commission.commission_type === "time_period" ? "#F59E0B" : "#10B981"
                          }}
                        >
                          {getCommissionTypeName(commission.commission_type)}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="font-medium text-black">{commission.percentage}%</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          commission.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {commission.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(commission.updated_at)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(commission)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(commission.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {/* Modal for creating/editing commissions */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-black">
                {currentCommission ? t('commissionSettings.editCommission') : t('commissionSettings.createCommission')}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {successMessage && (
              <div className="mx-6 mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                <div className="flex">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('commissionSettings.commissionType')}
                </label>
                <select
                  name="commission_type"
                  value={formData.commission_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={currentCommission} 
                >
                  <option value="vendor_type">{t('commissionTypes.vendorType')}</option>
                  <option value="time_period">{t('commissionTypes.timePeriod')}</option>
                  <option value="offer_type">{t('commissionTypes.offerType')}</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('commissionSettings.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder={t('commissionSettings.namePlaceholder')}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('commissionSettings.descriptionOptional')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('commissionSettings.descriptionPlaceholder')}
                  rows={2}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('commissionSettings.commissionRate')}
                </label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.percentage ? "border-red-500" : "border-gray-300"}`}
                  placeholder={t('commissionSettings.ratePlaceholder')}
                />
                {formErrors.percentage && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.percentage}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mx-2"
                  />
                  <span className="text-sm font-medium text-gray-700 m">{t('common.active')}</span>
                </label>
              </div>
              
              {/* Render type-specific fields */}
              {renderTypeSpecificFields()}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                >
                  {currentCommission ? t('common.update') : t('common.create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Summary statistics */}
      <motion.div
        className="max-w-7xl mx-auto py-6 px-4 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t('commissionSettings.activeCommissions')}</h3>
            <p className="text-3xl font-bold mt-2 text-black">
              {commissions.filter(c => c.is_active).length}
            </p>
            <div className="mt-2 text-sm text-gray-500">
            {t('commissionSettings.outOfTotal', { total: commissions.length })}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-black">{t('commissionSettings.averageCommission')}</h3>
            <p className="text-3xl font-bold mt-2 text-black">
              {commissions.length > 0 
                ? (commissions.reduce((sum, c) => sum + parseFloat(c.percentage), 0) / commissions.length).toFixed(2)
                : 0}%
            </p>
            <div className="mt-2 text-sm text-gray-500">
            {t('commissionSettings.acrossAllTypes')}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t('commissionSettings.commissionTypes')}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('commissionTypes.vendorType')}</span>
                <span className="text-sm font-medium text-black">
                  {commissions.filter(c => c.commission_type === "vendor_type").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('commissionTypes.timePeriod')}</span>
                <span className="text-sm font-medium text-black">
                  {commissions.filter(c => c.commission_type === "time_period").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('commissionTypes.offerType')}</span>
                <span className="text-sm font-medium text-black">
                  {commissions.filter(c => c.commission_type === "offer_type").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommissionSettings;