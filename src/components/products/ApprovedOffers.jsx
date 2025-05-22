import { motion } from "framer-motion";
import { CheckCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const ApprovedOffers = ({ offers }) => {
    const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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


  const sortedOffers = [...offers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md rounded-xl shadow-md p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          {t('offers.approvedOffersTitle')}
        </h2>
      </div>

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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOffers.map((offer) => (
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
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  {t('offerStatus.approved')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {offers.length === 0 && (
        <div className="px-6 py-4 text-center text-sm text-gray-500">
          No approved offers found
        </div>
      )}
    </motion.div>
  );
};

export default ApprovedOffers;