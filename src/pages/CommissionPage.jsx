import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp, Gem, Crown, Medal, Shield } from "lucide-react";
import CommissionOverviewChart from "../components/commissions/CommissionOverviewChart";
import CommissionTypeDistribution from "../components/commissions/CommissionTypeDistribution";
import CommissionRatesTrend from "../components/commissions/CommissionRatesTrend";
import CommissionSettings from "../components/commissions/commission-settings";
import EditCommissionModal from "../components/commissions/EditCommissionModal";

const CommissionPage = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    bronze: { count: 0, percentage: "20%" },
    silver: { count: 0, percentage: "15%" },
    gold: { count: 0, percentage: "10%" },
    platinum: { count: 0, percentage: "5%" },
    distribution: {
      vendorType: 0,
      timePeriod: 0,
      offerType: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClassification, setCurrentClassification] = useState("");
  const [currentPercentage, setCurrentPercentage] = useState("");

  const [testPercentages, setTestPercentages] = useState({
    bronze: "",
    silver: "",
    gold: "",
    platinum: ""
  });

  useEffect(() => {
    fetchCommissionSummary();
  }, []);

  const fetchCommissionSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const vendorCountsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/commissions/vendor-counts/`, {
        withCredentials: true
      });
      
      const distributionResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/commissions/summary/`, {
        withCredentials: true
      });
      
      const commissionsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/commissions/`, {
        params: { 
          is_active: true,
          commission_type: 'vendor_type'  
        },
        withCredentials: true
      });
      
      const defaultPercentages = {
        bronze: "20%",
        silver: "15%",
        gold: "10%",
        platinum: "5%"
      };
      
      const apiPercentages = {
        bronze: defaultPercentages.bronze,
        silver: defaultPercentages.silver,
        gold: defaultPercentages.gold,
        platinum: defaultPercentages.platinum
      };

      if (Array.isArray(commissionsResponse.data)) {
        commissionsResponse.data.forEach(commission => {
          const vendorClass = commission.details?.vendor_classification || commission.vendor_classification;
          const percentageValue = commission.percentage;
          
          if (!vendorClass || percentageValue === undefined) return;
          
          switch(vendorClass.toLowerCase()) {
            case 'bronze':
              apiPercentages.bronze = `${percentageValue}%`;
              break;
            case 'silver':
              apiPercentages.silver = `${percentageValue}%`;
              break;
            case 'gold':
              apiPercentages.gold = `${percentageValue}%`;
              break;
            case 'platinum':
              apiPercentages.platinum = `${percentageValue}%`;
              break;
          }
        });
      }
      
      setTestPercentages(apiPercentages);
      
      setStats({
        bronze: { 
          count: vendorCountsResponse.data.bronze || 0,
          percentage: apiPercentages.bronze
        },
        silver: { 
          count: vendorCountsResponse.data.silver || 0,
          percentage: apiPercentages.silver
        },
        gold: { 
          count: vendorCountsResponse.data.gold || 0,
          percentage: apiPercentages.gold
        },
        platinum: { 
          count: vendorCountsResponse.data.platinum || 0,
          percentage: apiPercentages.platinum
        },
        distribution: {
          vendorType: distributionResponse.data.vendor_type_commissions || 0,
          timePeriod: distributionResponse.data.time_period_commissions || 0,
          offerType: distributionResponse.data.offer_type_commissions || 0
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching commission data:", err);
      setError(err.response?.data?.error || "Failed to load commission data. Please try again later.");
      setLoading(false);
    }
  };

  const handleStatCardClick = (classification, percentage) => {
    const percentValue = percentage.replace("%", "");
    setCurrentClassification(classification);
    setCurrentPercentage(percentValue);
    setModalOpen(true);
  };

  const handleSaveCommission = async (classification, newPercentage) => {
    try {
      setLoading(true);
      
      const allCommissionsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/commissions/`, {
        params: { commission_type: 'vendor_type' },
        withCredentials: true
      });
      
      const commissions = Array.isArray(allCommissionsResponse.data)
        ? allCommissionsResponse.data
        : allCommissionsResponse.data.results || [];
      
      const commission = commissions.find(comm => {
        const vendorClass = comm.details?.vendor_classification || comm.vendor_classification;
        return vendorClass?.toLowerCase() === classification.toLowerCase();
      });
      
      if (!commission) {
        throw new Error(`No commission found for ${classification} classification`);
      }
      
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/commissions/${commission.id}/`, {
        percentage: parseFloat(newPercentage)
      }, {
        params: { commission_type: 'vendor_type' },
        withCredentials: true
      });
      

      setStats(prevStats => ({
        ...prevStats,
        [classification]: {
          ...prevStats[classification],
          percentage: `${newPercentage}%`
        }
      }));
      

      await fetchCommissionSummary();
      
      setModalOpen(false);
      
    } catch (err) {
      console.error("Failed to update commission:", err);

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t('commissionDashboard.title')} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* COMMISSION STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div onClick={() => handleStatCardClick("bronze", stats.bronze.percentage)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <StatCard 
              name={t('commissionDashboard.bronzeVendors')} 
              icon={Shield} 
              value={`${stats.bronze.percentage}`}
              secondaryValue={stats.bronze.count}
              color="#CD7F32" 
            />
          </div>
          <div onClick={() => handleStatCardClick("silver", stats.silver.percentage)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <StatCard
              name={t('commissionDashboard.silverVendors')}
              icon={Medal}
              value={`${stats.silver.percentage}`}
              secondaryValue={stats.silver.count}
              color="#C0C0C0" 
            />
          </div>
          <div onClick={() => handleStatCardClick("gold", stats.gold.percentage)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <StatCard
              name={t('commissionDashboard.goldVendors')}
              icon={Crown}
              value={`${stats.gold.percentage}`}
              secondaryValue={stats.gold.count}
              color="#FFD700" 
            />
          </div>
          <div onClick={() => handleStatCardClick("platinum", stats.platinum.percentage)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <StatCard 
              name={t('commissionDashboard.platinumVendors')} 
              icon={Gem} 
              value={`${stats.platinum.percentage}`}
              secondaryValue={stats.platinum.count}
              color="black" 
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CommissionTypeDistribution 
            vendorCount={stats.distribution.vendorType}
            timeCount={stats.distribution.timePeriod}
            offerCount={stats.distribution.offerType}
          />
          <CommissionRatesTrend />
        </div>
        <CommissionSettings />
      </main>

      {/* Commission Edit Modal */}
      <EditCommissionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        classification={currentClassification}
        currentPercentage={currentPercentage}
        onSave={handleSaveCommission}
      />
    </div>
  );
};

export default CommissionPage;
