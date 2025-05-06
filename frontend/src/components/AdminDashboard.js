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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        // Fetch certificate requests
        const requestsResponse = await axios.get("http://localhost:5000/requests", {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Fetch RBI registrations
        const rbiResponse = await axios.get("http://localhost:5000/rbi", {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Fetch events
        const eventsResponse = await axios.get("http://localhost:5000/events")

        // Process certificate requests data
        const requests = requestsResponse.data
        const pendingRequests = requests.filter((req) => req.status.toLowerCase() === "pending")
        const approvedRequests = requests.filter((req) => req.status.toLowerCase() === "approved")
        const rejectedRequests = requests.filter((req) => req.status.toLowerCase() === "rejected")

        // Process RBI data
        const rbiData = rbiResponse.data
        const pendingRBI = rbiData.filter((rbi) => rbi.status?.toLowerCase() === "pending")
        const approvedRBI = rbiData.filter((rbi) => rbi.status?.toLowerCase() === "approved")
        const rejectedRBI = rbiData.filter((rbi) => rbi.status?.toLowerCase() === "rejected")

        // Get recent requests (last 5)
        const sortedRequests = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

        // Get recent RBI registrations (last 5)
        const sortedRBI = [...rbiData]
          .sort((a, b) => new Date(b.created_at || b.submission_date) - new Date(a.created_at || a.submission_date))
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
          totalEvents: eventsResponse.data.length,
        })

        setRecentRequests(sortedRequests)
        setRecentRBI(sortedRBI)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
      </div>
    </div>
  )
}

export default AdminDashboard
