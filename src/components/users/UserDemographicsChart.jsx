import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UserDemographicsChart = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const defaultData = [
    { type: 'Client', count: 0 },
    { type: 'Vendor', count: 0 },
    { type: 'Technical Support', count: 0 },
    { type: 'Financial Manager', count: 0 },
    { type: 'Super Admin', count: 0 },
  ];
  const requests = [
    axios.get('/api/users/clients/').then(res => ({ type: t('users.types.client'), count: res.data.length })),
    axios.get('/api/users/vendors/').then(res => ({ type: t('users.types.vendor'), count: res.data.length })),
    axios.get('/api/users/technical_support/').then(res => ({ type: t('users.types.technicalSupport'), count: res.data.length })),
    axios.get('/api/users/financial_managers/').then(res => ({ type: t('users.types.financialManager'), count: res.data.length })),
  ];
  
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        setLoading(true);

        const results = await Promise.all(requests);
        setData(results);
        
      } catch (err) {
        console.error('Failed to fetch demographics:', err);
        setError('Failed to load demographic data');
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDemographics();
    
    // Optional: Set up polling if you want real-time updates
    const intervalId = setInterval(fetchDemographics, 300000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getBarColor = (type) => {
    const colorMap = {
      'Client': '#6366F1',      
      'Vendor': '#F59E0B',      
      'Technical Support': '#10B981', 
      'Financial Manager': '#8B5CF6', 
      'Super Admin': '#EF4444',   
      'Unspecified': '#6B7280',  
    };
    
    return colorMap[type] || '#6B7280'; 
  };

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-black">{t('users.demographicsTitle')}</h2>
      
      {error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading demographics data...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" />
            <XAxis 
              dataKey="type" 
              tick={{ fill: '#1F2937' }}
            />
            <YAxis 
              tick={{ fill: '#1F2937' }}
              label={{ 
                value: t('users.numberOfUsers'), 
                angle: -90, 
                position: 'insideLeft',
                fill: '#1F2937'
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F3F4F6', 
                borderColor: '#E5E7EB',
                color: '#1F2937',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [value, t('users.numberOfUsers')]}
              labelFormatter={(label) => `${t('users.userType')}: ${label}`}
            />
            <Bar 
              dataKey="count" 
              name="Number of Users"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.8}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <motion.rect 
                  key={`bar-${index}`}
                  fill={getBarColor(entry.type)}
                  initial={{ y: 300, height: 0 }}
                  animate={{ y: 0, height: 'auto' }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default UserDemographicsChart;