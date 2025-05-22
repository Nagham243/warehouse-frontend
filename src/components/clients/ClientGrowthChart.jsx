import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useClients } from '../../hooks/useClients';

const ClientGrowthChart = () => {
  const { stats, loading } = useClients();
  
  const generateDefaultData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        count: 0
      });
    }
    
    return data;
  };
  
  const data = stats?.growthData || generateDefaultData();
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-black">Client Growth (Last 30 Days)</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading growth data...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#1F2937' }}
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fill: '#1F2937' }}
              label={{ 
                value: 'New Clients', 
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
              labelFormatter={formatDate}
            />
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <Line 
              type="monotone" 
              dataKey="count" 
              name="New Clients"
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: '#6366F1' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#6366F1' }}
              isAnimationActive={true}
              animationDuration={1500}
              fill="url(#colorGrowth)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default ClientGrowthChart;