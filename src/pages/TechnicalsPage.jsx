import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import TechnicalsTable from "../components/technicals/TechnicalsTable";
import TechnicalGrowthChart from "../components/technicals/TechnicalGrowthChart";
import TechnicalActivityHeatmap from "../components/technicals/TechnicalActivityHeatmap";
import TechnicalDemographicsChart from "../components/technicals/TechnicalDemographicsChart";
import { useTechnicals } from "../hooks/useTechnicals";

const TechnicalsPage = () => {
  const { t, i18n } = useTranslation();
  const { stats, loading } = useTechnicals();

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t('technicals.title')} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name={t('technicals.stats.totalTechnicals')}
            icon={UsersIcon}
            value={loading ? "Loading..." : stats?.totalTechnicals?.toLocaleString() ?? "N/A"}
            color="#6366F1"
          />
          <StatCard 
            name={t('technicals.stats.newTechnicalsToday')}  
            icon={UserPlus} 
            value={loading ? "Loading..." : stats?.newTechnicalsToday ?? "N/A"} 
            color="#10B981" 
          />
          <StatCard
            name={t('technicals.stats.activeTechnicals')}
            icon={UserCheck}
            value={loading ? "Loading..." : stats?.activeTechnicals?.toLocaleString() ?? "N/A"}
            color="#F59E0B"
          />
          <StatCard 
            name={t('technicals.stats.churnRate')} 
            icon={UserX} 
            value={loading ? "Loading..." : stats?.churnRate ?? "N/A"} 
            color="#EF4444" 
          />
        </motion.div>

        <TechnicalsTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* <TechnicalGrowthChart />
          <TechnicalActivityHeatmap />
          <TechnicalDemographicsChart /> */}
        </div>
      </main>
    </div>
  );
};

export default TechnicalsPage;