import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import ClientsTable from "../components/clients/ClientsTable";
import ClientGrowthChart from "../components/clients/ClientGrowthChart";
import ClientActivityHeatmap from "../components/clients/ClientActivityHeatmap";
import ClientDemographicsChart from "../components/clients/ClientDemographicsChart";
import { useClients } from "../hooks/useClients";

const ClientsPage = () => {
  const { t, i18n } = useTranslation();
  const { stats, loading } = useClients();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t('clients.title')} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name={t('clients.stats.totalClients')}
            icon={UsersIcon}
            value={loading ? "Loading..." : stats?.totalClients?.toLocaleString() ?? "N/A"}
            color="#6366F1"
          />
          <StatCard 
            name={t('clients.stats.newClientsToday')} 
            icon={UserPlus} 
            value={loading ? "Loading..." : stats?.newClientsToday ?? "N/A"} 
            color="#10B981" 
          />
          <StatCard
            name={t('clients.stats.activeClients')}
            icon={UserCheck}
            value={loading ? "Loading..." : stats?.activeClients?.toLocaleString() ?? "N/A"}
            color="#F59E0B"
          />
          <StatCard 
            name={t('clients.stats.churnRate')} 
            icon={UserX} 
            value={loading ? "Loading..." : stats?.churnRate ?? "N/A"} 
            color="#EF4444" 
          />
        </motion.div>

        <ClientsTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* <ClientGrowthChart />
          <ClientActivityHeatmap />
          <ClientDemographicsChart /> */}
        </div>
      </main>
    </div>
  );
};

export default ClientsPage;