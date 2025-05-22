// OfferDetailsPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Flag, ArrowLeft } from "lucide-react";

const OfferDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [violationNotes, setViolationNotes] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);

  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue;
  };

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/offers/${id}/`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
        });
        setOffer(response.data);
      } catch (err) {
        if (err.response) {
          console.error('Error details:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });
          
          if (err.response.status === 404) {
            setError('Offer not found or has been removed');
          } else if (err.response.status === 401) {
            setError('Please login to view this offer');
            navigate('/login');
          } else {
            setError('Failed to load offer details');
          }
        } else if (err.request) {

          setError('Network error. Please check your connection.');
        } else {

          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
  
    if (id) { 
      fetchOfferDetails();
    } else {
      setError('Invalid offer ID');
    }
  }, [id, navigate]);

  const handleApprove = async () => {
    try {
      await axios.post(
        `/api/offers/${id}/approve/`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(), 
          },
        }
      );
      const response = await axios.get(`/api/offers/${id}/`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), 
        },
      });
      setOffer(response.data);
    } catch (err) {
      console.error("Error approving offer:", err);
      alert("Failed to approve offer. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      await axios.post(
        `/api/offers/${id}/reject/`,
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
      const response = await axios.get(`/api/offers/${id}/`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), 
        },
      });
      setOffer(response.data);
    } catch (err) {
      console.error("Error rejecting offer:", err);
      alert("Failed to reject offer. Please try again.");
    }
  };

  const handleFlagViolation = async () => {
    if (!violationNotes.trim()) {
      alert("Please provide violation notes");
      return;
    }

    try {
      await axios.post(
        `/api/offers/${id}/flag_violation/`,
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
      const response = await axios.get(`/api/offers/${id}/`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), 
        },
      });
      setOffer(response.data);
    } catch (err) {
      console.error("Error flagging violation:", err);
      alert("Failed to flag violation. Please try again.");
    }
  };

  const handleClearViolation = async () => {
    try {
      await axios.post(
        `/api/offers/${id}/clear_violation/`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(), 
          },
        }
      );
      const response = await axios.get(`/api/offers/${id}/`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), 
        },
      });
      setOffer(response.data);
    } catch (err) {
      console.error("Error clearing violation:", err);
      alert("Failed to clear violation. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
          {t('offerStatus.violation')}
        </span>
      );
    }
    if (offer.is_approved) {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          {t('offerStatus.approved')}
        </span>
      );
    }
    if (offer.rejection_reason) {
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
          {t('offerStatus.rejected')}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
        {t('offerStatus.pending')}
      </span>
    );
  };

  if (loading && !offer) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center h-64 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t('offers.offerNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full">
      <button
        onClick={() => navigate('/offers')}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="mr-2" size={18} />
        {t('common.back')}
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{offer.title}</h1>
          <div className="mt-2">{getStatusBadge(offer)}</div>
        </div>
        <div className="text-sm text-gray-500">
          Created: {formatDate(offer.created_at)}
          {offer.updated_at && ` | Last updated: ${formatDate(offer.updated_at)}`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">{t('offers.basicInfo')}</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">{t('offers.vendor')}: </span>
              <span className="text-gray-700">{offer.vendor?.username || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('offers.category')}: </span>
              <span className="text-gray-700">{offer.category?.name || 'Uncategorized'}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('offers.price')}: </span>
              <span className="text-gray-700">{formatPrice(offer.price)}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('offers.status')}: </span>
              <span className="text-gray-700">{getStatusBadge(offer)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">{t('offers.additionalInfo')}</h3>
          <div className="space-y-2">
            {offer.rejection_reason && (
              <div>
                <span className="text-sm text-gray-500">{t('offers.rejectionReason')}: </span>
                <span className="text-gray-700">{offer.rejection_reason}</span>
              </div>
            )}
            {offer.violation_notes && (
              <div>
                <span className="text-sm text-gray-500">{t('offers.violationNotes')}: </span>
                <span className="text-gray-700">{offer.violation_notes}</span>
              </div>
            )}
            {offer.reviewed_by && (
              <div>
                <span className="text-sm text-gray-500">{t('offers.reviewedBy')}: </span>
                <span className="text-gray-700">{offer.reviewed_by.username}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-medium text-gray-700 mb-2">{t('offers.description')}</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-black">
          {offer.description || t('offers.noDescription')}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {!offer.is_approved && !offer.rejection_reason && !offer.has_violation && (
          <>
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <CheckCircle size={18} />
              {t('offers.approve')}
            </button>
            <button
              onClick={() => setShowRejectionModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <XCircle size={18} />
              {t('offers.reject')}
            </button>
          </>
        )}

        {!offer.has_violation ? (
          <button
            onClick={() => setShowViolationModal(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Flag size={18} />
            {t('offers.flagViolation')}
          </button>
        ) : (
          <button
            onClick={handleClearViolation}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Flag size={18} className="line-through" />
            {t('offers.clearViolation')}
          </button>
        )}
      </div>

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
    </div>
  );
};

export default OfferDetailsPage;