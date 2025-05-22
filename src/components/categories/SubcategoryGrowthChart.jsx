import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const SubcategoryGrowthChart = () => {
  const { t, i18n } = useTranslation();
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchCategoryGrowthData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get("/api/subcategories/");
        
        const subcategoriesByMonth = processSubcategoryData(response.data);
        
        setGrowthData(subcategoriesByMonth);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch subcategory growth data:", err);
        setError(t('charts.subcategoryGrowth.errorMessage', { 
          error: (err.response?.data?.detail || err.message) 
        }));
        setLoading(false);
      }
    };

    fetchCategoryGrowthData();
  }, [t]);

  const processSubcategoryData = (subcategories) => {
    if (!subcategories || subcategories.length === 0) {
      return [];
    }

    const sortedSubcategories = [...subcategories].sort((a, b) => {
      return new Date(a.created_at) - new Date(b.created_at);
    });

    const months = [];
    const counts = {};
    
    let earliestDate = new Date(sortedSubcategories[0].created_at);
    let latestDate = new Date();
    

    let currentDate = new Date(earliestDate);
    currentDate.setDate(1); 
    
    while (currentDate <= latestDate) {
      const monthKey = currentDate.toLocaleString(i18n.language, { month: 'short' }) + 
                      " " + currentDate.getFullYear();
      months.push(monthKey);
      counts[monthKey] = 0;
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    let cumulativeCount = 0;
    sortedSubcategories.forEach(subcategory => {
      const date = new Date(subcategory.created_at);
      const monthKey = date.toLocaleString(i18n.language, { month: 'short' }) + 
                      " " + date.getFullYear();
      
      cumulativeCount++;
      
      for (let i = months.indexOf(monthKey); i < months.length; i++) {
        counts[months[i]] = Math.max(counts[months[i]], cumulativeCount);
      }
    });
    
    return months.map(month => ({
      month,
      subcategories: counts[month]
    }));
  };

  const useDemoDataIfEmpty = (data) => {
    if (data.length === 0) {
      const demoMonths = ["Jan", "Feb", "Mar", "Apr", "May"].map(month => {
        const date = new Date(`${month} 1, 2025`);
        return date.toLocaleString(i18n.language, { month: 'short' }) + " 2025";
      });

      return [
        { month: demoMonths[0], subcategories: 12 },
        { month: demoMonths[1], subcategories: 18 },
        { month: demoMonths[2], subcategories: 25 },
        { month: demoMonths[3], subcategories: 32 },
        { month: demoMonths[4], subcategories: 40 }
      ];
    }
    return data;
  };

  if (loading) return (
    <div className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300">
      <div className="text-center py-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-700">{t('charts.loading')}</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300">
      <div className="text-center py-6">
        <div className="inline-block rounded-full h-8 w-8 bg-red-500 text-white flex items-center justify-center">!</div>
        <p className="mt-2 text-red-600">{error}</p>
        <button 
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          onClick={() => window.location.reload()}
        >
          {t('common.retry')}
        </button>
      </div>
    </div>
  );

  const displayData = useDemoDataIfEmpty(growthData);

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-black mb-4">
        {t('charts.subcategoryGrowth.title')}
      </h2>
      <div className="rtl-chart-container" style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart 
            data={displayData}
            layout={isRTL ? "horizontal" : "horizontal"}
            mirror={isRTL}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="black"
              tick={{ fill: 'black' }}
              tickFormatter={(value) => {
                return value.substring(0, 3);
              }}
              reversed={isRTL} 
            />
            <YAxis 
              stroke="black"
              tick={{ fill: 'black' }}
              tickFormatter={(value) => Math.round(value)}
              orientation={isRTL ? "right" : "left"} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#4B5563",
                color: "black"
              }}
              formatter={(value) => [value, t('charts.subcategoryGrowth.tooltip')]}
            />
            <Legend formatter={(value) => t('charts.subcategoryGrowth.legend')} />
            <Line 
              type="monotone" 
              dataKey="subcategories" 
              name={t('charts.subcategoryGrowth.legend')} 
              stroke="#8B5CF6" 
              strokeWidth={2} 
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {growthData.length === 0 && (
        <div className="text-center mt-2 text-gray-500 text-sm italic">
          {t('charts.subcategoryGrowth.demoDataNotice')}
        </div>
      )}
    </motion.div>
  );
};

export default SubcategoryGrowthChart;