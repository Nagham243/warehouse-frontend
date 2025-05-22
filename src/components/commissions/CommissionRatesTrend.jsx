import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-xl">
        <p className="font-semibold text-blue-300 mb-1">{label}</p> 
        <p className="text-green-200">{`Avg. Rate: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const CommissionRatesTrend = () => {
  const { t } = useTranslation();
  const [commissionData, setCommissionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };
  const formatTypeName = (type) => {
    const typeMap = {
      'vendor_type': t('charts.commissionTypes.vendor'),
      'time_period': t('charts.commissionTypes.timePeriod'),
      'offer_type': t('charts.commissionTypes.offer')
    };
    return typeMap[type] || type;
  };

  useEffect(() => {
    const fetchCommissionRates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchTypeData = async (type) => {
          try {
            const response = await axios.get('/api/commissions/', {
              params: { 
                commission_type: type,
                is_active: true 
              },
              headers: {
                'X-CSRFToken': getCsrfToken(),
              },
              withCredentials: true,
            });
            
            if (!response.data || response.data.length === 0) {
              return null;
            }
            
            const validItems = response.data.filter(item => item.percentage !== undefined && item.percentage !== null);
            if (validItems.length === 0) return null;
            
            const sum = validItems.reduce((total, item) => total + parseFloat(item.percentage), 0);
            const average = parseFloat((sum / validItems.length).toFixed(2));
            return isNaN(average) ? null : average;
          } catch (err) {
            console.error(`Error fetching ${type} commissions:`, err);
            return null;
          }
        };

        const types = ['vendor_type', 'time_period', 'offer_type'];
        const results = await Promise.all(types.map(fetchTypeData));
        
        const chartData = types
          .map((type, index) => ({
            name: type.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
            rate: results[index] || 0
          }))
          .filter(item => item.rate !== null);

        setCommissionData(chartData);
      } catch (err) {
        console.error("Error fetching commission data:", err);
        setError("Failed to load commission data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionRates();
  }, []);

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-black mb-4">{t('charts.commissionRates.title')}</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Loading commission data...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-600">
          {error}
        </div>
      ) : commissionData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-600">
          {t('charts.commissionRates.noData')}
        </div>
      ) : (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={commissionData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="black"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="black" 
                domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 10) * 1.2))]} 
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="rate" 
                fill="#10B981" 
                name={t('charts.commissionRates.rate')} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default CommissionRatesTrend;