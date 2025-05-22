import React from "react"

const LogoutConfirmationModal = ({ isOpen, onConfirm, onCancel, onClose }) => {
  if (!isOpen) return null

  // Use onCancel or onClose for the cancel button
  const handleCancel = onCancel || onClose;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmationModal