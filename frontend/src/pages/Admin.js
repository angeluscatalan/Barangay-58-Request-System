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
import BulkDeleteConfirmationModal from "../components/BulkDeleteConfirmationModal"
import RequestDetailsModal from "../components/RequestDetailsModal"; // <-- Add this import
import { jwtDecode } from 'jwt-decode';


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
  const [certificates, setCertificates] = useState([]); // NEW STATE
  const [statuses, setStatuses] = useState([]); // <-- Add state for statuses
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

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
  
  const handleViewRequestDetails = (request) => {
  setSelectedRequestDetails(request);
  setIsRequestDetailsOpen(true);
};

useEffect(() => {
  const verifyToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return false;
    }

    try {
      const decoded = jwtDecode(token); // <-- use jwtDecode
      const isExpired = decoded.exp * 1000 < Date.now();
      
      if (isExpired) {
        localStorage.removeItem('token');
        navigate('/');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      navigate('/');
      return false;
    }
  };
  
  // Verify token hasn't expired
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = jwtDecode(token); // <-- use jwtDecode
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      navigate('/');
    }
  }
}, [navigate]);

useEffect(() => {
  const verifyAccess = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (![1, 2].includes(decoded.access_level)) {
          // Redirect if not admin
          navigate('/');
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };
  verifyAccess();
}, [navigate]);

  const confirmDeleteRequest = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`https://barangay-58-request-system-n07q.onrender.com/api/requests/${requestToDelete}`, {
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
      // Only send fields expected by backend
      const response = await axios.post(
  "https://barangay-58-request-system-n07q.onrender.com/api/rbi/find-similar",
  {
    lastName: request.last_name,
    firstName: request.first_name,
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);
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

      const response = await axios.get(
  "https://barangay-58-request-system-n07q.onrender.com/api/auth/me",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

      setUserAccessLevel(response.data.access_level)
    } catch (error) {
      console.error("Error fetching user data:", error)
      navigate("/")
    }
  }, [navigate])

  // NEW FUNCTION: Fetch certificates data
  const fetchCertificates = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
  "https://barangay-58-request-system-n07q.onrender.com/api/requests/certificates",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      // You might want to display an error message to the user
    }
  }, []);

  // Fetch statuses on mount
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setStatusLoading(true);
        const response = await axios.get(
  "https://barangay-58-request-system-n07q.onrender.com/api/requests/statuses"
);
        setStatuses(response.data);
        setStatusError(null);
      } catch (err) {
        setStatusError('Failed to load status options');
        setStatuses([]);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    // Initialize only once on mount
    const initialize = async () => {
      await fetchRequests()
      await fetchUserData()
      await fetchCertificates(); // Call new fetch function
    }
    initialize()

    // Cleanup function
    return () => {
      // Cancel any pending requests if needed
    }
  }, [fetchRequests, fetchUserData, fetchCertificates]) // Added fetchCertificates to dependencies

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

  // Filter to show only non-pending requests (hide pending)
  const approvedRequests = useMemo(
  () => requests.filter((request) => {
    // Exclude 'Pending' requests so they only appear after status is changed
    const statusName = (request.status || '').toLowerCase();
    return statusName !== 'pending';
  }),
  [requests],
);

  // Filter requests based on type, status, and search query
  const filteredRequests = useMemo(() => {
    // First, get the ID of the selected certificate type if a filter is active
    const selectedCertId = typeFilter === "All" || typeFilter === "VerifiedRBI"
      ? null
      : certificates.find(cert => cert.name === typeFilter)?.id; // Find the ID based on the name

    // First filter by type, status, and search
    const filtered = approvedRequests.filter((request) => {
      // MODIFIED: Use certificate_id for type matching
      const matchesType = typeFilter === "All" || (selectedCertId !== null && request.certificate_id === selectedCertId);

      const matchesStatus = statusFilter === "All" || request.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        `${request.last_name}, ${request.first_name} ${request.middle_name || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        // --- Add control number search ---
        || (request.control_id && request.control_id.toLowerCase().includes(searchQuery.toLowerCase()));

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
  }, [approvedRequests, typeFilter, statusFilter, searchQuery, sortBy, certificates]) // ADDED 'certificates' to dependencies

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

  // Helper for suffix display (no "None" if blank or 1)
  const getSuffixDisplay = (suffixId) => {
    switch (String(suffixId)) {
      case "2": return "Jr.";
      case "3": return "Sr.";
      case "4": return "I";
      case "5": return "II";
      case "6": return "III";
      case "7": return "IV";
      case "8": return "V";
      default: return "";
    }
  };

  // Helper for sex display
  const getSexDisplay = (sex, sexOther) => {
    switch (String(sex)) {
      case "1": return "Male";
      case "2": return "Female";
      case "3": return "Prefer Not To Say";
      case "4": return sexOther ? sexOther : "Other";
      default: return "";
    }
  };

  // Helper to get status name from status_id
  const getStatusName = (status_id) => {
    const status = statuses.find(s => s.id === status_id);
    return status ? status.name : '';
  };

  // Helper to get status class from status_id
  const getStatusClassById = (status_id) => {
    const status = statuses.find(s => s.id === status_id);
    if (!status) return '';
    switch ((status.name || '').toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'for_pickup': return 'status-pickup';
      default: return '';
    }
  };

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
    axios.delete(
      `https://barangay-58-request-system-n07q.onrender.com/api/requests/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  )
);
      await fetchRequests()
      setSelectedRequests([])
      setShowBulkDeleteModal(false)
    } catch (error) {
      console.error("Error deleting requests:", error)
      alert("Failed to delete selected requests")
    }
  }

  const handlePrintRequest = async (request) => {
  setIsPrinting((prev) => ({ ...prev, [request.id]: true }));
  try {
    let control_id = request.control_id;
    const eligibleTypes = [
      'Barangay ID Application',
      'Barangay Clearance',
      'Certificate of Indigency',
      'Barangay Certificate',
      'Clearance',
      'Indigency'
    ];
    
    const certName = request.certificate_name;
    
    if (eligibleTypes.map(n => n.toLowerCase()).includes(certName.toLowerCase())) {
      if (!control_id) {
        const token = localStorage.getItem("token");
        const resp = await axios.post(
  `https://barangay-58-request-system-n07q.onrender.com/api/requests/${request.id}/generate-control-id`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);
        control_id = resp.data.control_id;
        
        // Update the requests in context/state
        await fetchRequests();
      }
    }

    // Map frontend certificate names to backend types
    const certificateTypeMap = {
      'Barangay ID Application': 'IDApp',
      'Barangay Clearance': 'ClearanceCert',
      'Certificate of Indigency': 'IndigencyCert',
      'Barangay Jobseeker': 'JobseekerCert',
      'Barangay Certificate': 'BrgyCert'
    };

    // Get the backend type from the map
    const backendCertificateType = certificateTypeMap[certName] || certName;

    const response = await axios.post(
  "https://barangay-58-request-system-n07q.onrender.com/api/certificates/generate-pdf",
  {
    requestData: {
      ...request,
      type_of_certificate: backendCertificateType,
      control_id: control_id,
      s3_key: request.s3_key,
    },
  },
  {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);
    // Handle ZIP for Jobseeker certificates
    if (certName === "Barangay Jobseeker") {
      const file = new Blob([response.data], { type: "application/zip" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `JobseekerDocuments_${request.last_name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } else {
      // Handle regular PDFs
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `${certName.replace(/\s+/g, '_')}_${request.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    }
  } catch (error) {
    console.error("Error printing certificate:", error);
    alert(`Failed to generate certificate: ${error.message}`);
  } finally {
    setIsPrinting((prev) => ({ ...prev, [request.id]: false }));
  }
};

  if (requestsLoading || certificates.length === 0) return <div className="loading">Loading...</div> // Adjust loading check
  if (requestsError) return <div className="error">Error: {requestsError}</div>

  // If on a small screen, show the desktop-only message
  if (isSmallScreen) {
    return (
      <div className="admin-mobile-message">
        <div className="mobile-warning">
          <i className="fas fa-tablet-alt" style={{ fontSize: "3rem", color: "#da1c6f", marginBottom: "1rem" }}></i>
          <h2>Device Compatibility Notice</h2>
          <p>The Admin Dashboard is optimized for:</p>
          <div className="device-list">
            <p><strong>✓ Tablets</strong> (iPad, iPad Mini, etc.)</p>
            <p><strong>✓ Desktop computers</strong></p>
            <p><strong>✓ Laptops</strong></p>
          </div>
          <p style={{ marginTop: "1rem", color: "#666" }}>For the best experience, please use one of these devices.</p>
          <button
            className="back-button"
            onClick={() => navigate("/")}
            style={{
              marginTop: "1.5rem",
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
                    {/* MODIFIED: Dynamically generate tabs based on fetched certificates */}
                    {["VerifiedRBI", "All"]
                      .concat(certificates.map(cert => cert.name))
                      .map((type) => (
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
                      ))}
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
                              <th>Control Number</th>
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
                                <td>{request.control_id || 'Pending'}</td>
                                <td>{request.created_at}</td>
                                <td>{`${request.last_name}, ${request.first_name} ${request.middle_name || ""}`}</td>
                                <td>{getSuffixDisplay(request.suffix_id || request.suffix)}</td>
                                <td>{getSexDisplay(request.sex, request.sex_other) || request.sex_display || request.sex_name || ""}</td>
                                <td>{request.birthday ? request.birthday.split("T")[0] : ""}</td>
                                <td>{calculateAge(request.birthday)}</td>
                                <td>{request.address}</td>
                                <td>{request.contact_no}</td>
                                <td>{request.email}</td>
                                <td>{request.certificate_name}</td>
                                <td>{request.purpose_of_request}</td>
                                <td>{request.number_of_copies}</td>
                                <td>
                                  <span className={`status-badge ${getStatusClassById(request.status_id)}`}>
                                    {getStatusName(request.status_id)}
                                  </span>
                                  {statusLoading ? (
                                    <div className="status-loading">Loading options...</div>
                                  ) : statusError ? (
                                    <div className="status-error">Status options unavailable</div>
                                  ) : (
                                    <select
                                      value={request.status_id}
                                      onChange={async e => {
                                        const selectedStatusId = Number(e.target.value);
                                        const rejectedStatus = statuses.find(s => s.name.toLowerCase() === 'rejected');
                                        if (selectedStatusId === rejectedStatus?.id) {
                                          // Delete request (backend should move to backup_requests and delete file)
                                          try {
                                            const token = localStorage.getItem("token");
                                            await axios.delete(`http://localhost:5000/api/requests/${request.id}`, {
                                              headers: { Authorization: `Bearer ${token}` },
                                            });
                                            fetchRequests();
                                          } catch (err) {
                                            alert('Failed to reject and delete request.');
                                          }
                                        } else {
                                          await updateRequestStatus(request.id, selectedStatusId);
                                          fetchRequests();
                                        }
                                      }}
                                      className={getStatusClassById(request.status_id)}
                                    >
                                      {statuses.map(status => (
                                        <option key={status.id} value={status.id}>{status.name}</option>
                                      ))}
                                    </select>
                                  )}
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
                                  {/* Add this button for viewing details */}
                                  <button
                                    className="view-btn"
                                    onClick={() => handleViewRequestDetails(request)}
                                    title="View Details"
                                  >
                                    <i className="fas fa-eye"></i>
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
        <ComparisonModal
          isOpen={showRbiComparison}
          request={selectedRequest}
          rbis={similarRbis}
          onClose={() => setShowRbiComparison(false)}
        />
      )}
      <BackupRequestsModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        type={backupModalType}
        statuses={statuses} // Pass statuses to modal
        onRestore={fetchRequests}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteRequest}
      />
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          localStorage.removeItem("token")
          navigate("/")
        }}
      />
      <BulkDeleteConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        count={selectedRequests.length}
      />
      {/* Add the RequestDetailsModal */}
      <RequestDetailsModal
        isOpen={showRequestDetailsModal}
        onClose={() => setShowRequestDetailsModal(false)}
        request={requestDetails}
      />
      <RequestDetailsModal 
  isOpen={isRequestDetailsOpen}
  onClose={() => setIsRequestDetailsOpen(false)}
  request={selectedRequestDetails}
/>
    </>
    
  )
}

export default Admin