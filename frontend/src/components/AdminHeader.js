"use client"

import { useState } from "react"
import { Bell, User, ChevronDown, LogOut } from "lucide-react"

function AdminHeader({ username = "Admin User", role = "Administrator" }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="admin-header">
      <div className="header-title">
        <h1>Dashboard</h1>
        <p className="breadcrumb">Home / Dashboard</p>
      </div>

      <div className="header-actions">
        <div className="notifications-container">
          <button
            className="notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && <button className="mark-all-read">Mark all as read</button>}
              </div>

              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="notification-item">
                      <div className="notification-icon">
                        <span className={`icon ${notification.type}`}></span>
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-container">
          <button className="profile-button" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="username">{username}</span>
              <span className="role">{role}</span>
            </div>
            <ChevronDown size={16} className={showProfileMenu ? "rotate" : ""} />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="avatar-large">
                  <User size={32} />
                </div>
                <div>
                  <h3>{username}</h3>
                  <p>{role}</p>
                </div>
              </div>

              <div className="profile-menu">
                <a href="#profile" className="profile-menu-item">
                  <User size={16} />
                  <span>My Profile</span>
                </a>
                <a href="#settings" className="profile-menu-item">
                  <span>Settings</span>
                </a>
                <button className="logout-button">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
