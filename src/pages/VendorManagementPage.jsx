import { useState, useEffect } from "react";
import { Building2, CheckCircle, Clock, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import VendorClassificationChart from "../components/vendors/VendorClassificationChart";
import VerificationStatus from "../components/vendors/VerificationStatus";
import VendorsTable from "../components/vendors/VendorsTable";
import api from "../services/api";

const VendorManagementPage = () => {
	const { t, i18n } = useTranslation();
  	const isRTL = i18n.language === 'ar';
	const [vendorStats, setVendorStats] = useState({
		totalVendors: 0,
		pendingVerification: 0,
		verifiedVendors: 0,
		premiumVendors: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVendorStats = async () => {
			try {
				const vendorsResponse = await api.get("/vendors/");
				const vendors = vendorsResponse.data;
				
				const unverifiedResponse = await api.get("/vendors/unverified_vendors/");
				const unverifiedVendors = unverifiedResponse.data;
				
				const classificationResponse = await api.get("/vendors/classification_summary/");
				const classificationData = classificationResponse.data;
				
				const premiumVendorsCount = classificationData.find(
					item => item.classification === "PREMIUM"
				)?.count || 0;
				
				setVendorStats({
					totalVendors: vendors.length,
					pendingVerification: unverifiedVendors.length,
					verifiedVendors: vendors.filter(vendor => vendor.is_verified).length,
					premiumVendors: premiumVendorsCount,
				});
				
				setLoading(false);
			} catch (error) {
				console.error("Error fetching vendor stats:", error);
				setLoading(false);
			}
		};

		fetchVendorStats();
	}, []);

	return (
		<div className="flex-1 relative z-10 overflow-auto">
			<Header title={t('vendors.title')} />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<p className="text-lg">{t('common.loading')}</p>
					</div>
				) : (
					<>
						<motion.div
							className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1 }}
						>
							<StatCard name={t('vendors.totalVendors')} icon={Building2} value={vendorStats.totalVendors} color="#6366F1" />
							<StatCard name={t('vendors.pendingVerification')} icon={Clock} value={vendorStats.pendingVerification} color="#F59E0B" />
							<StatCard name={t('vendors.verifiedVendors')}  icon={CheckCircle} value={vendorStats.verifiedVendors} color="#10B981" />
							<StatCard name={t('vendors.premiumVendors')}  icon={UserCheck} value={vendorStats.premiumVendors} color="#EF4444" />
						</motion.div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
							<VendorClassificationChart />
							<VerificationStatus />
						</div>

						<VendorsTable />
					</>
				)}
			</main>
		</div>
	);
};

export default VendorManagementPage;