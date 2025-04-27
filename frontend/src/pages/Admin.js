"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useRequests } from "../components/requestContext"
import "../styles/Admin.css"
import brgyLoginPageLogo from "../assets/brgyLoginPageLogo.png"
import EventsManager from "../components/EventsManager"
import Request_Manager from "../components/Request_Manager"
import Account_Manager from "../components/Account_Manager"

function Admin() {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeSection, setActiveSection] = useState("requests")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [userAccessLevel, setUserAccessLevel] = useState(null)
  // Add a new state for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const { requests, loading: requestsLoading, error: requestsError, fetchRequests, updateRequestStatus } = useRequests()

  // Memoize fetchUserData with no dependencies
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/")
        return
      }

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserAccessLevel(response.data.access_level)
    } catch (error) {
      console.error("Error fetching user data:", error)
      navigate("/")
    }
  }, [navigate]) // Only navigate as dependency

  useEffect(() => {
    // Initialize only once on mount
    const initialize = async () => {
      await fetchRequests()
      await fetchUserData()
    }
    initialize()

    // Cleanup function
    return () => {
      // Cancel any pending requests if needed
    }
  }, [])

  const handleSectionChange = (section) => {
    if (section === "acc_manager" && userAccessLevel !== 2) {
      alert("You don't have permission to access Accounts Manager")
      return
    }
    setActiveSection(section)
  }

  // Updated to use context's updateRequestStatus
  const updateStatus = async (id, newStatus) => {
    await updateRequestStatus(id, newStatus)
  }

  // Filter to show only approved/pickup requests by default
  const approvedRequests = useMemo(
    () => requests.filter((request) => request.status !== "Pending" && request.status !== "Rejected"),
    [requests],
  )

  // Filter requests based on type, status, and search query
  const filteredRequests = useMemo(
    () =>
      approvedRequests.filter((request) => {
        const matchesType = typeFilter === "All" || request.type_of_certificate === typeFilter
        const matchesStatus = statusFilter === "All" || request.status === statusFilter
        const matchesSearch =
          searchQuery === "" ||
          `${request.last_name}, ${request.first_name} ${request.middle_name || ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())

        return matchesType && matchesStatus && matchesSearch
      }),
    [approvedRequests, typeFilter, statusFilter, searchQuery],
  )

  // Helper function to get status class
  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase() // Handle case variations
    switch (statusLower) {
      case "pending":
        return "status-pending"
      case "approved":
        return "status-approved"
      case "rejected":
        return "status-rejected"
      case "for pickup":
      case "for_pickup": // Handle different possible formats
        return "status-pickup"
      default:
        return ""
    }
  }

  const handleZoom = (action) => {
    switch (action) {
      case "in":
        setZoomLevel((prev) => Math.min(prev + 10, 150))
        break
      case "out":
        setZoomLevel((prev) => Math.max(prev - 10, 50))
        break
      case "reset":
        setZoomLevel(100)
        break
      default:
        break
    }
  }

  // Add this function after other state declarations
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (requestsLoading) return <div className="loading">Loading...</div>
  if (requestsError) return <div className="error">Error: {requestsError}</div>

  return (
    <>
      <div className="top-line"></div>
      <div className="admin-container">
        {/* Modify the sidebar div to include the collapsed class when needed */}
        <div className={`sidebar ${sidebarVisible ? "" : "collapsed"}`}>
          <div className="sidebar-header">
            <img src={brgyLoginPageLogo || "/placeholder.svg"} alt="Barangay Logo" className="admin-logo" />
            {sidebarVisible && <h1>BARANGAY 58</h1>}
          </div>
          <nav>
            <ul>
              <li
                className={activeSection === "requests" ? "active" : ""}
                onClick={() => handleSectionChange("requests")}
              >
                {sidebarVisible ? "Certificate Request" : <i className="fas fa-file-alt"></i>}
              </li>
              <li className={activeSection === "events" ? "active" : ""} onClick={() => handleSectionChange("events")}>
                {sidebarVisible ? "Events Manager" : <i className="fas fa-calendar-alt"></i>}
              </li>
              <li
                className={activeSection === "req_manager" ? "active" : ""}
                onClick={() => handleSectionChange("req_manager")}
              >
                {sidebarVisible ? "Requests Manager" : <i className="fas fa-tasks"></i>}
              </li>
              {userAccessLevel === 2 && (
                <li
                  className={activeSection === "acc_manager" ? "active" : ""}
                  onClick={() => handleSectionChange("acc_manager")}
                >
                  {sidebarVisible ? "Accounts Manager" : <i className="fas fa-users-cog"></i>}
                </li>
              )}
            </ul>
          </nav>
          <div className="sidebar-footer">
            <button
              onClick={() => {
                // Clear all auth-related items
                localStorage.removeItem("token")
                localStorage.removeItem("access_level")
                navigate("/")
              }}
              className="sidebar-logout-button"
            >
              <i className="fas fa-sign-out-alt"></i>
              {sidebarVisible && <span>Logout</span>}
            </button>
          </div>
        </div>
        {/* Add a hamburger toggle button at the top of the main-content div */}
        <div className={`main-content ${sidebarVisible ? "" : "expanded"}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas ${sidebarVisible ? "fa-bars" : "fa-chevron-right"}`}></i>
          </div>
          <header>
            <div className="profile-section">
              <div className="notifications">
                <i className="fas fa-bell"></i>
              </div>
              <div
                className="avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: "pointer" }}
              >
                <img src={brgyLoginPageLogo || "/placeholder.svg"} alt="Barangay Logo" />
              </div>
              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-info">
                    <p>Admin User</p>
                    <small>Administrator</small>
                  </div>
                </div>
              )}
            </div>
          </header>
          {activeSection === "requests" ? (
            <div className="dashboard">
              <div className="dashboard-header">
                <div className="header-top">
                  <h1>Requests ({filteredRequests.length})</h1>
                </div>
                <div className="filters">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                  />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="for pickup">For Pickup</option>
                  </select>
                  {/* Update the zoom controls with proper icons */}
                  <div className="zoom-controls">
                    <button className="zoom-btn" onClick={() => handleZoom("out")} title="Zoom Out">
                      <i className="fas fa-search-minus"></i>
                    </button>
                    <span className="zoom-level">{zoomLevel}%</span>
                    <button className="zoom-btn" onClick={() => handleZoom("in")} title="Zoom In">
                      <i className="fas fa-search-plus"></i>
                    </button>
                    <button className="zoom-btn" onClick={() => handleZoom("reset")} title="Reset Zoom">
                      <i className="fas fa-redo-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="dashboard-content" style={{ height: zoomLevel !== 100 ? `calc(100vh - 200px)` : "auto" }}>
                <div className="filter-tabs">
                  {["All", "ClearanceCert", "IDApp", "IndigencyCert", "JobseekerCert", "BrgyCert"].map((type) => (
                    <button
                      key={type}
                      className={`tab-button ${typeFilter === type ? "active-tab" : ""}`}
                      onClick={() => setTypeFilter(type)}
                    >
                      {type === "All" ? "All Types" : type}{" "}
                    </button>
                  ))}
                </div>
                <div
                  className="table-container"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "top left",
                    width: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : "100%",
                    height: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : "100%",
                    overflow: "auto",
                  }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>DATE REQUESTED</th>
                        <th>NAME</th>
                        <th>SUFFIX</th>
                        <th>SEX</th>
                        <th>BIRTHDAY</th>
                        <th>AGE</th>
                        <th>ADDRESS</th>
                        <th>CONTACT NO.</th>
                        <th>EMAIL</th>
                        <th>TYPE OF REQUEST</th>
                        <th>PURPOSE</th>
                        <th>NO. OF COPIES</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request, index) => (
                        <tr key={index}>
                          <td>{request.created_at}</td>
                          <td>{`${request.last_name}, ${request.first_name} ${request.middle_name || ""}`}</td>
                          <td>{request.suffix}</td>
                          <td>{request.sex}</td>
                          <td>{request.birthday ? request.birthday.split("T")[0] : ""}</td>
                          <td>{calculateAge(request.birthday)}</td>
                          <td>{request.address}</td>
                          <td>{request.contact_no}</td>
                          <td>{request.email}</td>
                          <td>{request.type_of_certificate}</td>
                          <td>{request.purpose_of_request}</td>
                          <td>{request.number_of_copies}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(request.status)}`}>{request.status}</span>
                            <select
                              value={request.status}
                              onChange={(e) => updateStatus(request.id, e.target.value)}
                              className={getStatusClass(request.status)}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="for pickup">For Pickup</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeSection === "events" ? (
            <EventsManager />
          ) : activeSection === "req_manager" ? (
            <Request_Manager />
          ) : activeSection === "acc_manager" ? (
            userAccessLevel === 2 ? (
              <Account_Manager />
            ) : (
              <div className="unauthorized-message">
                <h2>Access Denied</h2>
                <p>You don't have permission to view this section.</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </>
  )
}

export default Admin
