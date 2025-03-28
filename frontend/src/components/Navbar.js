"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import brgyLogo from "../assets/brgyMenuLogo.png"
import "../styles/Navbar.css"

function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

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
        <Link to="/Request" className={location.pathname === "/Request" ? "active" : ""}>
          SERVICES
        </Link>
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
            <Link to="/Request" className={location.pathname === "/Request" ? "active" : ""} onClick={closeMenu}>
              SERVICES
            </Link>
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
    </div>
  )
}

export default Navbar

