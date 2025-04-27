"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown } from "lucide-react"
import brgyLogo from "../assets/brgyMenuLogo.png"
import "../styles/Navbar.css"

function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showServicesDropdown, setShowServicesDropdown] = useState(false)
  const servicesDropdownRef = useRef(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleServicesDropdown = (e) => {
    e.preventDefault()
    setShowServicesDropdown(!showServicesDropdown)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close dropdown when clicking outside
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setShowServicesDropdown(false)
      }

      // Close mobile menu when clicking outside (but not when clicking the menu toggle)
      const menuToggle = document.querySelector(".mobile-menu-toggle")
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-nav") &&
        event.target !== menuToggle &&
        !menuToggle?.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <div className="indexHeader">
      <div className="indexLogoContainer">
        <img src={brgyLogo || "/placeholder.svg"} alt="Barangay Logo" className="indexLogo" />
        <h1 className="indexTitle">BARANGAY 58</h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="indexNav desktop-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          HOME
        </Link>
        <Link to="/Team" className={location.pathname === "/Team" ? "active" : ""}>
          TEAM
        </Link>
        <div className="services-dropdown" ref={servicesDropdownRef}>
          <a
            href="#"
            onClick={toggleServicesDropdown}
            className={location.pathname === "/Request" || location.pathname === "/RBI" ? "active" : ""}
          >
            SERVICES <ChevronDown size={16} />
          </a>
          {showServicesDropdown && (
            <div className="dropdown-menu">
              <Link to="/Request" onClick={() => setShowServicesDropdown(false)}>
                Certificate Request
              </Link>
              <Link to="/RBI" onClick={() => setShowServicesDropdown(false)}>
                RBI Registration
              </Link>
            </div>
          )}
        </div>
        <Link to="/Events" className={location.pathname === "/Events" ? "active" : ""}>
          EVENTS
        </Link>
        <Link to="/AboutUs" className={location.pathname === "/AboutUs" ? "active" : ""}>
          ABOUT US
        </Link>
      </nav>

      {/* Login Button (Desktop) */}
      {location.pathname !== "/login" && (
        <Link to="/login" className="loginBtn desktop-login">
          Login
        </Link>
      )}

      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-content">
          <nav className="mobile-nav-links">
            <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={closeMenu}>
              HOME
            </Link>
            <Link to="/Team" className={location.pathname === "/Team" ? "active" : ""} onClick={closeMenu}>
              TEAM
            </Link>
            <div className="mobile-dropdown">
              <div
                className={`mobile-dropdown-header ${
                  location.pathname === "/Request" || location.pathname === "/RBI" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation() // Prevent event bubbling
                  setShowServicesDropdown(!showServicesDropdown)
                }}
              >
                SERVICES <ChevronDown size={16} className={showServicesDropdown ? "rotate" : ""} />
              </div>
              {showServicesDropdown && (
                <div className="mobile-dropdown-content">
                  <Link
                    to="/Request"
                    onClick={() => {
                      closeMenu()
                      setShowServicesDropdown(false)
                    }}
                  >
                    Certificate Request
                  </Link>
                  <Link
                    to="/RBI"
                    onClick={() => {
                      closeMenu()
                      setShowServicesDropdown(false)
                    }}
                  >
                    RBI Registration
                  </Link>
                </div>
              )}
            </div>
            <Link to="/Events" className={location.pathname === "/Events" ? "active" : ""} onClick={closeMenu}>
              EVENTS
            </Link>
            <Link to="/AboutUs" className={location.pathname === "/AboutUs" ? "active" : ""} onClick={closeMenu}>
              ABOUT US
            </Link>
          </nav>

          {/* Login Button (Mobile) */}
          {location.pathname !== "/login" && (
            <Link to="/login" className="loginBtn mobile-login" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      </div>
      {isMenuOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}
    </div>
  )
}

export default Navbar
