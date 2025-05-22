import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1"];

const OfferDistribution = () => {
	const { t, i18n } = useTranslation();
	const [offerStatusData, setOfferStatusData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOfferDistribution = async () => {
			try {
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/offers/`, {
					withCredentials: true,
				});
				
				const offers = response.data;
				
				const approved = offers.filter(offer => offer.is_approved).length;
				const pending = offers.filter(offer => !offer.is_approved && !offer.rejection_reason).length;
				const rejected = offers.filter(offer => !offer.is_approved && offer.rejection_reason).length;
				const violations = offers.filter(offer => offer.has_violation).length;
				
				const distribution = [
					{ name: t('offerStatus.approved'), value: approved },
					{ name: t('offerStatus.pending'), value: pending },
					{ name: t('offerStatus.rejected'), value: rejected },
					{ name: t('offerStatus.violations'), value: violations }
				].filter(item => item.value > 0); 
				
				setOfferStatusData(distribution);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching offer distribution data:", err);
				setError("Failed to load offer distribution data");
				setLoading(false);
				
				const fallbackData = [
					{ name: "Approved", value: 65 },
					{ name: "Pending", value: 20 },
					{ name: "Rejected", value: 10 },
					{ name: "Violations", value: 5 }
				];
				setOfferStatusData(fallbackData);
			}
		};

		fetchOfferDistribution();
	}, []);

	if (loading && !offerStatusData.length) {
		return (
			<motion.div
				className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300 flex items-center justify-center'
				style={{ height: '300px' }}
			>
				Loading offer distribution...
			</motion.div>
		);
	}
	

	return (
		<motion.div
			className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-black mb-4'>{t('offers.statusDistribution')}</h2>
			{error && <div className="text-red-500 mb-4">{error}</div>}
			
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={offerStatusData}
							cx='50%'
							cy='50%'
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{offerStatusData.map((entry, index) => (
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
		</motion.div>
	);
};
export default OfferDistribution;
