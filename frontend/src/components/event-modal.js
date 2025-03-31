"use client"

import { useContext } from "react"
import { EventsContext } from "./events-context"

const EventModal = ({ defaultImage }) => {
  const { expandedEvent, setExpandedEvent } = useContext(EventsContext)

  if (!expandedEvent) return null

  const handleClose = () => {
    setExpandedEvent(null)
  }

  const handleOverlayClick = (e) => {
    // Close only if clicking the overlay, not the modal content
    if (e.target === e.currentTarget) {
      setExpandedEvent(null)
    }
  }

  return (
    <div className="event-modal-overlay" onClick={handleOverlayClick}>
      <div className="event-modal">
        <button className="modal-close-button" onClick={handleClose}>
          <span>✕</span>
        </button>

        <div className="modal-image-container">
          <img src={expandedEvent.image_url || defaultImage} alt={expandedEvent.name} className="modal-image" />
        </div>

        <div className="modal-content">
          <h2 className="modal-title">{expandedEvent.event_name}</h2>

          <div className="modal-details">
            <p className="modal-date">
              <span className="modal-icon">📅</span> {expandedEvent.event_date}
            </p>
            <p className="modal-time">
              <span className="modal-icon">🕘</span>
              <span className="time-value">
                {expandedEvent.time_start} - {expandedEvent.time_end}
              </span>
            </p>
            <p className="modal-venue">
              <span className="modal-icon">📍</span>
              <strong>Venue:</strong> {expandedEvent.venue}
            </p>
          </div>

          <div className="modal-description">
            <h3>Event Description</h3>
            <p>{expandedEvent.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal

