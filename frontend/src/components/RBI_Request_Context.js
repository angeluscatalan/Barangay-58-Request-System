import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

const RequestContext = createContext();

export const useRequests = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  const [rbiRequests, setRbiRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRbiRequests = useCallback(async (status = null) => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/rbi");
      const allRequests = response.data;
      const filtered = status 
        ? allRequests.filter(r => r.status?.toLowerCase() === status.toLowerCase()) 
        : allRequests;
      setRbiRequests(filtered);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);
   // <-- this was missing!
    // Empty dependency array, since the fetch function doesn't depend on anything

  const updateRbiStatus = useCallback(async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/rbi/${id}`, { status: newStatus });
      setRbiRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      ));
      return true;
    } catch (error) {
      setError('Failed to update request status');
      console.error('Error updating status:', error);
      return false;
    }
  }, []);  // Empty dependency array for `updateRbiStatus` since no external dependencies

  return (
    <RequestContext.Provider value={{ rbiRequests, loading, error, fetchRbiRequests, updateRbiStatus }}>
      {children}
    </RequestContext.Provider>
  );
};
