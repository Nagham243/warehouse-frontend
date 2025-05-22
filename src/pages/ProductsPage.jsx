import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { useTranslation } from 'react-i18next';
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/products/SalesTrendChart";
import ProductsTable from "../components/products/ProductsTable";
import ApprovedOffers from "../components/products/ApprovedOffers";

const approvedOffers = [
	{
	  id: 1,
	  title: "Premium Quality T-Shirt",
	  description: "High quality cotton t-shirt with premium stitching and durable print.",
	  price: 29.99,
	  category: "Clothing",
	  vendor: "Fashion Co."
	},
	{
	  id: 2,
	  title: "Wireless Bluetooth Earbuds",
	  description: "Latest model with noise cancellation and 24hr battery life.",
	  price: 89.99,
	  category: "Electronics",
	  vendor: "SoundTech"
	},
	{
	  id: 3,
	  title: "Organic Green Tea",
	  description: "100% organic green tea leaves sourced from sustainable farms.",
	  price: 12.99,
	  category: "Food",
	  vendor: "Nature's Best"
	},
  ];

const ProductsPage = () => {
	const { t, i18n } = useTranslation();
	const [offers, setOffers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
			  }
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
			<Header title={t('products.title')} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name={t('products.totalproducts')} icon={Package} value={offers.length} color='#6366F1' />
					<StatCard name={t('products.topselling')} icon={TrendingUp} value={0} color='#10B981' />
					<StatCard name={t('products.lowstock')} icon={AlertTriangle} value={0} color='#F59E0B' />
					<StatCard name={t('products.totalrevenue')} icon={DollarSign} value={"$0"} color='#EF4444' />
				</motion.div>

				
				{/* Approved Offers Section */}
				{loading ? (
				<div className="text-center py-8">Loading offers...</div>
				) : error ? (
				<div className="text-red-500 py-8">Error loading offers: {error}</div>
				) : (
				<ApprovedOffers offers={offers} />
				)}

				{/* CHARTS */}
				<div className='grid grid-col-1 lg:grid-cols-2 gap-8'>
					<SalesTrendChart />
					<CategoryDistributionChart />
				</div>
			</main>
		</div>
	);
};
export default ProductsPage;
