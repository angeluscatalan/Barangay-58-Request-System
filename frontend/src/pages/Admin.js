"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../styles/Admin.css"
import brgyLoginPageLogo from "../assets/brgyLoginPageLogo.png"
import EventsManager from "../components/EventsManager"
import Request_Manager from "../components/Request_Manager";
import Account_Manager from "../components/Account_Manager";


function Admin() {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeSection, setActiveSection] = useState("requests")
  const [requests, setRequests] = useState([])
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [userAccessLevel, setUserAccessLevel] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Add some debugging
        console.log("Token found:", token ? "Yes" : "No");
        
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/");
          return;
        }
        
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("User data response:", response.data);
        setUserAccessLevel(response.data.access_level);
        console.log("Access Level:", response.data.access_level);
      } catch (error) {
        console.error("Error fetching user data:", error.response ? error.response.data : error.message);
        navigate("/");
      }
    };

    
    
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/requests")
        setRequests(response.data)
      } catch (error) {
        console.error("Error fetching requests:", error)
      }
    }

    fetchUserData(); // Call the function to fetch user data
    fetchRequests(); // Call the function to fetch requests
  }, []); // Empty dependency array means this runs once on component mount

  const handleSectionChange = (section) => {
    if (section === "acc_manager" && userAccessLevel !== 2) {
      alert("You don't have permission to access Accounts Manager")
      return
    }
    setActiveSection(section)
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/requests/${id}`,
        { status: newStatus },
        {
          headers: { "Content-Type": "application/json" },
        },
      )
      setRequests((prevRequests) => prevRequests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)))
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  // Filter requests based on type, status, and search query
  const filteredRequests = requests.filter((request) => {
    const matchesType = typeFilter === "All" || request.type_of_certificate === typeFilter
    const matchesStatus = statusFilter === "All" || request.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      `${request.last_name}, ${request.first_name} ${request.middle_name || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "approved":
        return "status-approved"
      case "rejected":
        return "status-rejected"
      case "for pickup":
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

  return (
    <>
      <div className="top-line"></div>
      <div className="admin-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <img src={brgyLoginPageLogo || "/placeholder.svg"} alt="Barangay Logo" className="admin-logo" />
            <h1>BARANGAY 58</h1>
          </div>
          <nav>
            <ul>
              <li className={activeSection === "requests" ? "active" : ""} onClick={() => handleSectionChange("requests")}>
                Certificate Request
              </li>
              <li className={activeSection === "events" ? "active" : ""} onClick={() => handleSectionChange("events")}>
                Events Manager
              </li>
              <li className={activeSection === "req_manager" ? "active" : ""}  onClick={() => handleSectionChange("req_manager")}>
                Requests Manager
              </li>
              {userAccessLevel === 2 && (
                <li className={activeSection === "acc_manager" ? "active" : ""} 
                    onClick={() => handleSectionChange("acc_manager")}>
                  Accounts Manager
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div className="main-content">
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
                  <button
                    onClick={() => {
                      // Clear all auth-related items
                      localStorage.removeItem("token");
                      localStorage.removeItem("access_level");
                      navigate("/");
                    }}
                    className="logout-button"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
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
              <div className="dashboard-content" style={{ height: zoomLevel !== 100 ? `calc(100vh - 200px)` : 'auto' }}>
                <div className="filter-tabs">
                    {["All", "ClearanceCert", "IDApp", "IndigencyCert", "JobseekerCert", "BrgyCert"].map((type) => ( <button key={type} className={`tab-button ${typeFilter === type ? "active-tab" : ""}`} onClick={() => setTypeFilter(type)}>
                      {type === "All" ? "All Types" : type} </button> ))}
                </div>
                <div 
                  className="table-container"
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transformOrigin: "top left",
                    width: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : '100%',
                    height: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : '100%',
                    overflow: 'auto'
                  }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>SUFFIX</th>
                        <th>SEX</th>
                        <th>BIRTHDAY</th>
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
                          <td>{`${request.last_name}, ${request.first_name} ${request.middle_name || ""}`}</td>
                          <td>{request.suffix}</td>
                          <td>{request.sex}</td>
                          <td>{request.birthday ? request.birthday.split("T")[0] : ""}</td>
                          <td>{request.address}</td>
                          <td>{request.contact_no}</td>
                          <td>{request.email}</td>
                          <td>{request.type_of_certificate}</td>
                          <td>{request.purpose_of_request}</td>
                          <td>{request.number_of_copies}</td>
                          <td>
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