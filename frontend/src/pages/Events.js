import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Events.css";
import ScrollIcon from '../assets/SDA.png';
import Announcement from '../assets/Announce.png';


const scrollToSection = () => {
  document.getElementById("second-section").scrollIntoView({ 
    behavior: "smooth" 
  });
};


const Events = () => {
  const [publishedEvents, setPublishedEvents] = useState(() => {
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents).filter(event => event.isPublished) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedEvents = localStorage.getItem('events');
      if (savedEvents) {
        setPublishedEvents(JSON.parse(savedEvents).filter(event => event.isPublished));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <section className="events-header-section">
        <div className="events-header">
          <h1>Stay Tuned, Stay Involved,<br /> Stay Connected!</h1>
          <p>Join us as we bring the community together through exciting events and meaningful<br /> gatherings.</p>
        </div>
        <div className="scroll-container">
        <p className="scroll-down" onClick={scrollToSection}>SCROLL DOWN</p>
         <img 
         src={ScrollIcon} 
         alt="Scroll Down" 
         className="scroll-down-icon"
         onClick={scrollToSection} 
         />
        </div>
      </section>

      {/* 🌟 Second Section: Events Display */}
      <section id ="second-section" className="events-content-section">
      <div className="embed-container">
        <h2>Barangay 58 Events</h2>
        <div className="events-content">
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61552676805291&tabs=timeline&width=500&height=350&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false&appId"
            width="400"
            height="350"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen="true"
          ></iframe>
        </div>
        </div>
        <section className="events-section">
  <div className="event-cards-container">
    {publishedEvents.map((event) => (
      <div key={event.id} className="event-card">
        <img 
          src={event.imageUrl || Announcement} 
          alt={event.name} 
          className="event-image" 
        />
        <div className="event-info">
          <h3>{event.name}</h3>
          <p className="event-date">📅 {event.date} &nbsp; 🕘 <span className="event-time">{event.timeStart} - {event.timeEnd}</span></p>
          <p className="event-venue"><strong>Venue:</strong> {event.venue}</p>
          <p className="event-description">{event.description}</p>
        </div>
      </div>
    ))}
  </div>
</section>
      </section>
    </>
  );
};

export default Events;