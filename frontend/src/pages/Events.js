import React from "react";
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
            width="1200"
            height="800"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen="true"
          ></iframe>
        </div>
        </div>
        <section className="events-section">
  <div className="event-cards-container">
    {/* Event Card 1 */}
    <div className="event-card">
      <img src={Announcement} alt="Event 1" className="event-image" />
      <div className="event-info">
        <h3>Barangay 58 Community Day: Unite & Celebrate!</h3>
        <p className="event-date">📅 Fri, Sep 13 2023 &nbsp; 🕘 <span className="event-time">9:00am-12:00am</span></p>
        <p className="event-venue"><strong>Venue:</strong> Barangay 58, Multi-purpose Covered Court</p>
        <p className="event-description">Come together for a day of fun, connection, and community spirit!</p>
      </div>
    </div>

    <div className="event-card">
      <img src={Announcement} alt="Event 2" className="event-image" />
      <div className="event-info">
        <h3>Barangay 58 Clean-Up Drive</h3>
        <p className="event-date">📅 Sat, Sep 20 2023 &nbsp; 🕘 <span className="event-time">8:00am-11:00am</span></p>
        <p className="event-venue"><strong>Venue:</strong> Barangay 58, Main Street</p>
        <p className="event-description">Join us as we make our community cleaner and greener!</p>
      </div>
    </div>

    <div className="event-card">
      <img src={Announcement} alt="Event 3" className="event-image" />
      <div className="event-info">
        <h3>Barangay 58 Christmas Party</h3>
        <p className="event-date">📅 Dec 24 2023 &nbsp; 🕘 <span className="event-time">5:00pm-10:00pm</span></p>
          <p className="event-venue"><strong>Venue:</strong> Barangay 58, Covered Court</p>
          <p className="event-description">Celebrate the holiday season with performances, games, and prizes!</p>
      </div>
    </div>
  </div>
</section>
      </section>
    </>
  );
};

export default Events;