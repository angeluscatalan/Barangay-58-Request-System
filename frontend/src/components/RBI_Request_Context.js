import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

const RequestContext = createContext();

export const useRequests = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  // State initialization
  const [rbiRequests, setRbiRequests] = useState({
    records: [],
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch RBI requests with the ability to filter by status, search, and pagination
  const fetchRbiRequests = useCallback(async (status = null, page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      // Make the request to fetch data
      const response = await axios.get(`http://localhost:5000/households?${params.toString()}`);
      
      // Safely update the state with the API response
      setRbiRequests({
        records: response.data?.records || [],
        totalRecords: response.data?.totalRecords || 0,
        currentPage: response.data?.currentPage || 1,
        totalPages: response.data?.totalPages || 1,
      });
    } catch (err) {
      console.error("Error fetching RBI requests:", err);
      setError(err?.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch details of a specific household by ID
  const getHouseholdWithMembers = useCallback(async (householdId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/households/${householdId}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching household details:", err);
      setError(err?.response?.data?.message || 'Failed to fetch household details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update the status of an RBI request
  const updateRbiStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      // Make the request to update the status
      await axios.put(`http://localhost:5000/households/${id}/status`, { status: newStatus });
      
      // Update local state to reflect the status change
      setRbiRequests((prevState) => {
        const updatedRecords = prevState.records.map((req) => 
          req.id === id ? { ...req, status: newStatus } : req
        );
        return { ...prevState, records: updatedRecords };
      });
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err?.response?.data?.message || 'Failed to update request status');
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
