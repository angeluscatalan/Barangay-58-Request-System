"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import "../styles/EventsManager.css"
import AddEvent from "./AddEvent"

function EventsManager() {
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [sortBy, setSortBy] = useState("All")
  const [viewMode, setViewMode] = useState("table")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/events")
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }
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
      const response = await fetch(`http://localhost:5000/events/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text() // Read response body
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
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
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
              <button className="add-request-btn" onClick={() => setShowAddEvent(true)}>
                + Add Event
              </button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>NO.</th>
                  <th style={{ width: "20%" }}>IMAGE</th>
                  <th style={{ width: "20%" }}>EVENT NAME</th>
                  <th style={{ width: "15%" }}>DATE</th>
                  <th style={{ width: "20%" }}>TIME</th>
                  <th style={{ width: "20%" }}>VENUE</th>
                  <th style={{ width: "10%" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={event.id}>
                    <td>{index + 1}</td>
                    <td>
                      {event.image_url && (
                        <img
                          src={event.image_url || "/placeholder.svg"}
                          alt="Event"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.jpg"
                          }}
                        />
                      )}
                    </td>
                    <td>{event.event_name || "No name"}</td>
                    <td>{formatDate(event.event_date)}</td>
                    <td>
                      {event.time_start} - {event.time_end}
                    </td>
                    <td>{event.venue}</td>

                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => handleEdit(event)}>
                          <i className="fas fa-edit"></i>
                          <span>Edit</span>
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(event.id)}>
                          <i className="fas fa-trash"></i>
                          <span>Delete</span>
                        </button>
                      </div>
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
            eventColor="#da1c6f"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            buttonText={{
              today: "Today",
            }}
            height="auto"
            eventOverlap={false} // Prevent events from overlapping
            dayMaxEventRows={true} // Ensure multiple events are scrollable
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }}
            eventContent={(eventInfo) => {
              return (
                <div className="event-content">
                  <strong>{eventInfo.event.title}</strong> {/* Event title */}
                  <div>
                    Time: {eventInfo.event.extendedProps.time_start} - {eventInfo.event.extendedProps.time_end}
                  </div>{" "}
                  {/* Time range */}
                  <div>Venue: {eventInfo.event.extendedProps.venue}</div> {/* Venue */}
                </div>
              )
            }}
          />
        </div>
      )}
      {showAddEvent && (
        <div className="modal-overlay">
          <AddEvent
            onClose={() => {
              setShowAddEvent(false)
              setEditingEvent(null)
            }}
            editData={editingEvent}
            onEditEvent={handleEditSubmit}
            onAddEvent={(eventData) => {
              const newEvent = {
                ...eventData,
                id: Date.now(),
                isPublished: false,
                event_name: eventData.name || eventData.event_name,
                event_date: eventData.date || eventData.event_date,
                time_start: eventData.timeStart || eventData.time_start,
                time_end: eventData.timeEnd || eventData.time_end,
              }
              setEvents([...events, newEvent])
              setShowAddEvent(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default EventsManager
