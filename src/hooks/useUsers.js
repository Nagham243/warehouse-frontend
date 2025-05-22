import { useState, useEffect } from "react";
import axios from "axios";
import userService from "../api/userService";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    churnRate: "0%"
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUsers();
      
      const userList = Array.isArray(data) ? data : (data.users || data.results || []);
      setUsers(userList);
      
      try {
        const statsData = await userService.getUserStats();
        
        setStats({
          totalUsers: statsData.total_users || 0,
          newUsersToday: statsData.new_users_today || 0,
          activeUsers: statsData.active_users || 0,
          churnRate: statsData.churn_rate || "0%"
        });
      } catch (statsErr) {
        console.warn("Could not fetch user stats:", statsErr);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers({ search: term });
      const userList = Array.isArray(data) ? data : (data.users || data.results || []);
      setUsers(userList);
    } catch (err) {
      setError("Search failed: " + (err.message || "Unknown error"));
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      setError(null);

      console.log("Creating user with data:", JSON.stringify(userData, null, 2));
      
      try {
        const result = await userService.createUser(userData);
        console.log("User creation successful:", result);
        await fetchUsers(); 
        return true;
      } catch (apiError) {
        console.error("API Error Details:", apiError.response?.data || apiError.message);
        throw apiError; 
      }
    } catch (err) {
      const errorMsg = err.response?.data 
        ? `Failed to create user: ${JSON.stringify(err.response.data)}`
        : `Failed to create user: ${err.message || "Unknown error"}`;
      
      setError(errorMsg);
      console.error("Create user error:", err);
      throw err; 
    }
  };

  const updateUser = async (id, userData) => {
    try {
      setError(null);

      console.log(`Updating user ${id} with data:`, JSON.stringify(userData, null, 2));
      
      try {
        const result = await userService.updateUser(id, userData);
        console.log("User update successful:", result);
        await fetchUsers(); 
        return true;
      } catch (apiError) {
        console.error("API Error Details:", apiError.response?.data || apiError.message);
        throw apiError;
      }
    } catch (err) {
      const errorMsg = err.response?.data 
        ? `Failed to update user: ${JSON.stringify(err.response.data)}`
        : `Failed to update user: ${err.message || "Unknown error"}`;
      
      setError(errorMsg);
      console.error("Update user error:", err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await fetchUsers(); 
      return true;
    } catch (err) {
      setError("Failed to delete user: " + (err.message || "Unknown error"));
      console.error("Delete user error:", err);
      return false;
    }
  };

  const suspendUser = async (id) => {
    try {
      setError(null);
      await userService.suspendUser(id);
      await fetchUsers();
      return true;
    } catch (err) {
      setError("Failed to suspend user: " + (err.message || "Unknown error"));
      console.error("Suspend user error:", err);
      return false;
    }
  };

  const activateUser = async (id) => {
    try {
      setError(null);
      await userService.activateUser(id);
      await fetchUsers(); 
      return true;
    } catch (err) {
      setError("Failed to activate user: " + (err.message || "Unknown error"));
      console.error("Activate user error:", err);
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    stats,
    handleSearch,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    refreshUsers: fetchUsers,
  };
};

