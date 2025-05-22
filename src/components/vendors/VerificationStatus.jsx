import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import { useTranslation } from 'react-i18next';

const VerificationStatus = () => {
	const { t, i18n } = useTranslation();
	const [verificationData, setVerificationData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVerificationData = async () => {
			try {
				const response = await api.get("/vendors/");
				const vendors = response.data;
				
				const last7Days = getLast7Days();
				const verificationByDate = {};
				
				last7Days.forEach(date => {
					verificationByDate[date] = {
						date,
						verified: 0,
						unverified: 0
					};
				});
				
				vendors.forEach(vendor => {
					const createdDate = new Date(vendor.created_at).toLocaleDateString('en-US', {
						month: '2-digit',
						day: '2-digit'
					});
					
					if (verificationByDate[createdDate]) {
						if (vendor.is_verified) {
							verificationByDate[createdDate].verified += 1;
						} else {
							verificationByDate[createdDate].unverified += 1;
						}
					}
				});
				
				const chartData = Object.values(verificationByDate);
				
				setVerificationData(chartData);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching verification data:", error);
				setLoading(false);
			}
		};

		fetchVerificationData();
	}, []);

	const getLast7Days = () => {
		const dates = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			dates.push(date.toLocaleDateString('en-US', {
				month: '2-digit',
				day: '2-digit'
			}));
		}
		return dates;
	};

	return (
		<motion.div
			className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className="text-xl font-semibold text-black mb-4">{t('vendors.verificationStatus')}</h2>
			
			{loading ? (
				<div className="flex justify-center items-center h-60">
					<p>{t('common.loading')}</p>
				</div>
			) : (
				<div style={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<LineChart data={verificationData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
							<XAxis dataKey="date" stroke="black" />
							<YAxis stroke="black" />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(31, 41, 55, 0.8)",
									borderColor: "#4B5563",
								}}
								itemStyle={{ color: "#E5E7EB" }}
							/>
							<Legend />
							<Line type="monotone" dataKey="verified" name={t('vendors.verified')} stroke="#10B981" strokeWidth={2} />
							<Line type="monotone" dataKey="unverified" name={t('vendors.unverified')} stroke="#F59E0B" strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			)}
		</motion.div>
	);
};

export default VerificationStatus;