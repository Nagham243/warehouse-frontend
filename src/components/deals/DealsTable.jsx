import { useState, useEffect ,useCallback} from "react";
import { motion } from "framer-motion";
import { Search, Eye, CheckCircle, X, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

const DealsTable = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [allDeals, setAllDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [actionType, setActionType] = useState(null); 
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");


  const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue;
  };

  const fetchDeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch deals');
      }

      const data = await response.json();
      setAllDeals(data);
      setFilteredDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);


  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredDeals(allDeals);
      return;
    }
    


    const filtered = allDeals.filter(
      (deal) => 
        deal.title?.toLowerCase().includes(term) || 
        deal.client?.username?.toLowerCase().includes(term) ||
        deal.vendor?.username?.toLowerCase().includes(term) ||
        deal.status?.toLowerCase().includes(term)
    );
    setFilteredDeals(filtered);
  };

  const openViewModal = (deal) => {
    setCurrentDeal(deal);
    setActionType(null);
    setModalOpen(true);
  };

  const openApproveModal = (deal) => {
    setCurrentDeal(deal);
    setActionType("approve");
    setAdminNotes("");
    setModalOpen(true);
  };

  const openRejectModal = (deal) => {
    setCurrentDeal(deal);
    setActionType("reject");
    setRejectionReason("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentDeal(null);
    setActionType(null);
    setRejectionReason("");
    setAdminNotes("");
  };

  const handleApprove = async () => {
    try {
      const csrfToken = getCSRFToken();
      if (!csrfToken) throw new Error('Missing CSRF token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${currentDeal.id}/approve/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ admin_notes: adminNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Approval failed');
      }

      await fetchDeals();
      closeModal();
    } catch (error) {
      console.error('Error approving deal:', error);
      setError(error.message);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError(t('errors.rejectionReasonRequired'));
      return;
    }

    try {
      const csrfToken = getCSRFToken();
      if (!csrfToken) throw new Error('Missing CSRF token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${currentDeal.id}/reject/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ 
          rejection_reason: rejectionReason,
          admin_notes: adminNotes 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Rejection failed');
      }

      await fetchDeals();
      closeModal();
    } catch (error) {
      console.error('Error rejecting deal:', error);
      setError(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(date);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getStatusDisplayText = (status) => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    if (typeof amount === 'number') return `$${amount.toFixed(2)}`;
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <motion.div
        className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-black'>Deal List</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>{t('deals.loadingDeals')}</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-black'>{t('deals.dealList')}</h2>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            {t('common.retry')}
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-black'>{t('deals.dealList')}</h2>
          <div className='relative'>
            <input
              type='text'
              placeholder={t('deals.searchPlaceholder')}
              className='bg-gray-300 text-black placeholder-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className='absolute left-3 top-2.5 text-black' size={18} />
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No deals found matching your search criteria.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-300'>
              <thead>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.dealTitle')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.client')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.vendor')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.amount')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.status')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.createdDate')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                  {t('deals.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className='divide divide-gray-300'>
                {filteredDeals.map((deal) => (
                  <motion.tr
                    key={deal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-black'>
                      {deal.title || t('deals.untitledDeal')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-black'>
                      {deal.client || t('deals.na')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-black'>
                      {deal.vendor || t('deals.na')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-black'>
                      {formatAmount(deal.amount)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(deal.status)}`}
                      >
                        {getStatusDisplayText(deal.status)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-black'>
                      {formatDate(deal.created_at)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-black'>
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mx-2" 
                          onClick={() => openViewModal(deal)}
                          title={t('deals.viewDetails')}
                        >
                          <Eye size={18} />
                        </button>
                        
                        {deal.status.toUpperCase() === "PENDING"  && (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-900 " 
                              onClick={() => openApproveModal(deal)}
                              title={t('deals.approveDeal')}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900" 
                              onClick={() => openRejectModal(deal)}
                              title={t('deals.rejectDeal')}
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal for viewing deal details and performing actions */}
      {modalOpen && currentDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">
                {actionType === "approve" ?  t('deals.approveDeal'): 
                 actionType === "reject" ? t('deals.rejectDeal') : 
                 t('deals.dealDetails')}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle className="mr-2" size={16} />
                {error}
              </div>
            )}

            {/* Deal Information Section */}
            {!actionType && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-black">{t('deals.dealTitle')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentDeal.title || "Untitled Deal"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('deals.description')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentDeal.description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.client')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{currentDeal.client|| "N/A"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.vendor')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{currentDeal.vendor || "N/A"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.amount')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatAmount(currentDeal.amount)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.status')}</h4>
                    <span
                      className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(currentDeal.status)}`}
                    >
                      {getStatusDisplayText(currentDeal.status)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.createdDate')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(currentDeal.created_at)}</p>
                  </div>
                  
                  {currentDeal.approved_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">{t('deals.approvedDate')}</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(currentDeal.approved_at)}</p>
                    </div>
                  )}
                  
                  {currentDeal.rejected_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">{t('deals.rejectedDate')}</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(currentDeal.rejected_at)}</p>
                    </div>
                  )}
                </div>
                
                {currentDeal.rejection_reason && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.rejectionReason')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{currentDeal.rejection_reason}</p>
                  </div>
                )}
                
                {currentDeal.admin_notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('deals.adminNotes')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{currentDeal.admin_notes}</p>
                  </div>
                )}
                
                {currentDeal.status.toUpperCase() === "PENDING" && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                      onClick={() => {
                        setActionType("approve");
                        setError(null);
                      }}
                    >
                      <CheckCircle size={16} className="mx-2" />
                      {t('deals.approve')}
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                      onClick={() => {
                        setActionType("reject");
                        setError(null);
                      }}
                    >
                      <X size={16} className="mx-2" />
                      {t('deals.reject')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Approve Deal Form */}
            {actionType === "approve" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-black">{t('deals.dealTitle')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentDeal.title || "Untitled Deal"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('deals.amount')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatAmount(currentDeal.amount)}</p>
                </div>
                
                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
                  {t('deals.adminNotesOptional')}
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder={t('deals.adminNotesPlaceholder')}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                    onClick={handleApprove}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    {t('deals.confirmApproval')}
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Reject Deal Form */}
            {actionType === "reject" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('deals.dealTitle')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{currentDeal.title || "Untitled Deal"}</p>
                </div>
                
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                  {t('deals.rejectionReason')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder={t('deals.rejectionReasonPlaceholder')}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
                  {t('deals.adminNotesOptional')}
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder={t('deals.adminNotesPlaceholderAdditional')}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                    onClick={handleReject}
                  >
                    <X size={16} className="mx-2" />
                    {t('deals.confirmRejection')}
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DealsTable;
