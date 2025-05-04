"use client"

import { Link } from "react-router-dom"
import brgyLogo from "../assets/brgylogo.png"
import Kap_NoBg from "../assets/Kap_NoBg.png"
import "../styles/Home.css"

function Home() {
  // Sample project data - replace with actual data from your backend
  const projects = [
    {
      id: 1,
      name: "Community Garden Renovation",
      image: "/placeholder.svg?height=200&width=300",
      date: "March 15, 2023",
      description: "Renovation of the community garden with new plants, benches, and pathways for residents to enjoy.",
    },
    {
      id: 2,
      name: "Street Lighting Project",
      image: "/placeholder.svg?height=200&width=300",
      date: "June 5, 2023",
      description:
        "Installation of energy-efficient LED street lights to improve safety and visibility in the barangay.",
    },
    {
      id: 3,
      name: "Drainage System Improvement",
      image: "/placeholder.svg?height=200&width=300",
      date: "September 20, 2023",
      description: "Upgrading the drainage system to prevent flooding during heavy rainfall and improve sanitation.",
    },
  ]

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-text">
          <h1 className="home-title">Fast & Easy Barangay Services!</h1>
          <p className="home-subtitle">Request certificates online. Stay updated. Save time!</p>
          <p className="home-description">
            No more long lines and unnecessary trips to the barangay hall! Our online system allows you to request
            barangay certificates with ease and stay informed about important announcements and events. Simply submit
            your request online, get notified when it's ready, and pick it up hassle-free. Join us in modernizing our
            barangay services—start your request today!
          </p>

          <div className="home-buttons">
            <Link to="/Request" className="request-button">
              Request a Certificate
            </Link>
            <Link to="/RBI" className="request-button rbi-button">
              Register RBI
            </Link>
          </div>
        </div>

        <div className="logo-container">
          <img src={brgyLogo || "/placeholder.svg"} alt="Barangay 58 Logo" className="home-logo" />
        </div>
        <div className="scroll-container">
          <p
            className="scroll-down"
            onClick={() => {
              const servicesSection = document.querySelector(".services-section")
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            SCROLL DOWN
          </p>
          <i
            className="fas fa-chevron-down scroll-down-icon"
            onClick={() => {
              const servicesSection = document.querySelector(".services-section")
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: "smooth" })
              }
            }}
          ></i>
        </div>
      </div>

      <div className="welcome-message-container">
        <div className="welcome-message">
          <div className="welcome-text">
            <h2 className="welcome-heading">Mabuhay!</h2>
            <p>
              It is with great pride that I welcome you to the online home of Barangay 58. This website was created to
              serve you better—making services more accessible and announcements easier to find.
            </p>
            <p>Thank you for being an active part of our growing digital community!</p>
            <div className="captain-info">
              <p>— Hon. Andrea Amor "AA" D. Mercado</p>
              <p className="captain-title">Barangay Captain</p>
            </div>
          </div>
          <div className="captain-image-container">
            <div className="logo-background">
              <img src={brgyLogo || "/placeholder.svg"} alt="Barangay Logo Background" className="background-logo" />
            </div>
            <div className="captain-image">
              <img src={Kap_NoBg || "/placeholder.svg"} alt="Barangay Captain" />
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards Section */}
      <div className="services-section">
        <h2 className="section-title">Our Online Services</h2>
        <div className="service-cards">
          <Link to="/RBI" className="service-card">
            <div className="service-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <h3>RBI Registration</h3>
            <p>Register your household information online with our easy-to-use form.</p>
            <span className="service-link">Register Now</span>
          </Link>

          <Link to="/Request" className="service-card">
            <div className="service-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>Certificate Request</h3>
            <p>Request barangay certificates and documents without visiting the office.</p>
            <span className="service-link">Request Now</span>
          </Link>

          <Link to="/Events" className="service-card">
            <div className="service-icon">
              <i className="fas fa-bullhorn"></i>
            </div>
            <h3>Announcements</h3>
            <p>Stay updated with the latest news, events, and announcements from Barangay 58.</p>
            <span className="service-link">View Updates</span>
          </Link>
        </div>
      </div>

      {/* Barangay Projects Section */}
      <div className="projects-section">
        <h2 className="section-title">Barangay Projects</h2>
        <div className="project-cards">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-image">
                <img src={project.image || "/placeholder.svg"} alt={project.name} />
              </div>
              <div className="project-details">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-date">Established: {project.date}</p>
                <p className="project-description">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
