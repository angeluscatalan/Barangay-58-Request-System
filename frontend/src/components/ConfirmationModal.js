"use client"
import "../styles/ConfirmationModal.css"

const ConfirmationModal = ({ isOpen, onClose, onConfirm, formData, formType }) => {
  if (!isOpen) return null

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderRequestData = () => (
    <div className="confirmation-data">
      <h3>Personal Information</h3>
      <div className="data-section">
        <div className="data-row">
          <span className="data-label">Name:</span>
          <span className="data-value">
            {formData.first_name} {formData.middle_name} {formData.last_name} {formData.suffix}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Sex:</span>
          <span className="data-value">{formData.sex}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Birthday:</span>
          <span className="data-value">{formatDate(formData.birthday)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Contact Number:</span>
          <span className="data-value">
            {formData.country_code} {formData.contact_no}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Email:</span>
          <span className="data-value">{formData.email}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Address:</span>
          <span className="data-value">
            {formData.unit_no}, {formData.street}, {formData.subdivision}
          </span>
        </div>
      </div>

      <h3>Certificate Details</h3>
      <div className="data-section">
        <div className="data-row">
          <span className="data-label">Type of Certificate:</span>
          <span className="data-value">{formData.type_of_certificate}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Purpose:</span>
          <span className="data-value">{formData.purpose_of_request}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Number of Copies:</span>
          <span className="data-value">{formData.number_of_copies}</span>
        </div>
      </div>
    </div>
  )

  const renderRBIData = () => (
    <div className="confirmation-data">
      <h3>Household Head Information</h3>
      <div className="data-section">
        <div className="data-row">
          <span className="data-label">Name:</span>
          <span className="data-value">
            {formData.head_first_name} {formData.head_middle_name} {formData.head_last_name} {formData.head_suffix}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Address:</span>
          <span className="data-value">
            {formData.house_unit_no}, {formData.street_name}, {formData.subdivision}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Birth Place:</span>
          <span className="data-value">{formData.birth_place}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Birth Date:</span>
          <span className="data-value">{formatDate(formData.birth_date)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Sex:</span>
          <span className="data-value">{formData.sex}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Civil Status:</span>
          <span className="data-value">{formData.civil_status}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Citizenship:</span>
          <span className="data-value">{formData.citizenship}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Occupation:</span>
          <span className="data-value">{formData.occupation}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Email:</span>
          <span className="data-value">{formData.email_address}</span>
        </div>
      </div>

      {formData.members && formData.members.length > 0 && (
        <>
          <h3>Household Members</h3>
          {formData.members.map((member, index) => (
            <div key={index} className="data-section member-section">
              <h4>Member {index + 1}</h4>
              <div className="data-row">
                <span className="data-label">Name:</span>
                <span className="data-value">
                  {member.first_name} {member.middle_name} {member.last_name} {member.suffix}
                </span>
              </div>
              <div className="data-row">
                <span className="data-label">Birth Place:</span>
                <span className="data-value">{member.birth_place}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Birth Date:</span>
                <span className="data-value">{formatDate(member.birth_date)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Sex:</span>
                <span className="data-value">{member.sex}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Civil Status:</span>
                <span className="data-value">{member.civil_status}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Citizenship:</span>
                <span className="data-value">{member.citizenship}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Occupation:</span>
                <span className="data-value">{member.occupation}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h2>Please Review Your Information</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className="review-message">
            Please review the information below to ensure everything is correct before final submission.
          </p>
          {formType === "request" ? renderRequestData() : renderRBIData()}
        </div>
        <div className="modal-footer">
          <button className="back-button" onClick={onClose}>
            Go Back & Edit
          </button>
          <button className="submit-button" onClick={onConfirm}>
            Submit Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
