import { CheckCircle, AlertTriangle, DollarSign, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DailyOffers from "../components/offers/DailyOffers";
import OfferDistribution from "../components/offers/OfferDistribution";
import OffersTable from "../components/offers/OffersTable";

const OffersPage = () => {
	const { t, i18n } = useTranslation();
	const [offerStats, setOfferStats] = useState({
		totalOffers: "0",
		pendingOffers: "0",
		approvedOffers: "0",
		violationOffers: "0",
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOfferStats = async () => {
			try {
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/offers/`, {
					withCredentials: true,
				});
				
				const offers = response.data;
				const stats = {
					totalOffers: offers.length.toString(),
					pendingOffers: offers.filter(offer => !offer.is_approved && !offer.rejection_reason).length.toString(),
					approvedOffers: offers.filter(offer => offer.is_approved).length.toString(),
					violationOffers: offers.filter(offer => offer.has_violation).length.toString()
				};
				
				setOfferStats(stats);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching offer statistics:", err);
				setError("Failed to load offer statistics");
				setLoading(false);
			}
		};

		fetchOfferStats();
	}, []);

	if (loading) return <div className="flex-1 flex items-center justify-center">{t('common.loading')}</div>;
	if (error) return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>;
	
	return (
		<div className='flex-1 relative z-10 overflow-auto'>
			<Header title={t('offers.title')} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name={t('offers.totalOffers')}  icon={Package} value={offerStats.totalOffers} color='#6366F1' />
					<StatCard name={t('offers.pendingApproval')} icon={AlertTriangle} value={offerStats.pendingOffers} color='#F59E0B' />
					<StatCard
						name={t('offers.approvedOffers')}
						icon={CheckCircle}
						value={offerStats.approvedOffers}
						color='#10B981'
					/>
					<StatCard name={t('offers.policyViolations')}  icon={AlertTriangle} value={offerStats.violationOffers} color='#EF4444' />
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<DailyOffers />
					<OfferDistribution />
				</div>

				<OffersTable />
			</main>
		</div>
	);
};
export default OffersPage;
