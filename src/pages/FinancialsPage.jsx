import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import FinancialsTable from "../components/financials/FinancialsTable";
// import FinancialGrowthChart from "../components/financials/FinancialGrowthChart";
// import FinancialActivityHeatmap from "../components/financials/FinancialActivityHeatmap";
// import FinancialDemographicsChart from "../components/financials/FinancialDemographicsChart";
import { useFinancials } from "../hooks/useFinancials";

const FinancialsPage = () => {
  const { t, i18n } = useTranslation();
  const { stats, loading } = useFinancials();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`flex-1 overflow-auto relative z-10 ${isRTL ? 'rtl' : ''}`}>
      <Header title={t('financials.title')} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name={t('financials.stats.totalFinancials')}
            icon={UsersIcon}
            value={loading ? t('common.loading') : stats?.totalFinancials?.toLocaleString(i18n.language) ?? t('common.notAvailable')}
            color="#8B5CF6"
          />
          <StatCard 
            name={t('financials.stats.newFinancialsToday')} 
            icon={UserPlus} 
            value={loading ? t('common.loading') : stats?.newFinancialsToday ?? t('common.notAvailable')} 
            color="#6366F1" 
          />
          <StatCard
            name={t('financials.stats.activeFinancials')}
            icon={UserCheck}
            value={loading ? t('common.loading') : stats?.activeFinancials?.toLocaleString(i18n.language) ?? t('common.notAvailable')}
            color="#3B82F6"
          />
          <StatCard 
            name={t('financials.stats.churnRate')} 
            icon={UserX} 
            value={loading ? t('common.loading') : stats?.churnRate ?? t('common.notAvailable')} 
            color="#EC4899" 
          />
        </motion.div>

        <FinancialsTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* <FinancialGrowthChart />
          <FinancialActivityHeatmap />
          <FinancialDemographicsChart /> */}
        </div>
      </main>
    </div>
  );
};

export default FinancialsPage;