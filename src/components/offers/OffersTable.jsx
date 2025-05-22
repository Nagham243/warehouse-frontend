import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, CheckCircle, XCircle, Flag, Filter } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import './offers.css';

const OffersTable = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [violationNotes, setViolationNotes] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);


  const renderTableRow = (offer) => (
    <tr 
      key={offer.id} 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => navigate(`/offers/${offer.id}`)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {offer.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {offer.vendor || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(offer.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {offer.category || "Uncategorized"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatPrice(offer.price)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(offer)}
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex space-x-2">
          {!offer.is_approved && !offer.rejection_reason && !offer.has_violation && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(offer.id);
                }}
                className="text-green-600 hover:text-green-900 transition-colors mx-2"
                title={t('offers.approve')}
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOfferId(offer.id);
                  setShowRejectionModal(true);
                }}
                className="text-red-600 hover:text-red-900 transition-colors"
                title={t('offers.reject')}
              >
                <XCircle size={18} />
              </button>
            </>
          )}
          
          {!offer.has_violation ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOfferId(offer.id);
                setShowViolationModal(true);
              }}
              className="text-orange-600 hover:text-orange-900 transition-colors"
              title={t('offers.flagViolation')}
            >
              <Flag size={18} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearViolation(offer.id);
              }}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title={t('offers.clearViolation')}
            >
              <Flag size={18} className="line-through" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue;
  };
  

  useEffect(() => {
    fetchOffers();
  }, [sortField, sortDirection, filterStatus]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${import.meta.env.VITE_API_URL}/api/offers/`;
      const params = new URLSearchParams();
      
      if (filterStatus === "approved") {
        params.append("is_approved", "true");
      } else if (filterStatus === "pending") {
        params.append("is_approved", "false");
        params.append("rejection_reason__isnull", "true");
      } else if (filterStatus === "rejected") {
        params.append("is_approved", "false");
        params.append("rejection_reason__isnull", "false");
      } else if (filterStatus === "violations") {
        params.append("has_violation", "true");
      }
      
      params.append("ordering", `${sortDirection === "desc" ? "-" : ""}${sortField}`);
      
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
      const response = await axios.get(`${url}?${params.toString()}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      setOffers(response.data);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to load offers. Please try again later.");
      
      const fallbackData = [
        {
          id: 1,
          title: "50% Off Premium Subscription",
          vendor: { username: "premiumseller" },
          created_at: "2025-05-10T10:30:00Z",
          category: { name: "Subscriptions" },
          price: 49.99,
          is_approved: true,
          has_violation: false,
          rejection_reason: null,
        },
        {
          id: 2,
          title: "Buy One Get One Free - Learning Course",
          vendor: { username: "eduplatform" },
          created_at: "2025-05-11T14:20:00Z",
          category: { name: "Education" },
          price: 129.99,
          is_approved: false,
          has_violation: false,
          rejection_reason: null,
        },
        {
          id: 3,
          title: "75% Discount on Software License",
          vendor: { username: "softwaredeals" },
          created_at: "2025-05-12T09:15:00Z",
          category: { name: "Software" },
          price: 199.99,
          is_approved: false,
          has_violation: false,
          rejection_reason: "Pricing inconsistent with market value",
        },
        {
          id: 4,
          title: "Free Trial Extended to 60 Days",
          vendor: { username: "cloudservice" },
          created_at: "2025-05-12T16:45:00Z",
          category: { name: "Services" },
          price: 0,
          is_approved: false,
          has_violation: true,
          rejection_reason: null,
        },
      ];
      setOffers(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offerId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/offers/${offerId}/approve/`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(), 
          },
        }
      );
      fetchOffers();
    } catch (err) {
      console.error("Error approving offer:", err);
      alert(t('offers.approveError')); 
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert(t('offers.rejectionReasonRequired')); 
      return;
    }
  
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/offers/${selectedOfferId}/reject/`,
        { rejection_reason: rejectionReason },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(), 
          },
        }
      );
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedOfferId(null);
      fetchOffers();
    } catch (err) {
      console.error("Error rejecting offer:", err);
      alert(t('offers.rejectError')); 
    }
  };

  const handleFlagViolation = async () => {
    if (!violationNotes.trim()) {
      alert(t('offers.violationNotesRequired')); 
      return;
    }
  
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/offers/${selectedOfferId}/flag_violation/`,
        { violation_notes: violationNotes },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
        }
      );
      setShowViolationModal(false);
      setViolationNotes("");
      setSelectedOfferId(null);
      fetchOffers();
    } catch (err) {
      console.error("Error flagging violation:", err);
      alert(t('offers.flagError')); 
    }
  };

  const handleClearViolation = async (offerId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/offers/${offerId}/clear_violation/`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(), 
          },
        }
      );
      fetchOffers();
    } catch (err) {
      console.error("Error clearing violation:", err);
      alert("Failed to clear violation. Please try again.");
    }
  };


  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOffers();
  };

  const filteredOffers = offers.filter((offer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      offer.title.toLowerCase().includes(searchLower) ||
      offer.vendor.username.toLowerCase().includes(searchLower) ||
      (offer.category && offer.category.name.toLowerCase().includes(searchLower))
    );
  });

  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer);
  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "$0.00";
    const numPrice = typeof price === "number" ? price : Number(price);
    return isNaN(numPrice) ? "$0.00" : `$${numPrice.toFixed(2)}`;
  };

  const getStatusBadge = (offer) => {
    if (offer.has_violation) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          {t('offerStatus.violation')}
        </span>
      );
    }
    if (offer.is_approved) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          {t('offerStatus.approved')}
        </span>
      );
    }
    if (offer.rejection_reason) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          {t('offerStatus.violations')}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
        {t('offerStatus.pending')}
      </span>
    );
  };

  if (loading && !offers.length) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('offers.allOffers')}</h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            {/* <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('offers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="hidden">Search</button>
            </form> */}
            
            <button
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              {t('common.filters')}
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('offers.status')}
              </label>
              <select
                className="w-full text-black bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('offerStatus.pending')}</option>
                <option value="approved">{t('offerStatus.approved')}</option>
                <option value="rejected">{t('offerStatus.rejected')}</option>
                <option value="violations">{t('offerStatus.violations')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('offers.sortBy')}
              </label>
              <select
                className="w-full text-black bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="created_at">{t('offers.dateCreated')}</option>
                <option value="title">{t('offers.title')}</option>
                <option value="price">{t('offers.price')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('offers.direction')}
              </label>
              <select
                className="w-full text-black bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
                <option value="asc">{t('common.ascending')}</option>
                <option value="desc">{t('common.descending')}</option>
              </select>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                  {t('offers.offername')}
                    <ChevronDown
                      size={16}
                      className={`ml-1 transform transition-transform ${
                        sortField === "title" && sortDirection === "desc" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('offers.vendor')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                  {t('offers.date')}
                    <ChevronDown
                      size={16}
                      className={`ml-1 transform transition-transform ${
                        sortField === "created_at" && sortDirection === "desc" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('offers.category')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center">
                  {t('offers.price')}
                    <ChevronDown
                      size={16}
                      className={`ml-1 transform transition-transform ${
                        sortField === "price" && sortDirection === "desc" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('offers.status')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t('offers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOffers.length > 0 ? (
                currentOffers.map(renderTableRow)
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    {t('offers.noOffersFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOffers.length > offersPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstOffer + 1} to{" "}
              {Math.min(indexOfLastOffer, filteredOffers.length)} of{" "}
              {filteredOffers.length} offers
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('offers.rejectOffer')}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('offers.rejectionReason')} *
              </label>
              <textarea
                className="w-full text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('offers.rejectionReasonPlaceholder')}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 mx-2 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setSelectedOfferId(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                {t('offers.confirmRejection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('offers.flagViolationTitle')}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('offers.violationNotes')} *
              </label>
              <textarea
                className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                value={violationNotes}
                onChange={(e) => setViolationNotes(e.target.value)}
                placeholder={t('offers.violationNotesPlaceholder')}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 mx-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowViolationModal(false);
                  setViolationNotes("");
                  setSelectedOfferId(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
                onClick={handleFlagViolation}
                disabled={!violationNotes.trim()}
              >
                {t('offers.flagViolation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OffersTable;
