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
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const url = status_id 
      ? `http://localhost:5000/api/requests?status_id=${status_id}`
      : 'http://localhost:5000/api/requests';

    const response = await axios.get(url, config);
    
    setRequests(response.data);
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    setError(err.response?.data?.message || 'Failed to fetch requests');
  } finally {
    setLoading(false);
  }
}, []);

  const updateRequestStatus = useCallback(async (id, status_id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:5000/api/requests/${id}/status`, 
      { status_id },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status_id } : req
    ));
    return true;
    } catch (error) {
      setError('Failed to update request status');
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