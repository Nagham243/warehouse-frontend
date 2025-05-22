import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UsersTable from "../components/users/UsersTable";
import UserGrowthChart from "../components/users/UserGrowthChart";
import UserActivityHeatmap from "../components/users/UserActivityHeatmap";
import UserDemographicsChart from "../components/users/UserDemographicsChart";
import { useUsers } from "../hooks/useUsers";

const UsersPage = () => {
  const { stats, loading } = useUsers();
  const { t, i18n } = useTranslation();
  
  // Check if current language is RTL
  const isRTL = i18n.language === 'ar';



  return (
    <div className={`flex-1 overflow-auto relative z-10 ${isRTL ? 'rtl' : ''}`}>
      <Header title={t('users.title')} />

      <main className={`max-w-7xl mx-auto py-6 px-4 lg:px-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name={t('users.totalUsers')}
            icon={UsersIcon}
            value={loading ? t('common.loading') : stats?.totalUsers?.toLocaleString() ?? t('common.na')}
            color="#6366F1"
            isRTL={isRTL}
          />
          <StatCard 
            name={t('users.newUsersToday')}
            icon={UserPlus} 
            value={loading ? t('common.loading') : stats?.newUsersToday ?? t('common.na')} 
            color="#10B981"
            isRTL={isRTL}
          />
          <StatCard
            name={t('users.activeUsers')}
            icon={UserCheck}
            value={loading ? t('common.loading') : stats?.activeUsers?.toLocaleString() ?? t('common.na')}
            color="#F59E0B"
            isRTL={isRTL}
          />
          <StatCard 
            name={t('users.churnRate')}
            icon={UserX} 
            value={loading ? t('common.loading') : stats?.churnRate ?? t('common.na')} 
            color="#EF4444"
            isRTL={isRTL}
          />
        </motion.div>

        <UsersTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <UserGrowthChart isRTL={isRTL} />
          <UserDemographicsChart isRTL={isRTL} />
        </div>
      </main>
    </div>
  );
};

export default UsersPage;