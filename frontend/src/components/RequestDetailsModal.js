import React from "react";

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  // Helper for suffix display
  const getSuffixDisplay = (suffixId) => {
    switch (String(suffixId)) {
      case "2": return "Jr.";
      case "3": return "Sr.";
      case "4": return "I";
      case "5": return "II";
      case "6": return "III";
      case "7": return "IV";
      case "8": return "V";
      default: return "";
    }
  };

  // Helper for sex display
  const getSexDisplay = (sex, sexOther) => {
    switch (String(sex)) {
      case "1": return "Male";
      case "2": return "Female";
      case "3": return "Prefer Not To Say";
      case "4": return sexOther ? sexOther : "Other";
      default: return "";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600, minWidth: 350 }}>
        <div className="modal-header">
          <h2>Request Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <span>
                {request.last_name}, {request.first_name} {request.middle_name || ""} {getSuffixDisplay(request.suffix_id)}
              </span>
            </div>
            <div className="info-item">
              <label>Sex</label>
              <span>{getSexDisplay(request.sex, request.sex_other)}</span>
            </div>
            <div className="info-item">
              <label>Birthday</label>
              <span>{request.birthday ? request.birthday.split("T")[0] : ""}</span>
            </div>
            <div className="info-item">
              <label>Contact No.</label>
              <span>{request.contact_no}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{request.email}</span>
            </div>
            <div className="info-item">
              <label>Address</label>
              <span>{request.address}</span>
            </div>
            <div className="info-item">
              <label>Type of Certificate</label>
              <span>{request.certificate_name}</span>
            </div>
            <div className="info-item">
              <label>Purpose</label>
              <span>{request.purpose_of_request}</span>
            </div>
            <div className="info-item">
              <label>Number of Copies</label>
              <span>{request.number_of_copies}</span>
            </div>
            <div className="info-item">
              <label>Status</label>
              <span>{request.status || ""}</span>
            </div>
            <div className="info-item">
              <label>Control Number</label>
              <span>{request.control_id || "Pending"}</span>
            </div>
            {request.photo_url && (
              <div className="info-item">
                <label>Photo</label>
                <img src={request.photo_url} alt="Request Photo" style={{ maxWidth: 120, borderRadius: 6 }} />
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
