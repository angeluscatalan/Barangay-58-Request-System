"use client"
import React from "react"
import "../styles/DeleteConfirmationModal.css"

const DeleteConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  hideCancel = false,
  confirmText = "Delete" 
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={onConfirm}>
            {confirmText}
          </button>
          {!hideCancel && (
            <button className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
