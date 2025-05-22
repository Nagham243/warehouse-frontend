import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from 'react-i18next';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const CommissionTypeDistribution = ({ vendorCount, timeCount, offerCount }) => {
  const { t, i18n } = useTranslation();
  const commissionByType = [
    { name: t('commissionTypes.vendorType'), value: vendorCount || 0 },
    { name: t('commissionTypes.timePeriod'), value: timeCount || 0 },
    { name: t('commissionTypes.offerType'), value: offerCount || 0 }
  ];

  const filteredData = commissionByType.filter(item => item.value > 0);

  return (

    <motion.div
      className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-black mb-4">{t('commissionDistribution.title')}</h2>

      {filteredData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-600">
          {t('commissionDistribution.noData')}
        </div>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value) => [`${value} commissions`, ""]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default CommissionTypeDistribution;