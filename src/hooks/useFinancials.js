import { useState, useEffect } from "react";
import userService from "../api/userService";

export const useFinancials = () => {
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFinancials: 0,
    newFinancialsToday: 0,
    activeFinancials: 0,
    churnRate: "0%"
  });

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUsers({ user_type: 'financial' });
      
      const financialList = Array.isArray(data) ? data : (data.users || data.results || []);
      setFinancials(financialList);
      
      try {
        const financialStats = await fetchFinancialStats();
        setStats(financialStats);
      } catch (statsErr) {
        console.warn("Could not fetch financial user stats:", statsErr);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch financial users");
      console.error("Error fetching financial users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      try {
        const stats = await userService.getUserStats(true);
        if (stats.by_user_type && stats.by_user_type.financial) {
          return {
            totalFinancials: stats.by_user_type.financial.total || 0,
            newFinancialsToday: stats.by_user_type.financial.new_today || 0,
            activeFinancials: stats.by_user_type.financial.active || 0,
            churnRate: stats.by_user_type.financial.churn_rate || "0%"
          };
        }
      } catch (e) {
        console.log("Detailed stats not available, calculating from financial user list");
      }
      
      const financialsData = await userService.getUsers({ user_type: 'financial' });
      const financialList = Array.isArray(financialsData) ? financialsData : (financialsData.users || financialsData.results || []);
      
      const activeFinancials = financialList.filter(financial => financial.is_active).length;
      
      return {
        totalFinancials: financialList.length,
        newFinancialsToday: 0,
        activeFinancials: activeFinancials,
        churnRate: "0%" 
      };
    } catch (err) {
      console.error("Error calculating financial user stats:", err);
      return {
        totalFinancials: 0,
        newFinancialsToday: 0,
        activeFinancials: 0,
        churnRate: "0%"
      };
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers({ search: term, user_type: 'financial' });
      const financialList = Array.isArray(data) ? data : (data.users || data.results || []);
      setFinancials(financialList);
    } catch (err) {
      setError("Search failed: " + (err.message || "Unknown error"));
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createFinancial = async (financialData) => {
    try {
      setError(null);
      const financialUserData = {
        ...financialData,
        user_type: 'financial'
      };
      await userService.createUser(financialUserData);
      await fetchFinancials(); 
      return true;
    } catch (err) {
      setError("Failed to create financial user: " + (err.message || "Unknown error"));
      console.error("Create financial user error:", err);
      return false;
    }
  };

  const updateFinancial = async (id, financialData) => {
    try {
      setError(null);
      const financialUserData = {
        ...financialData,
        user_type: 'financial'
      };
      await userService.updateUser(id, financialUserData);
      await fetchFinancials(); 
      return true;
    } catch (err) {
      setError("Failed to update financial user: " + (err.message || "Unknown error"));
      console.error("Update financial user error:", err);
      return false;
    }
  };

  const deleteFinancial = async (id) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await fetchFinancials(); 
      return true;
    } catch (err) {
      setError("Failed to delete financial user: " + (err.message || "Unknown error"));
      console.error("Delete financial user error:", err);
      return false;
    }
  };

  const suspendFinancial = async (id) => {
    try {
      setError(null);
      await userService.suspendUser(id);
      await fetchFinancials();
      return true;
    } catch (err) {
      setError("Failed to suspend financial user: " + (err.message || "Unknown error"));
      console.error("Suspend financial user error:", err);
      return false;
    }
  };

  const activateFinancial = async (id) => {
    try {
      setError(null);
      await userService.activateUser(id);
      await fetchFinancials(); 
      return true;
    } catch (err) {
      setError("Failed to activate financial user: " + (err.message || "Unknown error"));
      console.error("Activate financial user error:", err);
      return false;
    }
  };

  return {
    financials,
    loading,
    error,
    stats,
    handleSearch,
    createFinancial,
    updateFinancial,
    deleteFinancial,
    suspendFinancial,
    activateFinancial,
    refreshFinancials: fetchFinancials,
  };
};