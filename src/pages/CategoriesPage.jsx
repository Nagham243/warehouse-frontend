import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { FolderTree, FileSpreadsheet, Layers, CircleAlert } from "lucide-react";
import CategoryDistributionChart from "../components/categories/CategoryDistributionChart";
import SubcategoryGrowthChart from "../components/categories/SubcategoryGrowthChart";
import CategoryTable from "../components/categories/CategoryTable";
import { useState, useEffect } from "react";
import axios from "axios";
import "../i18n"; 

const CategoriesPage = () => {
	const { t } = useTranslation();
	const [stats, setStats] = useState({
		totalCategories: 0,
		totalSubcategories: 0,
		emptyCategories: 0,
		averageSubcategories: 0
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCategoryStats = async () => {
			try {
				const categoriesResponse = await axios.get("/api/categories/with_subcategory_count/");
				const subcategoriesResponse = await axios.get("/api/subcategories/");
				
				const totalCategories = categoriesResponse.data.length;
				const totalSubcategories = subcategoriesResponse.data.length;
				const emptyCategories = categoriesResponse.data.filter(c => c.subcategory_count === 0).length;
				const averageSubcategories = totalCategories > 0 ? 
					parseFloat((totalSubcategories / totalCategories).toFixed(1)) : 0;
				
				setStats({
					totalCategories,
					totalSubcategories,
					emptyCategories,
					averageSubcategories
				});
				
				setLoading(false);
			} catch (err) {
				console.error("Failed to fetch category stats:", err);
				setLoading(false);
			}
		};
		
		fetchCategoryStats();
	}, []);

	const { i18n } = useTranslation(); 

	useEffect(() => {
		const savedLanguage = localStorage.getItem('language');
		if (savedLanguage) {
			i18n.changeLanguage(savedLanguage); 
			document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
		}
	}, [i18n]);

	return (
		<div className="flex-1 overflow-auto relative z-10">
			<Header title={t('categories.title')} />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* STATS */}
				<motion.div
					className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard 
						name={t('categories.stats.categories')} 
						icon={FolderTree} 
						value={loading ? "..." : stats.totalCategories} 
						color="#6366F1" 
					/>
					<StatCard 
						name={t('categories.stats.subcategories')} 
						icon={FileSpreadsheet} 
						value={loading ? "..." : stats.totalSubcategories} 
						color="#10B981" 
					/>
					<StatCard 
						name={t('categories.stats.emptyCategories')} 
						icon={CircleAlert} 
						value={loading ? "..." : stats.emptyCategories} 
						color="#F59E0B" 
					/>
					<StatCard 
						name={t('categories.stats.avgSubcategories')} 
						icon={Layers} 
						value={loading ? "..." : stats.averageSubcategories} 
						color="#EF4444" 
					/>
				</motion.div>

				<CategoryTable />

				{/* CHARTS */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<SubcategoryGrowthChart />
					<CategoryDistributionChart />
				</div>
			</main>
		</div>
	);
};

export default CategoriesPage;