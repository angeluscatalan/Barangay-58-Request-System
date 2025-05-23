"use client"

import { useContext, useEffect, useState } from "react"
import "../styles/Events.css"
import ScrollIcon from "../assets/SDA.png"
import Announcement from "../assets/Announce.png"
import EventCard from "../components/event-card"
import EventModal from "../components/event-modal"
import { EventsProvider, EventsContext } from "../components/events-context"
import Footer from "../components/Footer"

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
  const { publishedEvents, loading, expandedEvent, setExpandedEvent } = useContext(EventsContext)
  const [currentPage, setCurrentPage] = useState(1)
  const EVENTS_PER_PAGE = 9

  useEffect(() => {
    // Check if there's a selected event ID in sessionStorage
    const selectedEventId = sessionStorage.getItem('selectedEventId');
    if (selectedEventId && publishedEvents.length > 0) {
      const selectedEvent = publishedEvents.find(event => event.id === parseInt(selectedEventId));
      if (selectedEvent) {
        setExpandedEvent(selectedEvent);
        // Clear the stored ID after expanding the event
        sessionStorage.removeItem('selectedEventId');
      }
    }
  }, [publishedEvents, setExpandedEvent]);

  const scrollToSection = () => {
    document.getElementById("second-section").scrollIntoView({
      behavior: "smooth",
    })
  }

  // Pagination logic
  const totalPages = Math.ceil(publishedEvents.length / EVENTS_PER_PAGE)
  const paginatedEvents = publishedEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  )

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

        <h2 className="upcoming-events-title">Events</h2>

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
              <>
                <div
                  className="events-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1.5rem",
                  }}
                >
                  {paginatedEvents.map((event) => (
                    <EventCard key={event.id} event={event} defaultImage={Announcement} />
                  ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-controls" style={{ marginTop: "2rem", textAlign: "center" }}>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ marginRight: "1rem" }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={currentPage === idx + 1 ? "active-page" : ""}
                        style={{
                          margin: "0 0.25rem",
                          fontWeight: currentPage === idx + 1 ? "bold" : "normal",
                          background: currentPage === idx + 1 ? "#da1c6f" : "#fff",
                          color: currentPage === idx + 1 ? "#fff" : "#000",
                          border: "1px solid #da1c6f",
                          borderRadius: "4px",
                          padding: "0.3rem 0.8rem",
                          cursor: "pointer"
                        }}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{ marginLeft: "1rem" }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </section>

      {/* Event Modal - completely separate from the cards */}
      <EventModal defaultImage={Announcement} />

      <Footer />
    </>
  )
}

export default Events
