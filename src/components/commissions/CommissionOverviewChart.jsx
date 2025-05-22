import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const CommissionOverviewChart = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("6 Months");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissionHistory = async () => {
      try {
        setLoading(true);
        
        // const response = await axios.get('/api/commissions/history', {
        //   params: { timeRange: selectedTimeRange },
        //   withCredentials: true
        // });
        // setChartData(response.data);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        let range = 6;
        if (selectedTimeRange === "3 Months") range = 3;
        if (selectedTimeRange === "12 Months") range = 12;
        
        const data = [];
        
        for (let i = range - 1; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          data.push({
            month: months[monthIndex],
            'Average Rate': Math.random() * 5 + 10, 
            'Total Commissions': Math.floor(Math.random() * 20) + 30, 
          });
        }
        
        setChartData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching commission history:", err);
        setLoading(false);
      }
    };

    fetchCommissionHistory();
  }, [selectedTimeRange]);

  return (
    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Commission Rates Overview</h2>

        <select
          className="bg-gray-300 text-black rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option>3 Months</option>
          <option>6 Months</option>
          <option>12 Months</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">Loading chart data...</div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="black" />
              <YAxis stroke="black" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
                itemStyle={{ color: "#E5E7EB" }}
              />
              <Area 
                type="monotone" 
                dataKey="Average Rate" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3} 
                name="Avg. Commission %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default CommissionOverviewChart;