import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AccountManager.css";

function Account_Manager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(token);
        const response = await axios.get("http://localhost:5000/api/admin/accounts", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAccounts(response.data);
      } catch (err) {
        console.error("Error fetching accounts:", err.response);
        if (err.response?.status === 403) {
          setError("You don't have Staff privileges to access this section");
        } else {
          setError(err.response?.data?.message || "Failed to load accounts");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAccounts();
  }, []);

  const getAccessLevelName = (level) => {
    switch(level) {
      case 0: return "Super Admin";
      case 1: return "Admin";
      case 2: return "Staff";
      default: return "Unknown";
    }
  };

  const maskPassword = (password) => {
    if (typeof password !== 'string') return '••••••';
    return password.substring(0, 3) + '••••••';
  };
  

  if (loading) return <div className="loading">Loading accounts...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="account-manager">
      <h1>Account Manager</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Password (Masked)</th>
              <th>Access Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.username}</td>
                <td>{account.email}</td>
                <td title="Actual hash stored in database">
                  {maskPassword(account.password)}
                </td>
                <td>{getAccessLevelName(account.access_level)} ({account.access_level})</td>
                <td className={account.archive === 'YES' ? 'archived' : 'active'}>
                  {account.archive === 'YES' ? 'Archived' : 'Active'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Account_Manager;