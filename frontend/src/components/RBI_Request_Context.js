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

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

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

      // Make the request to fetch data with auth headers
      const response = await axios.get(
        `http://localhost:5000/api/rbi?${params.toString()}`,
        getAuthHeaders()
      );

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
      if (err?.response?.status === 401) {
        // Handle unauthorized access - you might want to redirect to login
        console.log("Unauthorized access - please log in again");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch details of a specific household by ID
  const getHouseholdWithMembers = useCallback(async (householdId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:5000/api/rbi/${householdId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching household details:", err);
      setError(err?.response?.data?.message || 'Failed to fetch household details');
      if (err?.response?.status === 401) {
        console.log("Unauthorized access - please log in again");
      }
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
      // Make the request to update the status with auth headers
      await axios.put(
        `http://localhost:5000/api/rbi/${id}/status`,
        { status: newStatus },
        getAuthHeaders()
      );

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
      if (err?.response?.status === 401) {
        console.log("Unauthorized access - please log in again");
      }
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
