"use client"

import { useEffect } from "react"
import "../styles/LandingModal.css"

function LandingModal({ isOpen, onClose, imageSrc }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  if (!isOpen) return null

  // Apply the background color directly in the inline style as well
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "#da1c6f" }} // Inline style to ensure the color is applied
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img src={imageSrc || "/placeholder.svg"} alt="Landing" className="modal-image" />
      </div>
    </div>
  )
}

export default LandingModal
