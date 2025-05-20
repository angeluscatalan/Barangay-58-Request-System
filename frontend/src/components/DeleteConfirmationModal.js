"use client"
import "../styles/DeleteConfirmationModal.css"

const DeleteConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="delete-modal-overlay">
      <div className="delete-confirmation-modal">
        <div className="delete-modal-header">
          <h2>{title || "Confirm Delete"}</h2>
          <button className="close-button" onClick={onCancel}>
            &times;
          </button>
        </div>

        <div className="delete-modal-body">
          <p>{message || "Are you sure you want to delete this item?"}</p>
        </div>

        <div className="delete-modal-footer">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
