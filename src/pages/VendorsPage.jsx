import { Building, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import VendorsTable from "../components/vendorspage/VendorsTable";
import VendorGrowthChart from "../components/vendorspage/VendorGrowthChart";
import VendorActivityHeatmap from "../components/vendorspage/VendorActivityHeatmap";
import VendorDemographicsChart from "../components/vendorspage/VendorDemographicsChart";
import { useVendors } from "../hooks/useVendors";

const VendorsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { stats, loading } = useVendors();

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t('vendors.vendorList')} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name={t('vendors.totalVendors')}
            icon={Building}
            value={loading ? "Loading..." : stats?.totalVendors?.toLocaleString() ?? "N/A"}
            color="#6366F1"
          />
          <StatCard 
            name={t('vendors.newVendorsToday')} 
            icon={Building} 
            value={loading ? "Loading..." : stats?.newVendorsToday ?? "N/A"} 
            color="#10B981" 
          />
          <StatCard
            name={t('vendors.activeVendors')}
            icon={Building}
            value={loading ? "Loading..." : stats?.activeVendors?.toLocaleString() ?? "N/A"}
            color="#F59E0B"
          />
          <StatCard 
            name={t('vendors.churnRate')} 
            icon={Loader2} 
            value={loading ? "Loading..." : stats?.churnRate ?? "N/A"} 
            color="#EF4444" 
          />
        </motion.div>

        <VendorsTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* <VendorGrowthChart />
          <VendorActivityHeatmap />
          <VendorDemographicsChart /> */}
        </div>
      </main>
    </div>
  );
};

export default VendorsPage;