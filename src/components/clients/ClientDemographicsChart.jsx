import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useClients } from '../../hooks/useClients';

const ClientDemographicsChart = () => {
  const { stats, loading } = useClients();
  
  const defaultData = [
    { type: 'Enterprise', count: 0 },
    { type: 'Mid-Market', count: 0 },
    { type: 'Small Business', count: 0 },
    { type: 'Startup', count: 0 },
    { type: 'Individual', count: 0 },
  ];
  
  const data = stats?.demographics || defaultData;
  
  const getBarColor = (type) => {
    const colorMap = {
      'Enterprise': '#6366F1',      
      'Mid-Market': '#F59E0B',      
      'Small Business': '#10B981', 
      'Startup': '#8B5CF6', 
      'Individual': '#EF4444',   
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
      <h2 className="text-xl font-semibold mb-4 text-black">Client Demographics</h2>
      
      {loading ? (
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
                value: 'Clients', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#1F2937'
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F3F4F6', 
                borderColor: '#E5E7EB',
                color: '#1F2937'
              }}
            />
            <Bar 
              dataKey="count" 
              name="Number of Clients"
              fill="#6366F1"
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

export default ClientDemographicsChart;