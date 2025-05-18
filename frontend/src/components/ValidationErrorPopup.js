"use client"
import "../styles/ValidationErrorPopup.css"

const ValidationErrorPopup = ({ isOpen, onClose, missingFields }) => {
  console.log("ValidationErrorPopup props:", { isOpen, missingFields })

  if (!isOpen) return null

  return (
    <div className="validation-popup-overlay">
      <div className="validation-popup">
        <div className="validation-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E53935"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" fill="white" stroke="#E53935"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 className="validation-title">Error</h3>
        <div className="validation-errors">
          <p>Please fill in the following required fields:</p>
          <ul>{missingFields && missingFields.map((field, index) => <li key={index}>{field}</li>)}</ul>
        </div>
        <button className="validation-button" onClick={onClose}>
          Go Back
        </button>
      </div>
    </div>
  )
}

export default ValidationErrorPopup
