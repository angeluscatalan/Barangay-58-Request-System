"use client"

import { useContext } from "react"
import { EventsContext } from "./events-context"

const EventCard = ({ event, defaultImage }) => {
  const { setExpandedEvent } = useContext(EventsContext)

  const handleCardClick = () => {
    // Instead of expanding the card, we'll show a modal with the event details
    setExpandedEvent(event)
  }

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div className="event-image-container">
        <img src={event.imageUrl || defaultImage} alt={event.name} className="event-image" />
      </div>
      <div className="event-info">
        <h3 className="event-title">{event.name}</h3>
        <p className="event-date">
          📅 {event.date} &nbsp; 🕘{" "}
          <span className="event-time">
            {event.timeStart} - {event.timeEnd}
          </span>
        </p>
        <p className="event-venue">
          <strong>Venue:</strong> {event.venue}
        </p>
        <div className="event-description-container">
          <p className="event-description">{event.description}</p>
        </div>
      </div>
    </div>
  )
}

export default EventCard

