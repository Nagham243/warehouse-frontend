import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslation } from 'react-i18next';
const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

const CategoryDistributionChart = () => {
	const { t, i18n } = useTranslation();
	const [categoryData, setCategoryData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCategoryData = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/with_subcategory_count/`);
				if (!response.ok) throw new Error("Failed to fetch category data");
				const data = await response.json();

				if (Array.isArray(data)) {
					const chartData = data.map((category, index) => ({
						name: category.name,
						value: category.subcategory_count || 0,
						color: COLORS[index % COLORS.length]
					}));  
					
					setCategoryData(chartData);
				}
			} catch (err) {
				console.error("Error fetching category data:", err);
				setError("Failed to load category distribution");
				
				setCategoryData([
					{ name: "Electronics", value: 12, color: COLORS[0] },
					{ name: "Clothing", value: 8, color: COLORS[1] },
					{ name: "Home & Garden", value: 15, color: COLORS[2] },
					{ name: "Sports", value: 6, color: COLORS[3] },
					{ name: "Beauty", value: 4, color: COLORS[4] }
				]);
			} finally {
				setLoading(false);
			}
		};

		fetchCategoryData();
	}, []);

	if (loading) {
		return (
			<div className="bg-gray-300 bg-opacity-50 backdrop-blur-md p-6 rounded-lg shadow-md">
				<h2 className="text-lg font-medium text-gray-900 mb-4">{t('charts.categoryDistribution.title')}</h2>
				<div className="h-64 w-full flex items-center justify-center">
					<div className="animate-pulse flex space-x-4">
						<div className="flex-1 space-y-6 py-1">
							<div className="h-60 bg-gray-200 rounded-full"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-lg font-medium text-gray-900 mb-4">{t('charts.categoryDistribution.title')}</h2>
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error}
				</div>
			</div>
		);
	}

	if (categoryData.length === 0) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-lg font-medium text-gray-900 mb-4">{t('charts.categoryDistribution.title')}</h2>
				<div className="h-64 w-full flex items-center justify-center text-gray-500">
					No category data available
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-300 bg-opacity-50 backdrop-blur-md p-6 rounded-lg shadow-md">
			<h2 className="text-lg font-medium text-gray-900 mb-4">{t('charts.categoryDistribution.title')}</h2>
			<div className="h-64 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={categoryData}
							cx="50%"
							cy="50%"
							labelLine={false}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
							nameKey="name"
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{categoryData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip formatter={(value) => [`${value} subcategories`, "Count"]} />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default CategoryDistributionChart;
