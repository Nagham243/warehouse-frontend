import { useState, useEffect } from "react";
import userService from "../api/userService";

export const useTechnicals = () => {
  const [technicals, setTechnicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTechnicals: 0,
    newTechnicalsToday: 0,
    activeTechnicals: 0,
    churnRate: "0%"
  });

  const fetchTechnicals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUsers({ user_type: 'technical' });
      
      const technicalList = Array.isArray(data) ? data : (data.users || data.results || []);
      setTechnicals(technicalList);
      
      try {
        const technicalStats = await fetchTechnicalStats();
        setStats(technicalStats);
      } catch (statsErr) {
        console.warn("Could not fetch technical stats:", statsErr);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch technicals");
      console.error("Error fetching technicals:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicalStats = async () => {
    try {
      try {
        const stats = await userService.getUserStats(true);
        if (stats.by_user_type && stats.by_user_type.technical) {
          return {
            totalTechnicals: stats.by_user_type.technical.total || 0,
            newTechnicalsToday: stats.by_user_type.technical.new_today || 0,
            activeTechnicals: stats.by_user_type.technical.active || 0,
            churnRate: stats.by_user_type.technical.churn_rate || "0%"
          };
        }
      } catch (e) {
        console.log("Detailed stats not available, calculating from technical list");
      }
      
      const technicalsData = await userService.getUsers({ user_type: 'technical' });
      const technicalList = Array.isArray(technicalsData) ? technicalsData : (technicalsData.users || technicalsData.results || []);
      
      const activeTechnicals = technicalList.filter(technical => technical.is_active).length;
      
      return {
        totalTechnicals: technicalList.length,
        newTechnicalsToday: 0,
        activeTechnicals: activeTechnicals,
        churnRate: "0%" 
      };
    } catch (err) {
      console.error("Error calculating technical stats:", err);
      return {
        totalTechnicals: 0,
        newTechnicalsToday: 0,
        activeTechnicals: 0,
        churnRate: "0%"
      };
    }
  };

  useEffect(() => {
    fetchTechnicals();
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers({ search: term, user_type: 'technical' });
      const technicalList = Array.isArray(data) ? data : (data.users || data.results || []);
      setTechnicals(technicalList);
    } catch (err) {
      setError("Search failed: " + (err.message || "Unknown error"));
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTechnical = async (technicalData) => {
    try {
      setError(null);
      const technicalUserData = {
        ...technicalData,
        user_type: 'technical'
      };
      await userService.createUser(technicalUserData);
      await fetchTechnicals(); 
      return true;
    } catch (err) {
      setError("Failed to create technical: " + (err.message || "Unknown error"));
      console.error("Create technical error:", err);
      return false;
    }
  };

  const updateTechnical = async (id, technicalData) => {
    try {
      setError(null);
      const technicalUserData = {
        ...technicalData,
        user_type: 'technical'
      };
      await userService.updateUser(id, technicalUserData);
      await fetchTechnicals(); 
      return true;
    } catch (err) {
      setError("Failed to update technical: " + (err.message || "Unknown error"));
      console.error("Update technical error:", err);
      return false;
    }
  };

  const deleteTechnical = async (id) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await fetchTechnicals(); 
      return true;
    } catch (err) {
      setError("Failed to delete technical: " + (err.message || "Unknown error"));
      console.error("Delete technical error:", err);
      return false;
    }
  };

  const suspendTechnical = async (id) => {
    try {
      setError(null);
      await userService.suspendUser(id);
      await fetchTechnicals();
      return true;
    } catch (err) {
      setError("Failed to suspend technical: " + (err.message || "Unknown error"));
      console.error("Suspend technical error:", err);
      return false;
    }
  };

  const activateTechnical = async (id) => {
    try {
      setError(null);
      await userService.activateUser(id);
      await fetchTechnicals(); 
      return true;
    } catch (err) {
      setError("Failed to activate technical: " + (err.message || "Unknown error"));
      console.error("Activate technical error:", err);
      return false;
    }
  };

  return {
    technicals,
    loading,
    error,
    stats,
    handleSearch,
    createTechnical,
    updateTechnical,
    deleteTechnical,
    suspendTechnical,
    activateTechnical,
    refreshTechnicals: fetchTechnicals,
  };
};