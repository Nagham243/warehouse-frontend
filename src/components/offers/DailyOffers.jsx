import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const DailyOffers = () => {
	const { t, i18n } = useTranslation();
	const [dailyOffersData, setDailyOffersData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDailyOffers = async () => {
			try {
				const response = await axios.get("/api/offers/", {
					withCredentials: true,
				});
				
				const offers = response.data;
				const last7Days = getLast7Days();
				
				const offersByDate = {};
				last7Days.forEach(day => {
					offersByDate[day] = 0;
				});
				
				offers.forEach(offer => {
					const offerDate = new Date(offer.created_at).toLocaleDateString('en-US', {
						month: '2-digit',
						day: '2-digit'
					});
					
					if (offersByDate[offerDate] !== undefined) {
						offersByDate[offerDate]++;
					}
				});
				
				const chartData = Object.keys(offersByDate).map(date => ({
					date,
					offers: offersByDate[date]
				}));
				
				setDailyOffersData(chartData);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching daily offers data:", err);
				setError("Failed to load daily offers data");
				setLoading(false);
				
				const fallbackData = [
					{ date: "05/07", offers: 8 },
					{ date: "05/08", offers: 12 },
					{ date: "05/09", offers: 7 },
					{ date: "05/10", offers: 14 },
					{ date: "05/11", offers: 10 },
					{ date: "05/12", offers: 16 },
					{ date: "05/13", offers: 9 },
				];
				setDailyOffersData(fallbackData);
			}
		};

		fetchDailyOffers();
	}, []);

	const getLast7Days = () => {
		const result = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const formattedDate = date.toLocaleDateString('en-US', {
				month: '2-digit',
				day: '2-digit'
			});
			result.push(formattedDate);
		}
		return result;
	};

	if (loading && !dailyOffersData.length) {
		return (
			<motion.div
				className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300 flex items-center justify-center'
				style={{ height: '300px' }}
			>
				Loading offer data...
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
			<h2 className='text-xl font-semibold text-black mb-4'>{t('offers.dailySubmissions')}</h2>
			{error && <div className="text-red-500 mb-4">{error}</div>}
			
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={dailyOffersData}>
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
						<Line type='monotone' dataKey='offers' name={t('offers.newOffers')}  stroke='#8B5CF6' strokeWidth={2} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default DailyOffers;