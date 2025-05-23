"use client"

import { useEffect } from "react"
import "../styles/LandingModal.css"
import EventsSlideshow from "./EventsSlideshow"

function LandingModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="landing-modal-overlay" onClick={onClose}>
      <div
        className="landing-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "#fff" }}
      >
        <button className="landing-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="landing-modal-title">Lastest Events!</h2>
        <EventsSlideshow />
      </div>
    </div>
  )
}

export default LandingModal
