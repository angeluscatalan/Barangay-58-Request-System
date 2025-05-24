import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsAuthenticated(res.ok);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    verifyAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;