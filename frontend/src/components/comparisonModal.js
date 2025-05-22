"use client"
import { useState } from "react"
import { getSexDisplay } from "../utils/displayUtils"
import "../styles/ConfirmationModal.css"

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  formType,
  imagePreview,
  setImagePreview,
  certificates,
  request, // for comparison modal
  rbis     // for comparison modal
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false)

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

  const requiresPhotoUpload = () => {
    return formData.certificate_id === 1 || // ID Application
           formData.certificate_id === 4;   // Clearance (adjust IDs as needed)
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (requiresPhotoUpload() && !showImageUpload) {
      setShowImageUpload(true);
    } else {
      onConfirm(imagePreview);
    }
  };

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

  const renderRequestData = () => (
    <div className="confirmation-data">
      <h3>Personal Information</h3>
      <div className="data-section">
        <div className="data-row">
          <span className="data-label">Name:</span>
          <span className="data-value">
            {formData.first_name} {formData.middle_name} {formData.last_name} {getSuffixDisplay(formData.suffix)}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Sex/Gender:</span>
          <span className="data-value">
            {getSexDisplay(formData.sex, formData.sex_other)}
          </span>
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
          <span className="data-value">
            {certificates.find(c => c.id == formData.certificate_id)?.name || 'None'}
          </span>
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

  const renderImageUpload = () => (
    <div className="image-upload-section">
      <h3>Photo Requirement</h3>
      <div className="upload-instructions">
        <p>Please upload a clear photo of yourself with a <strong>white background</strong> in either:</p>
        <ul>
          <li>1x1 inch size (for ID applications)</li>
          <li>2x2 inch size (for clearance applications)</li>
        </ul>
      </div>

      <div className="upload-area">
        <label htmlFor="photo-upload" className="upload-label">
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <span className="change-photo-text">Change Photo</span>
            </div>
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">+</span>
              <span className="upload-text">Click to upload photo</span>
            </div>
          )}
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden-input"
          />
        </label>
      </div>

      {!imagePreview && (
        <p className="upload-warning">Photo upload is required to proceed</p>
      )}
    </div>
  )

  const renderRBIData = () => (
    <div className="confirmation-data">
      <h3>Household Head Information</h3>
      <div className="data-section">
        <div className="data-row">
          <span className="data-label">Name:</span>
          <span className="data-value">
            {safeFormData.head_first_name || ""} {safeFormData.head_middle_name || ""} {safeFormData.head_last_name || ""} {getSuffixDisplay(safeFormData.head_suffix)}
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
          <span className="data-label">Sex/Gender:</span>
          <span className="data-value">
            {getSexDisplay(formData.sex, formData.sex_other)}
          </span>
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
                  {member.first_name} {member.middle_name} {member.last_name} {getSuffixDisplay(member.suffix)}
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
                <span className="data-label">Sex/Gender:</span>
                <span className="data-value">
                  {getSexDisplay(member.sex, member.sex_other)}
                </span>
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

  // Comparison modal: show request and similar RBIs if rbis prop is present
  const renderComparison = () => (
    <div className="confirmation-data">
      <h3>Selected Request</h3>
      <div className="data-section">
        <div className="data-row">
          <span className="data-label">Name:</span>
          <span className="data-value">
            {request?.last_name}, {request?.first_name} {request?.middle_name} {getSuffixDisplay(request?.suffix_id || request?.suffix)}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Birthday:</span>
          <span className="data-value">{formatDate(request?.birthday)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Address:</span>
          <span className="data-value">{request?.address}</span>
        </div>
        {/* ...add more fields as needed... */}
      </div>
      <h3>Similar RBI Records</h3>
      {safeRbis.length === 0 ? (
        <div>No similar RBI records found.</div>
      ) :
        (
          safeRbis.map((rbi, idx) => (
            <div key={rbi.id || idx} className="data-section member-section">
              <div className="data-row">
                <span className="data-label">Type:</span>
                <span className="data-value">{rbi.type}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Name:</span>
                <span className="data-value">
                  {rbi.last_name}, {rbi.first_name} {rbi.middle_name} {getSuffixDisplay(rbi.suffix_id || rbi.head_suffix_id)}
                </span>
              </div>
              <div className="data-row">
                <span className="data-label">Birthday:</span>
                <span className="data-value">{formatDate(rbi.birth_date)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Address:</span>
                <span className="data-value">
                  {rbi.house_unit_no} {rbi.street_name}, {rbi.subdivision}
                </span>
              </div>
              <div className="data-row">
                <span className="data-label">Sex:</span>
                <span className="data-value">{getSexDisplay(rbi.sex, rbi.sex_other)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Status:</span>
                <span className="data-value">{rbi.status}</span>
              </div>
            </div>
          ))
        )
      }
    </div>
  )

  // Defensive: use request or formData for display, fallback to empty object
  const safeFormData = formData || request || {};
  const safeRbis = rbis || [];

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h2>
            {rbis ? "Compare with RBI Records" : showImageUpload ? "Upload Required Photo" : "Please Review Your Information"}
          </h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {rbis
            ? renderComparison()
            : showImageUpload
              ? renderImageUpload()
              : (
                <>
                  <p className="review-message">
                    Please review the information below to ensure everything is correct before final submission.
                  </p>
                  {formType === "request" ? renderRequestData() : renderRBIData()}
                </>
              )
          }
        </div>

        {!rbis && (
          <div className="modal-footer">
            <button
              className="back-button"
              onClick={() => showImageUpload ? setShowImageUpload(false) : onClose()}
            >
              {showImageUpload ? "Back to Review" : "Go Back & Edit"}
            </button>
            <button
              className="submit-button"
              onClick={handleContinue}
              disabled={showImageUpload && !imagePreview}
            >
              {showImageUpload ? "Submit Application" : "Continue"}
            </button>
          </div>
        )}
        {rbis && (
          <div className="modal-footer">
            <button className="submit-button" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmationModal