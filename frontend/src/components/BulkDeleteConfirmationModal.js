import React from "react";

function BulkDeleteConfirmationModal({ isOpen, onClose, onConfirm, count }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Bulk Delete</h2>
        <p>Are you sure you want to delete {count} selected request{count > 1 ? 's' : ''}? This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Delete</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default BulkDeleteConfirmationModal;
