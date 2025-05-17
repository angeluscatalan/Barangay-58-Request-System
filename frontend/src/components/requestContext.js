import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const RequestsContext = createContext();

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize fetchRequests
  const fetchRequests = useCallback(async (status = null) => {
    try {
      setLoading(true);
      const url = 'http://localhost:5000/api/requests'; // Updated with /api prefix
      const response = await axios.get(url);
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array makes this stable

  // Memoize updateRequestStatus
  const updateRequestStatus = useCallback(async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${id}`, { status: newStatus });
      setRequests(prev => prev.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      ));
      return true;
    } catch (error) {
      setError('Failed to update request status');
      console.error('Error updating status:', error);
      return false;
    }
  }, []);

  return (
    <RequestsContext.Provider
      value={{
        requests,
        loading,
        error,
        fetchRequests,
        updateRequestStatus
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
}