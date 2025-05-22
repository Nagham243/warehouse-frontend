import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#F59E0B", "#10B981", "#EF4444", "#6366F1"];


const DealStatusDistribution = () => {
	const { t, i18n } = useTranslation();
	const [statusData, setStatusData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const STATUS_MAPPING = {
		"PENDING": { name: t('dealStatus.pending'), color: COLORS[0] },
		"APPROVED": { name: t('dealStatus.approved'), color: COLORS[1] },
		"REJECTED": { name: t('dealStatus.rejected'), color: COLORS[2] },
		"CANCELLED": { name: t('dealStatus.cancelled'), color: COLORS[3] }
	};

	useEffect(() => {
		const fetchDealStatus = async () => {
			try {
				const response = await fetch('/api/deals/', {
					credentials: 'include',
				});

				if (!response.ok) {
					throw new Error('Failed to fetch deal status data');
				}

				const deals = await response.json();
				
				const statusCounts = {};
				
				deals.forEach(deal => {
					const status = deal.status;
					if (!statusCounts[status]) {
						statusCounts[status] = 0;
					}
					statusCounts[status]++;
				});
				
				const chartData = Object.entries(statusCounts).map(([status, count]) => {
					const displayStatus = STATUS_MAPPING[status] ? 
						STATUS_MAPPING[status].name : 
						status.charAt(0) + status.slice(1).toLowerCase();
						
					return {
						name: displayStatus,
						value: count,
						status: status 
					};
				});
				
				setStatusData(chartData);
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching deal status distribution:', error);
				setError(error.message);
				setIsLoading(false);
			}
		};

		fetchDealStatus();
	}, []);

	if (isLoading) {
		return (
			<motion.div
				className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
			>
				<h2 className='text-xl font-semibold text-black mb-4'>Deal Status Distribution</h2>
				<div className="flex items-center justify-center h-64">
					<p>{t('common.loading')}</p>
				</div>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div
				className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
			>
				<h2 className='text-xl font-semibold text-black mb-4'>{t('deals.statusDistribution')}</h2>
				<div className="flex items-center justify-center h-64">
					<p className="text-red-500">Error: {error}</p>
				</div>
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
			<h2 className='text-xl font-semibold text-black mb-4'>{t('deals.statusDistribution')}</h2>
			
			{statusData.length === 0 ? (
				<div className="flex items-center justify-center h-64">
					<p>{t('deals.noData')}</p>
				</div>
			) : (
				<div style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<PieChart>
							<Pie
								data={statusData}
								cx='50%'
								cy='50%'
								outerRadius={80}
								fill='#8884d8'
								dataKey='value'
								label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
							>
								{statusData.map((entry, index) => {
									const statusKey = entry.status;
									const color = STATUS_MAPPING[statusKey] ? 
										STATUS_MAPPING[statusKey].color : 
										COLORS[index % COLORS.length];
										
									return <Cell key={`cell-${index}`} fill={color} />;
								})}
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

export default DealStatusDistribution;