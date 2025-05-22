import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DailyDeals = () => {
	const { t, i18n } = useTranslation();
	const [dailyDealsData, setDailyDealsData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDailyDeals = async () => {
			try {
				const today = new Date();
				
				const startDate = new Date();
				startDate.setDate(today.getDate() - 6);
				
				const formatDateForAPI = (date) => {
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}`;
				};
				
				const endDateFormatted = formatDateForAPI(today);
				const startDateFormatted = formatDateForAPI(startDate);
				
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/?ordering=created_at&created_at__gte=${startDateFormatted}&created_at__lte=${endDateFormatted}`, {
					credentials: 'include',
				});

				if (!response.ok) {
					throw new Error('Failed to fetch daily deals data');
				}

				const dealsData = await response.json();
				
				const groupedByDate = {};
				
				let currentDate = new Date(startDate);
				while (currentDate <= today) {
					const dateStr = formatDateForAPI(currentDate);
					groupedByDate[dateStr] = 0;
					
					currentDate.setDate(currentDate.getDate() + 1);
				}
				
				dealsData.forEach(deal => {
					const dealDate = deal.created_at.split('T')[0]; 
					if (groupedByDate[dealDate] !== undefined) {
						groupedByDate[dealDate]++;
					}
				});
				
				const chartData = Object.entries(groupedByDate).map(([date, count]) => {
					const [year, month, day] = date.split('-');
					return {
						date: `${month}/${day}`,
						deals: count
					};
				});
				
				chartData.sort((a, b) => {
					const dateA = new Date(`2023-${a.date.replace('/', '-')}`);
					const dateB = new Date(`2023-${b.date.replace('/', '-')}`);
					return dateA - dateB;
				});
				
				setDailyDealsData(chartData);
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching daily deals:', error);
				setError(error.message);
				setIsLoading(false);
			}
		};

		fetchDailyDeals();
	}, []);

	if (isLoading) {
		return (
			<motion.div
				className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
			>
				<h2 className='text-xl font-semibold text-black mb-4'>{t('deals.dailyDeals')}</h2>
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
				transition={{ delay: 0.2 }}
			>
				<h2 className='text-xl font-semibold text-black mb-4'>{t('deals.dailyDeals')}</h2>
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
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold text-black mb-4'>{t('deals.dailyDeals')}</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={dailyDealsData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='date' stroke='black' />
						<YAxis stroke='black' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Line type='monotone' dataKey='deals' stroke='#8B5CF6' strokeWidth={2} name={t('deals.deals')} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default DailyDeals;
