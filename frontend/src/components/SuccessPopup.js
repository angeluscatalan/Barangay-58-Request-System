"use client"
import "../styles/SuccessPopup.css"

const SuccessPopup = ({ isOpen, onClose, message, type = "success" }) => {
  if (!isOpen) return null

  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className={`success-icon ${type}`}>
          {type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )}
        </div>
        <h3 className="success-title">{type === "success" ? "Success!" : "Error"}</h3>
        <p className="success-message">{message}</p>
        <button className="success-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  )
}

export default SuccessPopup
