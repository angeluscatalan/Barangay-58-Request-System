"use client"

import { useState } from "react"
import { ChevronDown, MoreVertical } from "lucide-react"

function DashboardCard({
  title,
  children,
  actions = [],
  collapsible = false,
  defaultCollapsed = false,
  className = "",
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [showActions, setShowActions] = useState(false)

  return (
    <div className={`dashboard-card ${className} ${collapsed ? "collapsed" : ""}`}>
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">{title}</h2>

        <div className="dashboard-card-controls">
          {actions.length > 0 && (
            <div className="dashboard-card-actions">
              <button
                className="action-menu-button"
                onClick={() => setShowActions(!showActions)}
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>

              {showActions && (
                <div className="action-menu">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      className="action-menu-item"
                      onClick={() => {
                        action.onClick()
                        setShowActions(false)
                      }}
                    >
                      {action.icon && <span className="action-icon">{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {collapsible && (
            <button
              className="collapse-button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              <ChevronDown size={16} className={collapsed ? "rotate" : ""} />
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-card-content">{children}</div>
    </div>
  )
}

export default DashboardCard
