import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Edit, Check, X, RefreshCw, Filter, Search, Plus, ArrowUpDown } from "lucide-react";

const DEFAULT_RATES = {
  bronze: 20.00,
  silver: 15.00,
  gold: 10.00,
  platinum: 5.00,
  special: null,
  unclassified: null
};

const VendorCommissionsPage = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [selectedCommission, setSelectedCommission] = useState("");
  const [customCommission, setCustomCommission] = useState({
    name: "",
    description: "",
    percentage: ""
  });
  const [isCustomCommission, setIsCustomCommission] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterClassification, setFilterClassification] = useState("all");
  const [vendorStats, setVendorStats] = useState({
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    special: 0,
    unclassified: 0
  });

  useEffect(() => {
    fetchVendors();
    fetchCommissions();
  }, [sortField, sortDirection, filterClassification]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/commissions/vendor_commissions/", {
        withCredentials: true
      });
      
      let vendorData = response.data;
      
      const stats = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        special: 0,
        unclassified: 0
      };
      
      vendorData.forEach(vendor => {
        if (!vendor.classification) {
          stats.unclassified++;
        } else {
          stats[vendor.classification]++;
        }
      });
      
      setVendorStats(stats);
      
      if (filterClassification !== "all") {
        vendorData = filterClassification === "unclassified" 
          ? vendorData.filter(vendor => !vendor.classification)
          : vendorData.filter(vendor => vendor.classification === filterClassification);
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        vendorData = vendorData.filter(vendor => 
          (vendor.username?.toLowerCase().includes(term)) || 
          (vendor.full_name?.toLowerCase().includes(term)) || 
          (vendor.business_name?.toLowerCase().includes(term))
        );
      }
      
      setVendors(sortData(vendorData, sortField, sortDirection));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(t('vendorCommissions.fetchError'));
      setLoading(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      const response = await axios.get("/api/commissions/", {
        params: { commission_type: "vendor_type", is_active: true },
        withCredentials: true
      });
      
      setCommissions(response.data.map(commission => ({
        ...commission,
        vendor_classification: commission.vendor_classification || 'unknown'
      })));
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setError(t('vendorCommissions.commissionFetchError'));
    }
  };

  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      if (field === "commission") {
        const aValue = a.commission?.percentage || 0;
        const bValue = b.commission?.percentage || 0;
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      const aValue = a[field] || "";
      const bValue = b[field] || "";
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" 
          ? aValue.localeCompare(bValue, undefined, { sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { sensitivity: 'base' });
      }
      
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  };

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const openEditModal = (vendor) => {
    setCurrentVendor(vendor);
    setSelectedCommission(vendor.commission?.id || "");
    setIsCustomCommission(false);
    setCustomCommission({
      name: `Special commission for ${vendor.username}`,
      description: `Custom commission rate for ${vendor.username}`,
      percentage: ""
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessMessage("");
  };

  const toggleCustomCommission = () => {
    setIsCustomCommission(!isCustomCommission);
    setSelectedCommission("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomCommission(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (isCustomCommission) {
      if (!customCommission.name.trim()) {
        errors.name = t('vendorCommissions.errors.nameRequired');
      }
      
      const percentage = parseFloat(customCommission.percentage);
      if (isNaN(percentage)) {
        errors.percentage = t('vendorCommissions.errors.validPercentage');
      } else if (percentage < 0 || percentage > 100) {
        errors.percentage = t('vendorCommissions.errors.percentageRange');
      }
    } else if (!selectedCommission) {
      errors.commission = t('vendorCommissions.errors.selectCommission');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      axios.defaults.xsrfCookieName = 'csrftoken';
      axios.defaults.xsrfHeaderName = 'X-CSRFToken';
      
      const response = isCustomCommission 
        ? await axios.post("/api/commissions/create_special_commission/", {
            vendor_id: currentVendor.id,
            name: customCommission.name,
            description: customCommission.description,
            percentage: parseFloat(customCommission.percentage)
          }, { withCredentials: true })
        : await axios.post(`/api/commissions/${currentVendor.id}/assign_commission/`, {
            commission_id: selectedCommission
          }, { withCredentials: true });

      setSuccessMessage(t(isCustomCommission 
        ? 'vendorCommissions.specialCommissionSuccess' 
        : 'vendorCommissions.commissionAssignedSuccess'));
      
      fetchVendors();
      setTimeout(closeModal, 1500);
    } catch (err) {
      console.error("Error assigning commission:", err);
      
      if (err.response?.data) {
        if (typeof err.response.data.error === 'string') {
          setError(err.response.data.error);
        } else {
          const backendErrors = {};
          Object.keys(err.response.data).forEach(key => {
            backendErrors[key] = err.response.data[key][0];
          });
          setFormErrors(prev => ({ ...prev, ...backendErrors }));
        }
      } else {
        setError(t('vendorCommissions.assignmentError'));
      }
    }
  };

  const getClassificationBadge = (classification) => {
    if (!classification) return null;
    
    const classColors = {
      bronze: { bg: "bg-amber-100", text: "text-amber-800" },
      silver: { bg: "bg-gray-200", text: "text-gray-800" },
      gold: { bg: "bg-yellow-100", text: "text-yellow-800" },
      platinum: { bg: "bg-indigo-100", text: "text-indigo-800" },
      special: { bg: "bg-purple-100", text: "text-purple-800" }
    };
    
    const colors = classColors[classification] || { bg: "bg-gray-100", text: "text-gray-800" };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
        {t(`vendorCommissions.classifications.${classification}`)}
      </span>
    );
  };

  const cardColors = {
    bronze: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: "bg-amber-200" },
    silver: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", icon: "bg-gray-200" },
    gold: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: "bg-yellow-200" },
    platinum: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", icon: "bg-indigo-200" },
    special: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", icon: "bg-purple-200" },
    unclassified: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "bg-blue-200" }
  };

  const applySearch = () => fetchVendors();

  const clearFilters = () => {
    setSearchTerm("");
    setFilterClassification("all");
    fetchVendors();
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('vendorCommissions.title')}</h1>
              <p className="text-sm text-gray-600">{t('vendorCommissions.subtitle')}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('vendorCommissions.searchPlaceholder')}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <div className="p-2 bg-gray-100 text-gray-500">
                  <Filter size={16} />
                </div>
                <select
                  value={filterClassification}
                  onChange={(e) => setFilterClassification(e.target.value)}
                  className="py-2 px-3 focus:outline-none bg-transparent text-gray-700"
                >
                  <option value="all">{t('vendorCommissions.allClassifications')}</option>
                  {['bronze', 'silver', 'gold', 'platinum', 'special', 'unclassified'].map(cls => (
                    <option key={cls} value={cls}>
                      {t(`vendorCommissions.classifications.${cls}`)}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={applySearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.apply')}
              </button>
              
              <button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('common.clear')}
              </button>
              
              <button
                onClick={fetchVendors}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                title={t('common.refresh')}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {['bronze', 'silver', 'gold', 'platinum', 'unclassified'].map((classification) => {
              const commission = commissions.find(
                c => c.vendor_classification === classification
              );

              return (
                <div 
                  key={classification}
                  className={`${cardColors[classification].bg} ${cardColors[classification].border} border rounded-lg p-4 shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-full ${cardColors[classification].icon} flex items-center justify-center`}>
                      <span className={`text-lg font-semibold ${cardColors[classification].text}`}>
                        {t(`vendorCommissions.classifications.${classification}`).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-black">{vendorStats[classification]}</span>
                      {commission && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Commission</span>
                          <span className="block font-normal">Perc.: {commission.percentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${cardColors[classification].text}`}>
                    {t(`vendorCommissions.classifications.${classification}`)}
                  </p>
                </div>
              );
            })}
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
          
          {/* Vendors Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">{t('vendorCommissions.noVendorsFound')}</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('vendorCommissions.clearFilters')}
              </button>
            </div>
          ) : (
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['name', 'business_name', 'classification', 'commission'].map((field) => (
                      <th key={field} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center gap-1 hover:text-gray-700"
                          onClick={() => handleSort(field)}
                        >
                          {t(`vendorCommissions.${field === 'business_name' ? 'businessName' : field}`)}
                          {sortField === field && (
                            <ArrowUpDown size={14} className={sortDirection === "asc" ? "rotate-180" : ""} />
                          )}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('vendorCommissions.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{vendor.username}</span>
                          {vendor.full_name && (
                            <span className="text-sm text-gray-500">{vendor.full_name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {vendor.business_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vendor.classification ? 
                          getClassificationBadge(vendor.classification) : 
                          <span className="text-xs text-gray-500">{t('vendorCommissions.unclassified')}</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vendor.commission ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{vendor.commission.percentage}%</span>
                            <span className="text-xs text-black">{vendor.commission.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">{t('vendorCommissions.noCommissionSet')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(vendor)}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('vendorCommissions.editCommission')}
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {/* Modal for editing vendor commission */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t(isCustomCommission 
                  ? 'vendorCommissions.createSpecialCommission' 
                  : 'vendorCommissions.editVendorCommission')}
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
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{t('vendorCommissions.vendorInformation')}</h4>
                <div className="mt-2 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-black">{currentVendor?.username}</p>
                  {currentVendor?.full_name && <p className="text-sm text-gray-600">{currentVendor.full_name}</p>}
                  {currentVendor?.business_name && <p className="text-sm text-gray-600">{currentVendor.business_name}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('vendorCommissions.currentClassification')}:</span>
                    {currentVendor?.classification ? 
                      getClassificationBadge(currentVendor.classification) : 
                      <span className="text-xs text-gray-500">{t('vendorCommissions.unclassified')}</span>
                    }
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('vendorCommissions.currentCommission')}:</span>
                    {currentVendor?.commission ? (
                      <span className="text-sm font-medium text-black">{currentVendor.commission.percentage}%</span>
                    ) : (
                      <span className="text-xs text-gray-500">{t('vendorCommissions.none')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{t('vendorCommissions.commissionAssignment')}</h4>
                  <button
                    type="button"
                    onClick={toggleCustomCommission}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {t(isCustomCommission 
                      ? 'vendorCommissions.useExistingCommission' 
                      : 'vendorCommissions.createCustomCommission')}
                  </button>
                </div>
                
                {isCustomCommission ? (
                  <form onSubmit={handleSubmit} className="mt-3">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('vendorCommissions.name')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={customCommission.name}
                        onChange={handleInputChange}
                        className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('vendorCommissions.description')}
                      </label>
                      <textarea
                        name="description"
                        value={customCommission.description}
                        onChange={handleInputChange}
                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('vendorCommissions.commissionRate')} (%)
                      </label>
                      <input
                        type="number"
                        name="percentage"
                        value={customCommission.percentage}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="100"
                        className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.percentage ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.percentage && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.percentage}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        {t('vendorCommissions.createSpecialCommission')}
                      </button>
                    </div>
                    
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        {t('vendorCommissions.specialCommissionWarning')}
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-3">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('vendorCommissions.selectCommission')}
                      </label>
                      <select
                        value={selectedCommission}
                        onChange={(e) => setSelectedCommission(e.target.value)}
                        className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.commission ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">{t('vendorCommissions.selectCommissionPlaceholder')}</option>
                        {commissions.map(commission => (
                          <option key={commission.id} value={commission.id}>
                            {commission.name} ({commission.percentage}%) - {t(`vendorCommissions.classifications.${commission.vendor_classification}`)}
                          </option>
                        ))}
                      </select>
                      {formErrors.commission && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.commission}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        {t('vendorCommissions.assignCommission')}
                      </button>
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-800">
                        {t('vendorCommissions.commissionAssignmentWarning')}
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VendorCommissionsPage;