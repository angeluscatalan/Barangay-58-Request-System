"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useRequests } from "../components/requestContext"
import "../styles/Admin.css"
import brgyLoginPageLogo from "../assets/brgyLoginPageLogo.png"
import EventsManager from "../components/EventsManager"
import RBI_Request_Manager from "../components/RBI_Request_Manager"
import Request_Manager from "../components/Request_Manager"
import Account_Manager from "../components/Account_Manager"
import Verified_RBI_List from "../components/Verified_RBI_List"
import ComparisonModal from "../components/comparisonModal"
import AdminDashboard from "../components/AdminDashboard"
import BackupRequestsModal from "../components/BackupRequestsModal"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"
import LogoutConfirmationModal from "../components/LogoutConfirmationModal"

function Admin() {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [userAccessLevel, setUserAccessLevel] = useState(null)
  const [selectedRequests, setSelectedRequests] = useState([])
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [sortBy, setSortBy] = useState("latest")
  const [isPrinting, setIsPrinting] = useState({})
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [similarRbis, setSimilarRbis] = useState([])
  const [showRbiComparison, setShowRbiComparison] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [backupModalType, setBackupModalType] = useState("requests")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { requests, loading: requestsLoading, error: requestsError, fetchRequests, updateRequestStatus } = useRequests()

  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024)
    }

    // Initial check
    checkScreenSize()

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Add delete function
  const handleDeleteRequest = (id) => {
    setRequestToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDeleteRequest = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:5000/api/requests/${requestToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchRequests() // Refresh the requests list
      setShowDeleteModal(false)
      setRequestToDelete(null)
    } catch (error) {
      console.error("Error deleting request:", error)
      alert("Failed to delete request")
    }
  }

  const findSimilarRbis = async (request) => {
    try {
      setSelectedRequest(request)
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:5000/api/rbi/find-similar",
        {
          lastName: request.last_name,
          firstName: request.first_name,
          middleName: request.middle_name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setSimilarRbis(response.data)
      setShowRbiComparison(true)
    } catch (error) {
      console.error("Error finding similar RBIs:", error)
      alert("Failed to search for similar RBI records")
    }
  }

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
  const filteredRequests = useMemo(() => {
    // First filter by type, status, and search
    const filtered = approvedRequests.filter((request) => {
      const matchesType = typeFilter === "All" || request.type_of_certificate === typeFilter
      const matchesStatus = statusFilter === "All" || request.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        `${request.last_name}, ${request.first_name} ${request.middle_name || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      return matchesType && matchesStatus && matchesSearch
    })

    // Then apply sorting
    return filtered
      .sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)

        switch (sortBy) {
          case "latest":
            return dateB - dateA // Newest first
          case "oldest":
            return dateA - dateB // Oldest first
          case "lastMonth":
            // Show only requests from the last 30 days
            const oneMonthAgo = new Date()
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
            return dateB - dateA // Sort by newest first within last month
          case "lastYear":
            // Show only requests from the last 365 days
            const oneYearAgo = new Date()
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
            return dateB - dateA // Sort by newest first within last year
          default:
            return dateB - dateA // Default to latest first
        }
      })
      .filter((request) => {
        // Additional filtering for time-based options
        const requestDate = new Date(request.created_at)
        const now = new Date()

        if (sortBy === "lastMonth") {
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          return requestDate >= oneMonthAgo
        }

        if (sortBy === "lastYear") {
          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          return requestDate >= oneYearAgo
        }

        return true // No additional filtering for other sort options
      })
  }, [approvedRequests, typeFilter, statusFilter, searchQuery, sortBy])

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
    if (!birthday) return ""
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Add master select function
  const handleMasterSelect = (e) => {
    if (e.target.checked) {
      setSelectedRequests(filteredRequests.map((request) => request.id))
    } else {
      setSelectedRequests([])
    }
  }

  // Add individual select function
  const handleSelectRequest = (id) => {
    setSelectedRequests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((requestId) => requestId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Add bulk delete function
  const handleBulkDelete = () => {
    if (selectedRequests.length === 0) {
      alert("Please select at least one request to delete")
      return
    }

    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = async () => {
    try {
      const token = localStorage.getItem("token")
      await Promise.all(
        selectedRequests.map((id) =>
          axios.delete(`http://localhost:5000/api/requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      )
      await fetchRequests()
      setSelectedRequests([])
      setShowBulkDeleteModal(false)
    } catch (error) {
      console.error("Error deleting requests:", error)
      alert("Failed to delete selected requests")
    }
  }

  const handlePrintRequest = async (request) => {
    setIsPrinting((prev) => ({ ...prev, [request.id]: true }))
    try {
      console.log("Sending request data:", request)
      const response = await axios.post(
        "http://localhost:5000/api/certificates/generate-pdf",
        {
          requestData: {
            ...request,
            s3_key: request.s3_key, // Make sure this is included
          },
        },
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Check if this is a JobseekerCert to handle ZIP differently
      if (request.type_of_certificate === "JobseekerCert") {
        // Create a blob from the ZIP Stream
        const file = new Blob([response.data], { type: "application/zip" })
        const fileURL = URL.createObjectURL(file)
        const link = document.createElement("a")
        link.href = fileURL
        link.download = `JobseekerDocuments_${request.last_name}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(fileURL)
      } else {
        // Handle regular PDFs as before
        const file = new Blob([response.data], { type: "application/pdf" })
        const fileURL = URL.createObjectURL(file)
        const link = document.createElement("a")
        link.href = fileURL
        link.download = `${request.type_of_certificate}_${request.last_name}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(fileURL)
      }
    } catch (error) {
      console.error("Error printing certificate:", error)
      alert("Failed to generate certificate")
    } finally {
      setIsPrinting((prev) => ({ ...prev, [request.id]: false }))
    }
  }

  if (requestsLoading) return <div className="loading">Loading...</div>
  if (requestsError) return <div className="error">Error: {requestsError}</div>

  // If on a small screen, show the desktop-only message
  if (isSmallScreen) {
    return (
      <div className="admin-mobile-message">
        <div className="mobile-warning">
          <i className="fas fa-desktop" style={{ fontSize: "3rem", color: "#da1c6f", marginBottom: "1rem" }}></i>
          <h2>Desktop View Required</h2>
          <p>⚠️ The Admin Page is best viewed on desktop or laptop devices.</p>
          <p>Please use a device with a larger screen for the optimal experience.</p>
          <button
            className="back-button"
            onClick={() => navigate("/")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#da1c6f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

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
                className={activeSection === "dashboard" ? "active" : ""}
                onClick={() => handleSectionChange("dashboard")}
              >
                {sidebarVisible ? "Dashboard" : <i className="fas fa-tachometer-alt"></i>}
              </li>
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
              <li
                className={activeSection === "rbi_manager" ? "active" : ""}
                onClick={() => handleSectionChange("rbi_manager")}
              >
                {sidebarVisible ? "RBI Requests" : <i className="fas fa-id-card"></i>}
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
              onClick={() => setShowLogoutModal(true)}
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
          <div className="content-wrapper">
            {activeSection === "dashboard" ? (
              <AdminDashboard />
            ) : activeSection === "requests" ? (
              <div className="dashboard">
                <div className="dashboard-header">
                  <div className="header-top">
                    {typeFilter !== "VerifiedRBI" && <h1>Requests ({filteredRequests.length})</h1>}
                  </div>
                  <div className="filters">
                    {typeFilter !== "VerifiedRBI" && (
                      <>
                        <input
                          type="text"
                          placeholder="Search requests..."
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
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                          <option value="latest">Latest</option>
                          <option value="oldest">Oldest</option>
                          <option value="lastMonth">Last Month</option>
                          <option value="lastYear">Last Year</option>
                        </select>
                        <button
                          className="retrieve-btn"
                          onClick={() => {
                            setBackupModalType("requests")
                            setShowBackupModal(true)
                          }}
                        >
                          <i className="fas fa-undo"></i> Retrieve Request Data
                        </button>
                        {selectedRequests.length > 0 && (
                          <>
                            <button className="bulk-delete-btn" onClick={handleBulkDelete}>
                              <i className="fas fa-trash-alt"></i> Delete Selected ({selectedRequests.length})
                            </button>
                            {selectedRequests.length === 1 && (
                              <button
                                className="compare-btn"
                                onClick={() => {
                                  const selectedReq = filteredRequests.find((req) => req.id === selectedRequests[0])
                                  if (selectedReq) {
                                    findSimilarRbis(selectedReq)
                                  }
                                }}
                                title="Compare with RBI records"
                              >
                                <i className="fas fa-user-check"></i> Compare with RBI
                              </button>
                            )}
                          </>
                        )}
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
                      </>
                    )}
                  </div>
                </div>
                <div
                  className="dashboard-content"
                  style={{ height: zoomLevel !== 100 ? `calc(100vh - 200px)` : "auto" }}
                >
                  <div className="filter-tabs">
                    {["VerifiedRBI", "All", "ClearanceCert", "IDApp", "IndigencyCert", "JobseekerCert", "BrgyCert"].map(
                      (type) => (
                        <button
                          key={type}
                          className={`tab-button ${typeFilter === type ? "active-tab" : ""}`}
                          onClick={() => {
                            setTypeFilter(type)
                            // Reset other filters when changing tab type for better UX
                            if (type !== "All") {
                              setStatusFilter("All")
                            }
                          }}
                          aria-pressed={typeFilter === type}
                        >
                          {type === "All" ? "All Types" : type === "VerifiedRBI" ? "Verified RBI List" : type}
                        </button>
                      ),
                    )}
                  </div>

                  <div>
                    {typeFilter === "VerifiedRBI" ? (
                      <Verified_RBI_List />
                    ) : (
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
                              <th>
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedRequests.length === filteredRequests.length && filteredRequests.length > 0
                                  }
                                  onChange={handleMasterSelect}
                                />
                              </th>
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
                              <th>ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRequests.map((request, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={selectedRequests.includes(request.id)}
                                    onChange={() => handleSelectRequest(request.id)}
                                  />
                                </td>
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
                                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                                    {request.status}
                                  </span>
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
                                <td className="action-buttons">
                                  <button
                                    className="print-btn"
                                    onClick={() => handlePrintRequest(request)}
                                    title="Print Request"
                                    disabled={isPrinting[request.id]}
                                  >
                                    <i
                                      className={`fas ${isPrinting[request.id] ? "fa-spinner fa-spin" : "fa-print"}`}
                                    ></i>
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteRequest(request.id)}
                                    title="Delete Request"
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeSection === "events" ? (
              <div className="white-background-container">
                <EventsManager />
              </div>
            ) : activeSection === "req_manager" ? (
              <Request_Manager />
            ) : activeSection === "rbi_manager" ? (
              <RBI_Request_Manager />
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
      </div>
      {showRbiComparison && (
        <ComparisonModal request={selectedRequest} rbis={similarRbis} onClose={() => setShowRbiComparison(false)} />
      )}
      <BackupRequestsModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        type={backupModalType}
        onRestore={fetchRequests}
      />

      {/* Delete Confirmation Modal for single request */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Request"
        message="Are you sure you want to delete this request?"
        onConfirm={confirmDeleteRequest}
        onCancel={() => {
          setShowDeleteModal(false)
          setRequestToDelete(null)
        }}
      />

      {/* Delete Confirmation Modal for bulk delete */}
      <DeleteConfirmationModal
        isOpen={showBulkDeleteModal}
        title="Delete Selected Requests"
        message={`Are you sure you want to delete ${selectedRequests.length} selected request(s)? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          // Clear all auth-related items
          localStorage.removeItem("token")
          localStorage.removeItem("access_level")
          navigate("/")
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  )
}

export default Admin
