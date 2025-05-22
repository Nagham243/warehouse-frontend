import { useState, useEffect } from "react";
import userService from "../api/userService";

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    newClientsToday: 0,
    activeClients: 0,
    churnRate: "0%"
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUsers({ user_type: 'client' });
      
      const clientList = Array.isArray(data) ? data : (data.users || data.results || []);
      setClients(clientList);
      
      try {
        const clientStats = await fetchClientStats();
        setStats(clientStats);
      } catch (statsErr) {
        console.warn("Could not fetch client stats:", statsErr);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch clients");
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      try {
        const stats = await userService.getUserStats(true);
        if (stats.by_user_type && stats.by_user_type.client) {
          return {
            totalClients: stats.by_user_type.client.total || 0,
            newClientsToday: stats.by_user_type.client.new_today || 0,
            activeClients: stats.by_user_type.client.active || 0,
            churnRate: stats.by_user_type.client.churn_rate || "0%"
          };
        }
      } catch (e) {
        console.log("Detailed stats not available, calculating from client list");
      }
      
      const clientsData = await userService.getClients();
      const clientList = Array.isArray(clientsData) ? clientsData : (clientsData.users || clientsData.results || []);
      
      const activeClients = clientList.filter(client => client.is_active).length;
      
      return {
        totalClients: clientList.length,
        newClientsToday: 0,
        activeClients: activeClients,
        churnRate: "0%" 
      };
    } catch (err) {
      console.error("Error calculating client stats:", err);
      return {
        totalClients: 0,
        newClientsToday: 0,
        activeClients: 0,
        churnRate: "0%"
      };
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers({ search: term, user_type: 'client' });
      const clientList = Array.isArray(data) ? data : (data.users || data.results || []);
      setClients(clientList);
    } catch (err) {
      setError("Search failed: " + (err.message || "Unknown error"));
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData) => {
    try {
      setError(null);
      const clientUserData = {
        ...clientData,
        user_type: 'client'
      };
      await userService.createUser(clientUserData);
      await fetchClients(); 
      return true;
    } catch (err) {
      setError("Failed to create client: " + (err.message || "Unknown error"));
      console.error("Create client error:", err);
      return false;
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      setError(null);
      const clientUserData = {
        ...clientData,
        user_type: 'client'
      };
      await userService.updateUser(id, clientUserData);
      await fetchClients(); 
      return true;
    } catch (err) {
      setError("Failed to update client: " + (err.message || "Unknown error"));
      console.error("Update client error:", err);
      return false;
    }
  };

  const deleteClient = async (id) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await fetchClients(); 
      return true;
    } catch (err) {
      setError("Failed to delete client: " + (err.message || "Unknown error"));
      console.error("Delete client error:", err);
      return false;
    }
  };

  const suspendClient = async (id) => {
    try {
      setError(null);
      await userService.suspendUser(id);
      await fetchClients();
      return true;
    } catch (err) {
      setError("Failed to suspend client: " + (err.message || "Unknown error"));
      console.error("Suspend client error:", err);
      return false;
    }
  };

  const activateClient = async (id) => {
    try {
      setError(null);
      await userService.activateUser(id);
      await fetchClients(); 
      return true;
    } catch (err) {
      setError("Failed to activate client: " + (err.message || "Unknown error"));
      console.error("Activate client error:", err);
      return false;
    }
  };

  return {
    clients,
    loading,
    error,
    stats,
    handleSearch,
    createClient,
    updateClient,
    deleteClient,
    suspendClient,
    activateClient,
    refreshClients: fetchClients,
  };
};