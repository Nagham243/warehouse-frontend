import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";
import { useUsers } from "../hooks/useUsers";
import { useTranslation } from 'react-i18next';


const OverviewPage = () => {
	const { stats,loading} = useUsers();
	const { t, i18n } = useTranslation();

	const getCsrfToken = () => {
		const cookieValue = document.cookie
		  .split('; ')
		  .find(row => row.startsWith('csrftoken='))
		  ?.split('=')[1];
		return cookieValue;
	  };

	  useEffect(() => {
		const fetchApprovedOffers = async () => {
		  try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/?is_approved=true`, {
			  headers: {
				'Content-Type': 'application/json',
				"X-CSRFToken": getCsrfToken(), 
			  },
			 credentials: 'include',
			});
			
			if (!response.ok) {
			  throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			setOffers(data);
		  } catch (err) {
			console.error("Error fetching offers:", err);
			setError(err.message);
		  } finally {
			setLoading(false);
		  }
		};
	
		fetchApprovedOffers();
	  }, []);
	
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title={t('overview.title')} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name={t('overview.totalSales')}  icon={Zap} value='$0' color='#6366F1' />
					<StatCard name={t('overview.newUsers')}  icon={Users} value={loading ? t('common.loading') : stats?.newUsersToday ?? t('common.na')}  color='#8B5CF6' />
					<StatCard name={t('overview.totalProducts')}  icon={ShoppingBag} value={offers.length} color='#EC4899' />
					<StatCard name={t('overview.conversionRate')}  icon={BarChart2} value='0%' color='#10B981' />
				</motion.div>

				{/* CHARTS */}

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<SalesOverviewChart />
					<CategoryDistributionChart />
					<SalesChannelChart />
				</div>
			</main>
		</div>
	);
};
export default OverviewPage;
