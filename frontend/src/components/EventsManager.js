"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import "../styles/EventsManager.css"
import AddEvent from "./AddEvent"
import BackupEventsModal from "./BackupEventsModal"
import DeleteConfirmationModal from "./DeleteConfirmationModal"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/events")
      if (response.data && Array.isArray(response.data.events)) {
        setEvents(response.data.events)
      } else {
        console.error("Invalid events data format:", response.data)
        setEvents([])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to fetch events")
      setEvents([])
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

  const handleDelete = (id) => {
    setEventToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventToDelete}`)
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete))
      setShowDeleteModal(false)
      setEventToDelete(null)
      setSuccessMessage("Event successfully deleted!")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Delete error:", error)
      alert(`Failed to delete event: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleEditSubmit = (updatedEvent) => {
    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id ? { ...updatedEvent, id: event.id, isPublished: event.isPublished } : event,
    )
    setEvents(updatedEvents)
    setShowAddEvent(false)
    setEditingEvent(null)
    setSuccessMessage("Event successfully updated!")
    setShowSuccessModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
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
      timeZone: "Asia/Manila",
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
    setSelectedEvents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((eventId) => eventId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEvents(events.map((event) => event.id))
    } else {
      setSelectedEvents([])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedEvents.length === 0) {
      alert("Please select at least one event to delete")
      return
    }

    setShowDeleteSelectedModal(true)
  }

  const confirmDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      for (const id of selectedEvents) {
        await axios.delete(`http://localhost:5000/api/events/${id}`)
      }
      fetchEvents()
      setSelectedEvents([])
      setShowDeleteSelectedModal(false)
      setSuccessMessage("Selected events successfully deleted!")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error deleting events:", error)
      alert("Failed to delete some events")
    } finally {
      setIsDeleting(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          (event.event_name || "").toLowerCase().includes(query) ||
          (event.venue || "").toLowerCase().includes(query) ||
          (event.description || "").toLowerCase().includes(query),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Date":
          return new Date(a.event_date || 0) - new Date(b.event_date || 0)
        case "Name":
          return (a.event_name || "").localeCompare(b.event_name || "")
        case "Latest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        case "Oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0)
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
    })

    return filtered
  }

  const handleAddEvent = (newEvent) => {
    setEvents(prevEvents => {
      const updatedEvents = [newEvent, ...prevEvents];
      console.log("Updated events:", updatedEvents); // Debug log
      return updatedEvents;
    });
    setShowAddEvent(false);
    setSuccessMessage("Event successfully added!");
    setShowSuccessModal(true);
  };

  if (loading) return <div className="loading">Loading events...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="events-manager-section">
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
          <div className="events-manager-header">
            <div className="events-manager-count">
              Events <span className="event-count">({filterEvents().length})</span>
            </div>
            <div className="events-manager-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="events-filter">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="Latest">Sort by: Latest</option>
                  <option value="Oldest">Sort by: Oldest</option>
                  <option value="Date">Sort by: Event Date</option>
                  <option value="Name">Sort by: Name</option>
                </select>
              </div>
              <button
                className="refresh-btn"
                onClick={fetchEvents}
                title="Refresh Events"
                style={{ marginRight: "10px" }}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
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
              <button className="add-request-btn" onClick={() => setShowAddEvent(true)}>
                <i className="fas fa-plus"></i> Add Event
              </button>
              <button className="retrieve-btn" onClick={() => setShowBackupModal(true)}>
                <i className="fas fa-undo"></i> Retrieve Data
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
                      checked={selectedEvents.length === filterEvents().length && filterEvents().length > 0}
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
                {filterEvents().map((event, index) => (
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
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            overflow: "hidden",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <img
                            src={event.image_url || "/placeholder.svg"}
                            alt="Event"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.2s ease",
                            }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder.jpg"
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div
                          style={{
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
                            padding: "4px",
                          }}
                        >
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
              const event = events.find((e) => e.id === Number.parseInt(info.event.id))
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
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditSubmit}
          editData={editingEvent}
        />
      )}

      <BackupEventsModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} onRestore={fetchEvents} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false)
          setEventToDelete(null)
        }}
      />

      {/* Delete Selected Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteSelectedModal}
        title="Delete Selected Events"
        message={`Are you sure you want to delete ${selectedEvents.length} selected event(s)?`}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setShowDeleteSelectedModal(false)}
      />

      {/* Success Modal */}
      <DeleteConfirmationModal
        isOpen={showSuccessModal}
        title="Success"
        message={successMessage}
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
        hideCancel={true}
        confirmText="OK"
      />
    </div>
  )
}

export default EventsManager
