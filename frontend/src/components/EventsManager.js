"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import "../styles/EventsManager.css"
import AddEvent from "./AddEvent"
import BackupEventsModal from "./BackupEventsModal"
import axios from "axios"

function EventsManager() {
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [sortBy, setSortBy] = useState("All")
  const [viewMode, setViewMode] = useState("table")
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/events")
      setEvents(response.data)
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleEdit = (event) => {
    setEditingEvent({
      id: event.id,
      name: event.event_name,
      date: event.event_date,
      timeStart: event.time_start,
      timeEnd: event.time_end,
      venue: event.venue,
      description: event.description,
      image_url: event.image_url,
    })
    setShowAddEvent(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await axios.delete(`http://localhost:5000/api/events/${id}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Delete failed: ${errorText}`)
      }

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id))
    } catch (error) {
      console.error("Delete error:", error)
      alert(`Delete failed: ${error.message}`)
    }
  }

  const handleEditSubmit = (updatedEvent) => {
    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id ? { ...updatedEvent, id: event.id, isPublished: event.isPublished } : event,
    )
    setEvents(updatedEvents)
    setShowAddEvent(false)
    setEditingEvent(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
    return date.toLocaleDateString(undefined, options)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila"
    }
    return date.toLocaleString(undefined, options)
  }

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.event_name,
    start: event.event_date,
    allDay: true,
    extendedProps: {
      time_start: event.time_start,
      time_end: event.time_end,
      venue: event.venue,
    },
  }))

  const handleSelectEvent = (id) => {
    setSelectedEvents(prev => {
      if (prev.includes(id)) {
        return prev.filter(eventId => eventId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEvents(events.map(event => event.id))
    } else {
      setSelectedEvents([])
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedEvents.length === 0) {
      alert("Please select at least one event to delete")
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedEvents.length} selected event(s)?`)) {
      return
    }

    setIsDeleting(true)
    try {
      for (const id of selectedEvents) {
        await axios.delete(`http://localhost:5000/api/events/${id}`)
      }
      fetchEvents()
      setSelectedEvents([])
      alert("Successfully deleted selected events")
    } catch (error) {
      console.error("Error deleting events:", error)
      alert("Failed to delete some events")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <div className="loading">Loading events...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="events-section">
      {/* Switch Buttons */}
      <div className="view-buttons">
        <button className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>
          Table View
        </button>
        <button className={viewMode === "calendar" ? "active" : ""} onClick={() => setViewMode("calendar")}>
          Calendar View
        </button>
      </div>
      {viewMode === "table" ? (
        <>
          <div className="table-header">
            <div className="events-count">
              Events <span className="event-count">({events.length})</span>
            </div>
            <div className="table-controls">
              <div className="events-filter">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="All">Sort by: All</option>
                  <option value="Date">Sort by: Date</option>
                  <option value="Name">Sort by: Name</option>
                  <option value="Published">Sort by: Published</option>
                </select>
              </div>
              {selectedEvents.length > 0 && (
                <button
                  className="bulk-delete-btn"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  style={{ marginRight: "10px" }}
                >
                  {isDeleting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-trash-alt"></i> Delete Selected ({selectedEvents.length})
                    </>
                  )}
                </button>
              )}
              <button
                className="retrieve-data-btn"
                onClick={() => setShowBackupModal(true)}
                style={{
                  backgroundColor: "#da1c6f",
                  marginRight: "10px"
                }}
              >
                <i className="fas fa-undo"></i>
                Retrieve Data
              </button>
              <button className="add-request-btn" onClick={() => setShowAddEvent(true)}>
                + Add Event
              </button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedEvents.length === events.length && events.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ width: "5%" }}>NO.</th>
                  <th style={{ width: "15%" }}>IMAGE</th>
                  <th style={{ width: "13%" }}>CREATED AT</th>
                  <th style={{ width: "15%" }}>EVENT NAME</th>
                  <th style={{ width: "12%" }}>DATE</th>
                  <th style={{ width: "15%" }}>TIME</th>
                  <th style={{ width: "15%" }}>VENUE</th>
                  <th style={{ width: "10%" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={event.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleSelectEvent(event.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt="Event"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.jpg"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f8f9fa",
                          color: "#6c757d",
                          border: "1px dashed #dee2e6",
                          borderRadius: "4px",
                          fontSize: "10px",
                          textAlign: "center",
                          padding: "4px"
                        }}>
                          <i className="fas fa-image" style={{ fontSize: "16px", marginBottom: "2px" }}></i>
                          <span>No image</span>
                        </div>
                      )}
                    </td>
                    <td>{formatDateTime(event.created_at)}</td>
                    <td>{event.event_name || "No name"}</td>
                    <td>{formatDate(event.event_date)}</td>
                    <td>
                      {event.time_start} - {event.time_end}
                    </td>
                    <td>{event.venue}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(event)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek,dayGridDay",
            }}
            eventClick={(info) => {
              const event = events.find((e) => e.id === parseInt(info.event.id))
              if (event) handleEdit(event)
            }}
          />
        </div>
      )}

      {showAddEvent && (
        <AddEvent
          onClose={() => {
            setShowAddEvent(false)
            setEditingEvent(null)
          }}
          onSubmit={handleEditSubmit}
          editingEvent={editingEvent}
        />
      )}

      <BackupEventsModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onRestore={fetchEvents}
      />
    </div>
  )
}

export default EventsManager
