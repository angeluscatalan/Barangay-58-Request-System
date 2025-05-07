import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

const RequestContext = createContext();

export const useRequests = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  const [rbiRequests, setRbiRequests] = useState({ records: [], totalRecords: 0, currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRbiRequests = useCallback(async (status = null, page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (status) {
        params.append('status', status);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await axios.get(`http://localhost:5000/households?${params.toString()}`);
      setRbiRequests(response.data);
    } catch (err) {
      console.error("Error fetching RBI requests:", err);
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const getHouseholdWithMembers = useCallback(async (householdId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/households/${householdId}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching household details:", err);
      setError(err.response?.data?.message || 'Failed to fetch household details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRbiStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      // Fixed the URL from housho to households
      await axios.put(`http://localhost:5000/households/${id}/status`, { status: newStatus });
      
      // Update local state to reflect the change
      setRbiRequests(prev => {
        const updatedRecords = prev.records.map(req => 
          req.id === id ? { ...req, status: newStatus } : req
        );
        return { ...prev, records: updatedRecords };
      });
      
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update request status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <RequestContext.Provider value={{ 
      rbiRequests, 
      loading, 
      error, 
      fetchRbiRequests,
      getHouseholdWithMembers,
      updateRbiStatus 
    }}>
      {children}
    </RequestContext.Provider>
  );
};

export default RequestProvider;