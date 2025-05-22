import { useState, useEffect } from "react";
import { CheckCircle, Clock, DollarSign, AlertTriangle, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DailyDeals from "../components/deals/DailyDeals";
import DealStatusDistribution from "../components/deals/DealStatusDistribution";
import DealsTable from "../components/deals/DealsTable";

const DealsPage = () => {
	const { t, i18n } = useTranslation();
	const [dealStats, setDealStats] = useState({
		totalDeals: "0",
		pendingDeals: "0",
		approvedDeals: "0",
		rejectedDeals: "0",
		totalAmount: "$0",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDealStats = async () => {
			try {
				const totalResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/`, {
					credentials: 'include',
				});
				
				const pendingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/pending_deals/`, {
					credentials: 'include',
				});
				
				const approvedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/approved_deals/`, {
					credentials: 'include',
				});
				
				const rejectedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/rejected_deals/`, {
					credentials: 'include',
				});

				if (!totalResponse.ok || !pendingResponse.ok || !approvedResponse.ok || !rejectedResponse.ok) {
					throw new Error('Failed to fetch deals data');
				}

				const totalDeals = await totalResponse.json();
				const pendingDeals = await pendingResponse.json();
				const approvedDeals = await approvedResponse.json();
				const rejectedDeals = await rejectedResponse.json();

				const totalAmount = totalDeals.reduce((sum, deal) => sum + deal.amount, 0);

				setDealStats({
					totalDeals: totalDeals.length.toLocaleString(),
					pendingDeals: pendingDeals.length.toLocaleString(),
					approvedDeals: approvedDeals.length.toLocaleString(),
					rejectedDeals: rejectedDeals.length.toLocaleString(),
					totalAmount: `$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
				});
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching deal stats:', error);
				setError(error.message);
				setIsLoading(false);
			}
		};

		fetchDealStats();
	}, []);

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<p className="text-xl">{t('common.loading')}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<p className="text-xl text-red-500">Error: {error}</p>
			</div>
		);
	}

	return (
		<div className='flex-1 relative z-10 overflow-auto'>
			<Header title={t('deals.title')} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard 
						name={t('deals.totalDeals')} 
						icon={Briefcase} 
						value={dealStats.totalDeals} 
						color='#6366F1' 
					/>
					<StatCard 
						name={t('deals.pendingDeals')} 
						icon={Clock} 
						value={dealStats.pendingDeals} 
						color='#F59E0B' 
					/>
					<StatCard
						name={t('deals.approvedDeals')}
						icon={CheckCircle}
						value={dealStats.approvedDeals}
						color='#10B981'
					/>
					<StatCard 
						name={t('deals.rejectedDeals')} 
						icon={AlertTriangle} 
						value={dealStats.rejectedDeals} 
						color='#EF4444' 
					/>
					<StatCard 
						name={t('deals.totalAmount')} 
						icon={DollarSign} 
						value={dealStats.totalAmount} 
						color='#8B5CF6' 
					/>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<DailyDeals />
					<DealStatusDistribution />
				</div>

				<DealsTable />
			</main>
		</div>
	);
};

export default DealsPage;
