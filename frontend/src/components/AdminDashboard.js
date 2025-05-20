"use client"

import React from "react" // Explicitly import React
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminDashboard.css"
import { Users, Home } from "lucide-react"
import StatsCard from "./StatsCard"

// Import Recharts components conditionally to avoid hook issues
const RechartsComponents = React.lazy(() => import("./RechartsComponents"))

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
    // New statistics
    totalRegisteredFamilies: 0,
    totalRegisteredResidents: 0,
    genderRatio: { male: 0, female: 0 },
    ageBrackets: {
      toddler: 0, // 1-3 years
      child: 0, // 4-12 years
      teenager: 0, // 13-19 years
      youngAdult: 0, // 20-35 years
      adult: 0, // 36-59 years
      seniorCitizen: 0, // 60+ years
    },
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
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPassword, setImportPassword] = useState("")
  const [importPasswordError, setImportPasswordError] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [chartsLoaded, setChartsLoaded] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
        axios.get(`${baseURL}/events`, { headers }),
      ])


      // Process certificate requests data
      const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : []
      const pendingRequests = requests.filter((req) => req?.status?.toLowerCase() === "pending")
      const approvedRequests = requests.filter((req) => req?.status?.toLowerCase() === "approved")
      const rejectedRequests = requests.filter((req) => req?.status?.toLowerCase() === "rejected")

      // Process RBI data - ensure we're getting the correct data structure
      let rbiData = []
      if (Array.isArray(rbiResponse.data)) {
        rbiData = rbiResponse.data
      } else if (rbiResponse.data && Array.isArray(rbiResponse.data.records)) {
        rbiData = rbiResponse.data.records
      }

      const pendingRBI = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "pending")
      const approvedRBI = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "approved")
      const rejectedRBI = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "rejected")

      // Get recent requests (last 5)
      const sortedRequests = [...requests]
        .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0))
        .slice(0, 5)

      // Get recent RBI registrations (last 5)
      const sortedRBI = [...rbiData]
        .sort(
          (a, b) =>
            new Date(b?.created_at || b?.submission_date || 0) - new Date(a?.created_at || a?.submission_date || 0),
        )
        .slice(0, 5)

      // Calculate demographic statistics for approved registrations only
      const approvedRegistrations = rbiData.filter((rbi) => rbi?.status?.toLowerCase() === "approved")

      // 1. Count unique "head of family" entries for Total Registered Families
      const uniqueHeadsOfFamily = new Set()
      approvedRegistrations.forEach((registration) => {
        // Check if this is a head of family entry
        if (
          registration.is_head_of_family === true ||
          registration.is_head_of_family === "true" ||
          registration.is_head_of_family === 1
        ) {
          if (registration.household_id) {
            uniqueHeadsOfFamily.add(registration.household_id)
          }
        }
      })
      const totalRegisteredFamilies = approvedRegistrations.length

      // 2. Count total residents (heads of families + family members)
      let totalResidents = 0
      let maleCount = 0
      let femaleCount = 0
      const ageBrackets = {
        toddler: 0, // 1-3 years
        child: 0, // 4-12 years
        teenager: 0, // 13-19 years
        youngAdult: 0, // 20-35 years
        adult: 0, // 36-59 years
        seniorCitizen: 0, // 60+ years
      }

      // Process each approved registration
      // In the fetchDashboardData function, replace the age calculation part with this:

// Process each approved registration for age calculation

approvedRegistrations.forEach((registration) => {
  // Count the head of family
  totalResidents++

  // Process gender (using sex field)
  const gender = (registration.sex || registration.gender || "").toLowerCase()
  if (gender === "male" || gender === "m") {
    maleCount++
  } else if (gender === "female" || gender === "f") {
    femaleCount++
  }
 
  // Calculate age from birth_date if available
  if (registration.birth_date) {
    const birth_date = new Date(registration.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birth_date.getFullYear()
    const monthDiff = today.getMonth() - birth_date.getMonth()
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth_date.getDate())) {
      age--
    }

    // Categorize into age brackets
    if (age <= 0 && age <= 3) {
      ageBrackets.toddler++
    } else if (age >= 4 && age <= 12) {
      ageBrackets.child++
    } else if (age >= 13 && age <= 19) {
      ageBrackets.teenager++
    } else if (age >= 20 && age <= 35) {
      ageBrackets.youngAdult++
    } else if (age >= 36 && age <= 59) {
      ageBrackets.adult++
    } else if (age >= 60) {
      ageBrackets.seniorCitizen++
    }
  }

  // Process household members
  if (registration.members && Array.isArray(registration.members)) {
    registration.members.forEach((member) => {
      totalResidents++

      // Process member gender
      const memberGender = (member.sex || member.gender || "").toLowerCase()
      if (memberGender === "male" || memberGender === "m") {
        maleCount++
      } else if (memberGender === "female" || memberGender === "f") {
        femaleCount++
      }
      // Calculate age from birth_date for household members
      if (member.birth_date) {
        const birth_date = new Date(member.birth_date)
        const today = new Date()
        let age = today.getFullYear() - birth_date.getFullYear()
        const monthDiff = today.getMonth() - birth_date.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth_date.getDate())) {
          age--
        }
        // Categorize into age brackets
        if (age <= 0 && age <= 3) {
          ageBrackets.toddler++
        } else if (age >= 4 && age <= 12) {
          ageBrackets.child++
        } else if (age >= 13 && age <= 19) {
          ageBrackets.teenager++
        } else if (age >= 20 && age <= 35) {
          ageBrackets.youngAdult++
        } else if (age >= 36 && age <= 59) {
          ageBrackets.adult++
        } else if (age >= 60) {
          ageBrackets.seniorCitizen++
        }
      }
    })
  }
})


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
        // New statistics
        totalRegisteredFamilies,
        totalRegisteredResidents: totalResidents,
        genderRatio: { male: maleCount, female: femaleCount },
        ageBrackets,
      })

      setRecentRequests(sortedRequests)
      setRecentRBI(sortedRBI)
      setError(null)
      setLastUpdated(new Date())
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
        totalRegisteredFamilies: 0,
        totalRegisteredResidents: 0,
        genderRatio: { male: 0, female: 0 },
        ageBrackets: {
          toddler: 0,
          child: 0,
          teenager: 0,
          youngAdult: 0,
          adult: 0,
          seniorCitizen: 0,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to manually refresh dashboard data
  const refreshDashboardData = () => {
    fetchDashboardData()
  }

  // Load Recharts components when demographics tab is active
  useEffect(() => {
    if (activeTab === "demographics") {
      // Dynamically import Recharts when needed
      import("./RechartsComponents")
        .then(() => {
          setChartsLoaded(true)
        })
        .catch((err) => {
          console.error("Failed to load charts:", err)
        })
    }
  }, [activeTab])

  const handleExportDatabase = async () => {
    try {
      setIsExporting(true)
      setExportError(null)
      const token = localStorage.getItem("token")

      // Show password modal instead of direct export
      setShowPasswordModal(true)
    } catch (err) {
      console.error("Export error:", err)
      setExportError("Export failed. Please check server connections and permissions.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleConfirmExport = async () => {
    try {
      setIsExporting(true)
      setPasswordError("")

      const token = localStorage.getItem("token")

      const response = await axios.post(
        "http://localhost:5000/api/export/export-database",
        { password: adminPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `backup-${new Date().toISOString().slice(0, 10)}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      setShowPasswordModal(false)
      setAdminPassword("")
    } catch (err) {
      console.error("Export failed:", err)
      if (err.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.")
      } else {
        setExportError("Export failed. Please check your connection or try again later.")
        setShowPasswordModal(false)
      }
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportDatabase = async () => {
    if (!selectedFile) {
      setImportError("Please select a SQL file to import")
      return
    }

    try {
      setIsImporting(true)
      setImportError(null)
      setImportPasswordError("")

      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("sqlFile", selectedFile)
      formData.append("password", importPassword)

      const response = await axios.post("http://localhost:5000/api/import/import-database", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setShowImportModal(false)
      setSelectedFile(null)
      setImportPassword("")
      alert("Database imported successfully! The page will now refresh.")
      window.location.reload()
    } catch (err) {
      console.error("Import failed:", err)
      if (err.response?.status === 401) {
        setImportPasswordError("Incorrect password. Please try again.")
      } else {
        setImportError(err.response?.data?.error || "Import failed. Please try again.")
      }
    } finally {
      setIsImporting(false)
    }
  }

  // Add this file change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.name.endsWith(".sql") || file.type === "application/sql") {
        setSelectedFile(file)
        setImportError(null)
      } else {
        setImportError("Please select a valid .sql file")
        setSelectedFile(null)
      }
    }
  }

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

  // Prepare data for charts
  const genderData = [
    { name: "Male", value: stats.genderRatio.male },
    { name: "Female", value: stats.genderRatio.female },
  ]

  const ageBracketData = [
    { name: "Toddler (1-3)", value: stats.ageBrackets.toddler },
    { name: "Child (4-12)", value: stats.ageBrackets.child },
    { name: "Teen (13-19)", value: stats.ageBrackets.teenager },
    { name: "Young Adult (20-35)", value: stats.ageBrackets.youngAdult },
    { name: "Adult (36-59)", value: stats.ageBrackets.adult },
    { name: "Senior (60+)", value: stats.ageBrackets.seniorCitizen },
  ]

  const GENDER_COLORS = ["#8884d8", "#FF6B6B"]
  const AGE_COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57"]

  const renderCSSPieChart = () => {
    const total = stats.genderRatio.male + stats.genderRatio.female

    // If no data, show a message
    if (total === 0) {
      return (
        <div className="no-data-chart">
          <p>No gender data available</p>
        </div>
      )
    }

    const malePercentage = (stats.genderRatio.male / total) * 100
    const femalePercentage = (stats.genderRatio.female / total) * 100

    return (
      <div className="css-pie-chart-container">
        <div className="css-pie-chart">
          {malePercentage > 0 && (
            <div
              className="css-pie-segment male-segment"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${malePercentage >= 50 ? "100% 0%" : "50% 0%"}, 100% 50%, 50% 50%)`,
                backgroundColor: "#8884d8",
                transform: malePercentage >= 50 ? "none" : "rotate(0deg)",
                zIndex: 2,
              }}
            ></div>
          )}
          {femalePercentage > 0 && (
            <div
              className="css-pie-segment female-segment"
              style={{
                transform: `rotate(${malePercentage * 3.6}deg)`,
                clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%)",
                backgroundColor: "#FF6B6B",
                zIndex: 1,
              }}
            ></div>
          )}
        </div>
        <div className="css-pie-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#8884d8" }}></span>
            <span>
              Male: {stats.genderRatio.male} ({Math.round(malePercentage)}%)
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#FF6B6B" }}></span>
            <span>
              Female: {stats.genderRatio.female} ({Math.round(femalePercentage)}%)
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderCSSBarChart = () => {
    const values = Object.values(stats.ageBrackets)
    const maxValue = Math.max(...values, 1) // Avoid division by zero

    // If all values are 0, show a message
    if (values.every((value) => value === 0)) {
      return (
        <div className="no-data-chart">
          <p>No age data available</p>
        </div>
      )
    }

    return (
      <div className="css-bar-chart-container">
        <div className="css-bar-chart">
          {Object.entries(stats.ageBrackets).map(([key, value], index) => {
            const height = (value / maxValue) * 100
            const labels = {
              toddler: "Toddler (1-3)",
              child: "Child (4-12)",
              teenager: "Teen (13-19)",
              youngAdult: "Young Adult (20-35)",
              adult: "Adult (36-59)",
              seniorCitizen: "Senior (60+)",
            }

            return (
              <div key={key} className="css-bar-item">
                <div className="css-bar-container">
                  <div
                    className="css-bar"
                    style={{
                      height: `${height}%`,
                      backgroundColor: AGE_COLORS[index % AGE_COLORS.length],
                    }}
                  >
                    <span className="css-bar-value">{value}</span>
                  </div>
                </div>
                <div className="css-bar-label">{labels[key]}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
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

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "demographics" ? "active" : ""}`}
          onClick={() => setActiveTab("demographics")}
        >
          Demographics
        </button>
      </div>

      <div className="dashboard-actions">
        <button onClick={() => setShowPasswordModal(true)} disabled={isExporting} className="export-button">
          {isExporting ? "Exporting..." : "Export Database"}
        </button>
        {exportError && <div className="error-message">{exportError}</div>}
        <button onClick={() => setShowImportModal(true)} disabled={isImporting} className="import-button">
          {isImporting ? "Importing..." : "Import Database"}
        </button>
        {importError && <div className="error-message">{importError}</div>}
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <>
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
          </>
        )}

        {activeTab === "demographics" && (
          <div className="demographics-container">
            <h2>Approved Registration Demographics</h2>
            <p className="demographics-subtitle">Statistics based on approved registrations only</p>

            <div className="demographics-actions">
              <div className="data-source-info">
                <span className="data-source-label">Data Source:</span>
                <span className="data-source-value">RBI Approved Registrations</span>
                <span className="data-source-timestamp">Last updated: {lastUpdated.toLocaleString()}</span>
              </div>
              <button onClick={refreshDashboardData} disabled={loading} className="refresh-button">
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>

            <div className="demographics-stats">
              <StatsCard
                title="Registered Families"
                value={stats.totalRegisteredFamilies}
                icon={<Home size={24} />}
                color="blue"
              />

              <StatsCard
                title="Registered Residents"
                value={stats.totalRegisteredResidents}
                icon={<Users size={24} />}
                color="green"
              />
            </div>

            <div className="demographics-charts">
              <div className="chart-container">
                <h3>Gender Distribution</h3>
                <div className="chart-wrapper">
                  {loading ? (
                    <div className="chart-loading">
                      <div className="spinner"></div>
                      <p>Loading chart data...</p>
                    </div>
                  ) : (
                    renderCSSPieChart()
                  )}
                </div>
                <div className="chart-summary">
                  <div className="summary-item">
                    <span className="summary-label">Male:</span>
                    <span className="summary-value">{stats.genderRatio.male}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Female:</span>
                    <span className="summary-value">{stats.genderRatio.female}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Ratio:</span>
                    <span className="summary-value">
                      {stats.genderRatio.male}:{stats.genderRatio.female}
                    </span>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h3>Age Distribution</h3>
                <div className="chart-wrapper">
                  {loading ? (
                    <div className="chart-loading">
                      <div className="spinner"></div>
                      <p>Loading chart data...</p>
                    </div>
                  ) : (
                    renderCSSBarChart()
                  )}
                </div>
                <div className="age-brackets-summary">
                  <div className="age-bracket-item">
                    <span className="age-bracket-label">Toddler (1-3):</span>
                    <span className="age-bracket-value">{stats.ageBrackets.toddler}</span>
                  </div>
                  <div className="age-bracket-item">
                    <span className="age-bracket-label">Child (4-12):</span>
                    <span className="age-bracket-value">{stats.ageBrackets.child}</span>
                  </div>
                  <div className="age-bracket-item">
                    <span className="age-bracket-label">Teen (13-19):</span>
                    <span className="age-bracket-value">{stats.ageBrackets.teenager}</span>
                  </div>
                  <div className="age-bracket-item">
                    <span className="age-bracket-label">Young Adult (20-35):</span>
                    <span className="age-bracket-value">{stats.ageBrackets.youngAdult}</span>
                  </div>
                  <div className="age-bracket-item">
                    <span className="age-bracket-label">Adult (36-59):</span>
                    <span className="age-bracket-value">{stats.ageBrackets.adult}</span>
                  </div>
                  <div className="age-bracket-item">
                    <span className="age-bracket-label">Senior (60+):</span>
                    <span className="age-bracket-value">{stats.ageBrackets.seniorCitizen}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
                style={{ display: "none" }}
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
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setSelectedFile(null)
                  setImportPassword("")
                  setImportError(null)
                }}
              >
                Cancel
              </button>
              <button onClick={handleImportDatabase} disabled={isImporting || !selectedFile || !importPassword}>
                {isImporting ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
