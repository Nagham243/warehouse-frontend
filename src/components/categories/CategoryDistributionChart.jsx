import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#14B8A6", "#F97316", "#A855F7"];

const CategoryDistributionChart = () => {
	const { t, i18n } = useTranslation();
	const [categoryData, setCategoryData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const isRTL = i18n.language === 'ar';

	useEffect(() => {
		const fetchCategoriesWithCount = async () => {
			try {
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/with_subcategory_count/`);
				const formattedData = response.data.map(category => ({
					name: category.name,
					value: category.subcategory_count
				}));
				setCategoryData(formattedData);
				setLoading(false);
			} catch (err) {
				setError(t('charts.categoryDistribution.errorMessage'));
				setLoading(false);
			}
		};

		fetchCategoriesWithCount();
	}, [t]);

	const renderCustomizedLabel = ({ name, percent }) => {
		const formattedPercent = (percent * 100).toFixed(0);
		
		return isRTL 
			? `%${formattedPercent} ${name}` 
			: `${name} ${formattedPercent}%`;
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
	
	if (categoryData.length === 0) return (
		<div className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300">
			<div className="text-center py-6">
				<p className="text-gray-700">{t('charts.categoryDistribution.noData')}</p>
			</div>
		</div>
	);

	return (
		<motion.div
			className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className="text-lg font-medium mb-4 text-black">
				{t('charts.categoryDistribution.title')}
			</h2>
			<div className="h-80 rtl-chart-container">
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<PieChart>
						<Pie
							data={categoryData}
							cx={"50%"}
							cy={"50%"}
							labelLine={false}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
							label={renderCustomizedLabel}
							nameKey="name"
						>
							{categoryData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
								textAlign: isRTL ? 'right' : 'left',
								direction: isRTL ? 'rtl' : 'ltr'
							}}
							itemStyle={{ color: "#E5E7EB" }}
							formatter={(value, name) => {
								return [value, t('charts.categoryDistribution.tooltipLabel')];
							}}
						/>
						<Legend 
							layout={isRTL ? "horizontal" : "horizontal"}
							align={isRTL ? "right" : "center"}
							verticalAlign="bottom"
							formatter={(value) => {
								return <span style={{ direction: isRTL ? 'rtl' : 'ltr' }}>{value}</span>;
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default CategoryDistributionChart;
