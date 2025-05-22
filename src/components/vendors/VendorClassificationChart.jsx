import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTranslation } from 'react-i18next';
import api from "../../services/api";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"];

const VendorClassificationChart = () => {
	const { t } = useTranslation();
	const [classificationData, setClassificationData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchClassificationData = async () => {
			try {
				const response = await api.get("/vendors/classification_summary/");
				
				const formattedData = response.data.map(item => ({
					name: formatClassificationName(item.classification),
					value: item.count
				}));
				
				setClassificationData(formattedData);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching classification data:", error);
				setLoading(false);
			}
		};

		fetchClassificationData();
	}, []);

	const formatClassificationName = (classification) => {
		return classification
			.toLowerCase()
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	return (
		<motion.div
			className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className="text-xl font-semibold text-black mb-4">{t('vendors.classificationDistribution')}</h2>
			
			{loading ? (
				<div className="flex justify-center items-center h-60">
					<p>Loading chart data...</p>
				</div>
			) : (
				<div style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<PieChart>
							<Pie
								data={classificationData}
								cx="50%"
								cy="50%"
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
								label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
							>
								{classificationData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(31, 41, 55, 0.8)",
									borderColor: "#4B5563",
								}}
								itemStyle={{ color: "#E5E7EB" }}
							/>
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>
			)}
		</motion.div>
	);
};

export default VendorClassificationChart;