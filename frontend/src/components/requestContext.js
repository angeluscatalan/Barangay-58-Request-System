import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const RequestsContext = createContext();

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async (status_id = null) => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/requests';
      if (status_id) {
        url += `?status_id=${status_id}`;
      }
      const response = await axios.get(url);
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequestStatus = useCallback(async (id, status_id) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${id}/status`, { status_id });
      setRequests(prev => prev.map(req =>
        req.id === id ? { ...req, status_id } : req
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