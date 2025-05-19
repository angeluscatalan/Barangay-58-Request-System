"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminDashboard.css"

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRBI: 0,
    pendingRBI: 0,
    approvedRBI: 0,
    rejectedRBI: 0,
    totalEvents: 0,
  })

  const [recentRequests, setRecentRequests] = useState([])
  const [recentRBI, setRecentRBI] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPassword, setImportPassword] = useState("");
  const [importPasswordError, setImportPasswordError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication token not found. Please login again.")
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const baseURL = "http://localhost:5000/api"

        // Use Promise.all to fetch data concurrently
        const [requestsResponse, rbiResponse, eventsResponse] = await Promise.all([
          axios.get(`${baseURL}/requests`, { headers }),
          axios.get(`${baseURL}/rbi`, { headers }),
          axios.get(`${baseURL}/events`, { headers })
        ])

        // Process certificate requests data
        const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : []
        const pendingRequests = requests.filter((req) => req?.status?.toLowerCase() === "pending")
        const approvedRequests = requests.filter((req) => req?.status?.toLowerCase() === "approved")
        const rejectedRequests = requests.filter((req) => req?.status?.toLowerCase() === "rejected")

        // Process RBI data - ensure we're getting the records array from the response
        const rbiData = Array.isArray(rbiResponse.data?.records) ? rbiResponse.data.records : []
        const pendingRBI = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "pending")
        const approvedRBI = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "approved")
        const rejectedRBI = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "rejected")

        // Get recent requests (last 5)
        const sortedRequests = [...requests]
          .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0))
          .slice(0, 5)

        // Get recent RBI registrations (last 5)
        const sortedRBI = [...rbiData]
          .sort((a, b) =>
            new Date(b?.created_at || b?.submission_date || 0) -
            new Date(a?.created_at || a?.submission_date || 0)
          )
          .slice(0, 5)

        setStats({
          totalRequests: requests.length,
          pendingRequests: pendingRequests.length,
          approvedRequests: approvedRequests.length,
          rejectedRequests: rejectedRequests.length,
          totalRBI: rbiData.length,
          pendingRBI: pendingRBI.length,
          approvedRBI: approvedRBI.length,
          rejectedRBI: rejectedRBI.length,
          totalEvents: Array.isArray(eventsResponse.data) ? eventsResponse.data.length : 0,
        })

        setRecentRequests(sortedRequests)
        setRecentRBI(sortedRBI)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data. Please try again later.")
        // Set empty states when there's an error
        setRecentRequests([])
        setRecentRBI([])
        setStats({
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          totalRBI: 0,
          pendingRBI: 0,
          approvedRBI: 0,
          rejectedRBI: 0,
          totalEvents: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleExportDatabase = async () => {
  try {
    setIsExporting(true);
    setExportError(null);
    const token = localStorage.getItem("token");

    // Show password modal instead of direct export
    setShowPasswordModal(true);
  } catch (err) {
    console.error("Export error:", err);
    setExportError("Export failed. Please check server connections and permissions.");
  } finally {
    setIsExporting(false);
  }
};

const handleConfirmExport = async () => {
  try {
    setIsExporting(true);
    setPasswordError("");

    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:5000/api/export/export-database",
      { password: adminPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `backup-${new Date().toISOString().slice(0,10)}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setShowPasswordModal(false);
    setAdminPassword("");
  } catch (err) {
    console.error("Export failed:", err);
    if (err.response?.status === 401) {
      setPasswordError("Incorrect password. Please try again.");
    } else {
      setExportError("Export failed. Please check your connection or try again later.");
      setShowPasswordModal(false);
    }
  } finally {
    setIsExporting(false);
  }
};

const handleImportDatabase = async () => {
  if (!selectedFile) {
    setImportError("Please select a SQL file to import");
    return;
  }

  try {
    setIsImporting(true);
    setImportError(null);
    setImportPasswordError("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("sqlFile", selectedFile);
    formData.append("password", importPassword);

    const response = await axios.post(
      "http://localhost:5000/api/import/import-database",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setShowImportModal(false);
    setSelectedFile(null);
    setImportPassword("");
    alert("Database imported successfully! The page will now refresh.");
    window.location.reload();
  } catch (err) {
    console.error("Import failed:", err);
    if (err.response?.status === 401) {
      setImportPasswordError("Incorrect password. Please try again.");
    } else {
      setImportError(err.response?.data?.error || "Import failed. Please try again.");
    }
  } finally {
    setIsImporting(false);
  }
};

// Add this file change handler
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.name.endsWith('.sql') || file.type === 'application/sql') {
      setSelectedFile(file);
      setImportError(null);
    } else {
      setImportError("Please select a valid .sql file");
      setSelectedFile(null);
    }
  }
};


  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Overview</h1>
      <button 
        onClick={() => setShowPasswordModal(true)}
        disabled={isExporting}
        className="export-button"
      >
        {isExporting ? 'Exporting...' : 'Export Database'}
      </button>
        {exportError && <div className="error-message">{exportError}</div>}
      <button 
        onClick={() => setShowImportModal(true)}
        disabled={isImporting}
        className="import-button"
      >
        {isImporting ? 'Importing...' : 'Import Database'}
      </button>
      {importError && <div className="error-message">{importError}</div>}
      <div className="dashboard-content">
        <div className="stats-section">
          <h2>Certificate Requests</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <h3>Total Requests</h3>
              <div className="value">{stats.totalRequests}</div>
            </div>

            <div className="stats-card pending">
              <h3>Pending</h3>
              <div className="value">{stats.pendingRequests}</div>
            </div>

            <div className="stats-card approved">
              <h3>Approved</h3>
              <div className="value">{stats.approvedRequests}</div>
            </div>

            <div className="stats-card rejected">
              <h3>Rejected</h3>
              <div className="value">{stats.rejectedRequests}</div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2>RBI Registrations</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <h3>Total Registrations</h3>
              <div className="value">{stats.totalRBI}</div>
            </div>

            <div className="stats-card pending">
              <h3>Pending</h3>
              <div className="value">{stats.pendingRBI}</div>
            </div>

            <div className="stats-card approved">
              <h3>Approved</h3>
              <div className="value">{stats.approvedRBI}</div>
            </div>

            <div className="stats-card rejected">
              <h3>Rejected</h3>
              <div className="value">{stats.rejectedRBI}</div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2>Events</h2>
          <div className="stats-cards single">
            <div className="stats-card events">
              <h3>Total Events</h3>
              <div className="value">{stats.totalEvents}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Recent Certificate Requests</h3>
            {recentRequests.length > 0 ? (
              <div className="recent-items">
                {recentRequests.map((request) => (
                  <div key={request.id} className="recent-item">
                    <div className="recent-item-header">
                      <span className="recent-item-name">
                        {request.first_name} {request.last_name}
                      </span>
                      <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
                    </div>
                    <div className="recent-item-details">
                      <span className="recent-item-type">{request.type_of_certificate}</span>
                      <span className="recent-item-date">{formatDate(request.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent certificate requests</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Recent RBI Registrations</h3>
            {recentRBI.length > 0 ? (
              <div className="recent-items">
                {recentRBI.map((rbi) => (
                  <div key={rbi.id} className="recent-item">
                    <div className="recent-item-header">
                      <span className="recent-item-name">
                        {rbi.first_name} {rbi.last_name}
                      </span>
                      <span className={`status-badge ${rbi.status?.toLowerCase() || "pending"}`}>
                        {rbi.status || "Pending"}
                      </span>
                    </div>
                    <div className="recent-item-details">
                      <span className="recent-item-type">RBI Registration</span>
                      <span className="recent-item-date">{formatDate(rbi.created_at || rbi.submission_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent RBI registrations</p>
            )}
          </div>
        </div>
          {showPasswordModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Confirm Admin Password</h2>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                {passwordError && <p className="error-message">{passwordError}</p>}
                <div className="modal-buttons">
                  <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button onClick={handleConfirmExport} disabled={isExporting}>
                    {isExporting ? "Exporting..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {showImportModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Import Database</h2>
                
                <div className="file-upload">
                  <label htmlFor="sql-upload" className="file-upload-label">
                    {selectedFile ? selectedFile.name : "Choose SQL File"}
                  </label>
                  <input
                    id="sql-upload"
                    type="file"
                    accept=".sql,.zip"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Enter your admin password"
                />
                
                {importPasswordError && <p className="error-message">{importPasswordError}</p>}
                
                <div className="modal-buttons">
                  <button onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setImportPassword("");
                    setImportError(null);
                  }}>
                    Cancel
                  </button>
                  <button 
                    onClick={handleImportDatabase} 
                    disabled={isImporting || !selectedFile || !importPassword}
                  >
                    {isImporting ? "Importing..." : "Confirm Import"}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>  
    </div>
  )
}

export default AdminDashboard
