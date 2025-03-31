"use client"

import { useContext } from "react"
import "../styles/Events.css"
import ScrollIcon from "../assets/SDA.png"
import Announcement from "../assets/Announce.png"
import EventCard from "../components/event-card"
import EventModal from "../components/event-modal"
import { EventsProvider, EventsContext } from "../components/events-context"

// Main component wrapper with context
const Events = () => {
  return (
    <EventsProvider>
      <EventsContent />
    </EventsProvider>
  )
}

// Inner component that uses context
const EventsContent = () => {
  const { publishedEvents, loading, expandedEvent } = useContext(EventsContext)

  const scrollToSection = () => {
    document.getElementById("second-section").scrollIntoView({
      behavior: "smooth",
    })
  }

  return (
    <>
      <section className="events-header-section">
        <div className="events-header">
          <h1>
            Stay Tuned, Stay Involved,
            <br /> Stay Connected!
          </h1>
          <p>
            Join us as we bring the community together through exciting events and meaningful
            <br /> gatherings.
          </p>
        </div>
        <div className="scroll-container">
          <p className="scroll-down" onClick={scrollToSection}>
            SCROLL DOWN
          </p>
          <img
            src={ScrollIcon || "/placeholder.svg"}
            alt="Scroll Down"
            className="scroll-down-icon"
            onClick={scrollToSection}
          />
        </div>
      </section>

      <section id="second-section" className="events-content-section">
        <div className="embed-container">
          <h2>Barangay 58 Facebook Updates</h2>
          <div className="events-content">
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61552676805291&tabs=timeline&width=500&height=350&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false&appId"
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
            ></iframe>
          </div>
        </div>

        <h2 className="upcoming-events-title">Upcoming Events</h2>

        <section className="events-section">
          <div className={`event-cards-container ${expandedEvent ? "has-expanded-event" : ""}`}>
            {loading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading events...</p>
              </div>
            ) : publishedEvents.length === 0 ? (
              <div className="no-events">
                <p>No events available at the moment. Check back soon!</p>
              </div>
            ) : (
              publishedEvents.map((event) => (
                <EventCard key={event.id} event={event} defaultImage={Announcement} />
              ))
            )}
          </div>
        </section>
      </section>

      {/* Event Modal - completely separate from the cards */}
      <EventModal defaultImage={Announcement} />
    </>
  )
}

export default Events

