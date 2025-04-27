import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AccountManager.css";

function Account_Manager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    access_level: 1,
    archive: 'NO'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:5000/api/admin/accounts", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAccounts(response.data);
      setError(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccount({
      ...currentAccount,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the account data with all required fields
      const accountData = {
        username: currentAccount.username,
        email: currentAccount.email,
        password: currentAccount.password,
        access_level: parseInt(currentAccount.access_level) || 1, // Ensure it's a number
        archive: currentAccount.archive || 'NO' // Default to 'NO' if not provided
      };

      console.log("Submitting account data:", accountData);
  
      const response = editMode 
  ? await axios.put(
      `http://localhost:5000/api/admin/accounts/${currentAccount.id}`,
      accountData,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  : await axios.post(
      "http://localhost:5000/api/admin/accounts",
      accountData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

console.log("Server response:", response.data);
setShowModal(false);

// If editing, update the specific account in state
if (editMode && response.data.account) {
  setAccounts(accounts.map(acc => 
    acc.id === response.data.account.id ? response.data.account : acc
  ));
} else {
  fetchAccounts(); // Only refetch if creating new account
}
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        response: error.response?.data,
        request: error.request
      });
      setError(error.response?.data?.message || "Failed to save account. Check console for details.");
    }
  };

  const openAddModal = () => {
    setCurrentAccount({
      id: '',
      username: '',
      email: '',
      password: '',
      access_level: 1,
      archive: 'NO'
    });
    setEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setCurrentAccount({
      id: account.id,
      username: account.username,
      email: account.email,
      password: '', // Don't show existing password
      access_level: account.access_level,
      archive: account.archive
    });
    setEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getAccessLevelName = (level) => {
    switch(level) {
      case 1: return "Admin";
      case 2: return "Super Admin";
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
      <button className="add-account-btn" onClick={openAddModal}>
        Add New Admin Account
      </button>
      
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
              <th>Actions</th>
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
                  {account.archive === 'YES' ? 'Disabled' : 'Active'}
                </td>
                <td>
                  <button 
                    className="edit-btn"
                    onClick={() => openEditModal(account)}
                    disabled={account.access_level === 0} // Disable edit for Super Admin
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Account Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editMode ? 'Edit Account' : 'Add New Account'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={currentAccount.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={currentAccount.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={currentAccount.password}
                  onChange={handleInputChange}
                  required={!editMode}
                  placeholder={editMode ? "Leave blank to keep current" : ""}
                />
              </div>
              <div className="form-group">
                <label>Access Level:</label>
                <select
                  name="access_level"
                  value={currentAccount.access_level}
                  onChange={handleInputChange}
                  disabled={currentAccount.access_level === 0} // Can't change Super Admin
                >
                  <option value="1">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="archive"
                      value="NO"
                      checked={currentAccount.archive === 'NO'}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="archive"
                      value="YES"
                      checked={currentAccount.archive === 'YES'}
                      onChange={handleInputChange}
                    />
                    Disabled
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit">{editMode ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account_Manager;