import { useState, useEffect } from "react";
import userService from "../api/userService";

export const useVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalVendors: 0,
    newVendorsToday: 0,
    activeVendors: 0,
    churnRate: "0%"
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUsers({ user_type: 'vendor' });
      
      const vendorList = Array.isArray(data) ? data : (data.users || data.results || []);
      setVendors(vendorList);
      
      try {
        const vendorStats = await fetchVendorStats();
        setStats(vendorStats);
      } catch (statsErr) {
        console.warn("Could not fetch vendor stats:", statsErr);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      try {
        const stats = await userService.getUserStats(true);
        if (stats.by_user_type && stats.by_user_type.vendor) {
          return {
            totalVendors: stats.by_user_type.vendor.total || 0,
            newVendorsToday: stats.by_user_type.vendor.new_today || 0,
            activeVendors: stats.by_user_type.vendor.active || 0,
            churnRate: stats.by_user_type.vendor.churn_rate || "0%"
          };
        }
      } catch (e) {
        console.log("Detailed stats not available, calculating from vendor list");
      }
      
      const vendorsData = await userService.getUsers({ user_type: 'vendor' });
      const vendorList = Array.isArray(vendorsData) ? vendorsData : (vendorsData.users || vendorsData.results || []);
      
      const activeVendors = vendorList.filter(vendor => vendor.is_active).length;
      
      return {
        totalVendors: vendorList.length,
        newVendorsToday: 0,
        activeVendors: activeVendors,
        churnRate: "0%" 
      };
    } catch (err) {
      console.error("Error calculating vendor stats:", err);
      return {
        totalVendors: 0,
        newVendorsToday: 0,
        activeVendors: 0,
        churnRate: "0%"
      };
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers({ search: term, user_type: 'vendor' });
      const vendorList = Array.isArray(data) ? data : (data.users || data.results || []);
      setVendors(vendorList);
    } catch (err) {
      setError("Search failed: " + (err.message || "Unknown error"));
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async (vendorData) => {
    try {
      setError(null);
      const vendorUserData = {
        ...vendorData,
        user_type: 'vendor'
      };
      await userService.createUser(vendorUserData);
      await fetchVendors(); 
      return true;
    } catch (err) {
      setError("Failed to create vendor: " + (err.message || "Unknown error"));
      console.error("Create vendor error:", err);
      return false;
    }
  };

  const updateVendor = async (id, vendorData) => {
    try {
      setError(null);
      const vendorUserData = {
        ...vendorData,
        user_type: 'vendor'
      };
      await userService.updateUser(id, vendorUserData);
      await fetchVendors(); 
      return true;
    } catch (err) {
      setError("Failed to update vendor: " + (err.message || "Unknown error"));
      console.error("Update vendor error:", err);
      return false;
    }
  };

  const deleteVendor = async (id) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await fetchVendors(); 
      return true;
    } catch (err) {
      setError("Failed to delete vendor: " + (err.message || "Unknown error"));
      console.error("Delete vendor error:", err);
      return false;
    }
  };

  const suspendVendor = async (id) => {
    try {
      setError(null);
      await userService.suspendUser(id);
      await fetchVendors();
      return true;
    } catch (err) {
      setError("Failed to suspend vendor: " + (err.message || "Unknown error"));
      console.error("Suspend vendor error:", err);
      return false;
    }
  };

  const activateVendor = async (id) => {
    try {
      setError(null);
      await userService.activateUser(id);
      await fetchVendors(); 
      return true;
    } catch (err) {
      setError("Failed to activate vendor: " + (err.message || "Unknown error"));
      console.error("Activate vendor error:", err);
      return false;
    }
  };

  return {
    vendors,
    loading,
    error,
    stats,
    handleSearch,
    createVendor,
    updateVendor,
    deleteVendor,
    suspendVendor,
    activateVendor,
    refreshVendors: fetchVendors,
  };
};