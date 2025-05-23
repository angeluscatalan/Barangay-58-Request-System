"use client"

import React, { useContext, useEffect, useState, lazy, Suspense } from "react"
import "../styles/Events.css"
import ScrollIcon from "../assets/SDA.png"
import Announcement from "../assets/Announce.png"
import EventCard from "../components/event-card"
import { EventsProvider, EventsContext } from "../components/events-context"
// Use React.lazy for non-critical components
const EventModal = lazy(() => import("../components/event-modal"))
const Footer = lazy(() => import("../components/Footer"))

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

  // Lazy load Facebook iframe on scroll
  const [loadIframe, setLoadIframe] = useState(false)
  
  // Add Facebook SDK initialization
  useEffect(() => {
    // Add Facebook SDK
    const loadFacebookSDK = () => {
      // Remove the FB check since we want to reinitialize
      window.fbAsyncInit = function() {
        FB.init({
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 300 && !loadIframe) {
        setLoadIframe(true);
        // Parse XFBML after setting loadIframe
        setTimeout(() => {
          if (window.FB) {
            window.FB.XFBML.parse();
          }
        }, 1000);
      }
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [loadIframe])

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
          {/* Use regular img since next/image is not available */}
          <span onClick={scrollToSection} style={{ cursor: "pointer" }}>
            <img
              src={ScrollIcon || "/placeholder.svg"}
              alt="Scroll Down"
              width={32}
              height={32}
              className="scroll-down-icon"
              loading="lazy"
            />
          </span>
        </div>
      </section>

      <section id="second-section" className="events-content-section">
        <div className="embed-container">
          <h2>Barangay 58 Facebook Updates</h2>
          <div className="events-content">
            {loadIframe ? (
              <div className="fb-page-container">
                <div 
                  className="fb-page" 
                  data-href="https://www.facebook.com/profile.php?id=61552676805291"
                  data-tabs="timeline"
                  data-width="500"
                  data-height="500"
                  data-small-header="true"
                  data-adapt-container-width="true"
                  data-hide-cover="false"
                  data-show-facepile="false">
                  <blockquote cite="https://www.facebook.com/profile.php?id=61552676805291" className="fb-xfbml-parse-ignore">
                    <a href="https://www.facebook.com/profile.php?id=61552676805291">Barangay 58</a>
                  </blockquote>
                </div>
              </div>
            ) : (
              <div style={{ minHeight: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#888" }}>Scroll down to load Facebook updates...</span>
              </div>
            )}
          </div>
        </div>

        <h2 className="upcoming-events-title">Events</h2>
        <section className="public-events-section">
          <div className={`public-events-container ${expandedEvent ? "has-expanded-event" : ""}`}>
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
                <div className="public-events-grid">
                  {paginatedEvents.map((event) => (
                    <EventCard key={event.id} event={event} defaultImage={Announcement} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="public-pagination-controls">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="public-pagination-button"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`public-pagination-number ${currentPage === idx + 1 ? "active" : ""}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="public-pagination-button"
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
      {/* Lazy loaded Event Modal and Footer using Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        <EventModal defaultImage={Announcement} />
        <Footer />
      </Suspense>
    </>
  )
}

export default Events
