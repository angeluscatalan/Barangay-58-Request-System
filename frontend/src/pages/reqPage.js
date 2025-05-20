"use client"

import { useState } from "react"
import axios from "axios"
import RequestTitlesandSteps from "../components/RequestTitlesandSteps"
import RequestForm from "../components/RequestForm"
import ConfirmationModal from "../components/ConfirmationModal"
import "../styles/reqPage.css"
import Footer from "../components/Footer"
import ValidationErrorPopup from "../components/ValidationErrorPopup"
import SuccessPopup from "../components/SuccessPopup"

function reqPage() {
  // Form state
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "",
    sex: "",
    birthday: "",
    contact_no: "",
    country_code: "+63",
    email: "",
    unit_no: "",
    street: "",
    subdivision: "",
    type_of_certificate: "",
    purpose_of_request: "",
    number_of_copies: "",
  })

  // UI state
  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState("info") // "info" or "form"
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showValidationError, setShowValidationError] = useState(false)
  const [missingFields, setMissingFields] = useState([])
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  

  // Handle form field changes
  const handleChange = (e) => {
    let { name, value } = e.target

    // Auto-capitalize names
    if (["last_name", "first_name", "middle_name","unit_no","street","subdivision"].includes(name)) {
      value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }

    setFormData({ ...formData, [name]: value })

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  // Validate the entire form
  const validateForm = () => {
    const newErrors = {}
    let formValid = true
    const missingFieldsList = []

    // Define required fields with display names
    const requiredFields = [
      { key: "last_name", display: "Last Name" },
      { key: "first_name", display: "First Name" },
      { key: "middle_name", display: "Middle Name" },
      { key: "unit_no", display: "House/Unit No." },
      { key: "street", display: "Street Name" },
      { key: "subdivision", display: "Subdivision/Sitio/Purok" },
      { key: "contact_no", display: "Contact Number" },
      { key: "email", display: "Email Address" },
      { key: "number_of_copies", display: "Number of Copies" },
      { key: "type_of_certificate", display: "Type of Certificate" },
    ]

    // Check for empty required fields
    requiredFields.forEach((field) => {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        newErrors[field.key] = true
        formValid = false
        missingFieldsList.push(field.display)
      }
    })

    // Validate phone number format
    if (formData.contact_no && !/^(0\d{10}|[1-9]\d{9})$/.test(formData.contact_no)) {
      newErrors.contact_no = true
      formValid = false
      if (!missingFieldsList.includes("Contact Number")) {
        missingFieldsList.push("Contact Number (Invalid format)")
      }
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true
      formValid = false
      if (!missingFieldsList.includes("Email Address")) {
        missingFieldsList.push("Email Address (Invalid format)")
      }
    }

    // Validate number of copies
    const numberOfCopies = formData.number_of_copies
    if (numberOfCopies && (isNaN(numberOfCopies) || numberOfCopies <= 0)) {
      newErrors.number_of_copies = true
      formValid = false
      if (!missingFieldsList.includes("Number of Copies")) {
        missingFieldsList.push("Number of Copies (Must be greater than 0)")
      }
    }

    // Update state with errors
    setErrors(newErrors)
    setMissingFields(missingFieldsList)

    return formValid
  }

  // Handle form submission
  const getReq = () => {
    // Validate form
    const isValid = validateForm()

    if (!isValid) {
      // Show validation error popup instead of alert
      setShowValidationError(true)
      return
    }

    // Check terms checkbox
    const termsCheckbox = document.getElementById("terms")
    if (!termsCheckbox || !termsCheckbox.checked) {
      setMissingFields(["Agreement to terms and conditions"])
      setShowValidationError(true)
      return
    }

    // If all validations pass, show confirmation modal
    setShowConfirmation(true)
  }

  // Handle final submission after confirmation
  const handleConfirmSubmit = async (imagePreviewFromModal) => {
  try {
    let imageUrl = null;
    
    if ((formData.type_of_certificate === "IDApp" || 
         formData.type_of_certificate === "ClearanceCert") && 
        imagePreviewFromModal){

        // Convert data URL to blob
        const blob = await fetch(imagePreviewFromModal).then(res => res.blob());
        const imageFormData = new FormData();
        imageFormData.append('image', blob, 'request_photo.jpg');

        // Upload image
        const imageResponse = await axios.post(
          'http://localhost:5000/api/images/upload',
          imageFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        imageUrl = imageResponse.data.imageUrl;
      }

      const addressParts = [
        formData.unit_no,
        formData.street,
        formData.subdivision
      ].filter(part => part && part.trim() !== ""); // Remove empty parts

      const requestData = {
        ...formData,
        photo_url: imageUrl,
        address: addressParts.join(", "), // Join with commas
        number_of_copies: Number(formData.number_of_copies)
      };

      // Submit request
      const response = await axios.post(
        'http://localhost:5000/api/requests',
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );

      // Handle success
      setShowConfirmation(false);
      setShowSuccessPopup(true);

      // Reset form
      setFormData({
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix: "",
        sex: "",
        birthday: "",
        contact_no: "",
        country_code: "+63",
        email: "",
        unit_no: "",
        street: "",
        subdivision: "",
        type_of_certificate: "",
        purpose_of_request: "",
        number_of_copies: "",
      });

      // Reset terms checkbox
      const termsCheckbox = document.getElementById("terms");
      if (termsCheckbox) termsCheckbox.checked = false;

      setErrors({});

    } catch (error) {
      setShowConfirmation(false);
      console.error("Submission error:", error);

      let errorMessage = "An error occurred while submitting your request.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  // Field-specific validators
  const validatorNum = () => {
    const isValid = /^(0\d{10}|[1-9]\d{9})$/.test(formData.contact_no)
    setErrors((prev) => ({ ...prev, contact_no: !isValid }))
  }

  const validatorEmail = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    setErrors((prev) => ({ ...prev, email: !isValid }))
  }

  // For mobile view navigation
  const toggleSection = (section) => {
    setActiveSection(section)
  }

  return (
    <div className="req">
      {/* Mobile navigation tabs */}
      <div className="mobile-tabs">
        <button
          className={`tab-button ${activeSection === "info" ? "active" : ""}`}
          onClick={() => toggleSection("info")}
        >
          Information
        </button>
        <button
          className={`tab-button ${activeSection === "form" ? "active" : ""}`}
          onClick={() => toggleSection("form")}
        >
          Request Form
        </button>
      </div>

      <div className="req-container">
        {/* Information section */}
        <div className={`req-info ${activeSection === "info" ? "active" : ""}`}>
          <RequestTitlesandSteps />
          <button className="mobile-next-button" onClick={() => toggleSection("form")}>
            Continue to Form
          </button>
        </div>

        {/* Form section */}
        <div className={`req-form ${activeSection === "form" ? "active" : ""}`}>
          <RequestForm
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            getReq={getReq}
            validatorNum={validatorNum}
            validatorEmail={validatorEmail}
            setFormData={setFormData}
            toggleSection={toggleSection}
          />
        </div>
      </div>

      {/* Confirmation Modal - only shown when all validations pass */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        formType="request"
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
      />

      {/* Validation Error Popup */}
      <ValidationErrorPopup
        isOpen={showValidationError}
        onClose={() => setShowValidationError(false)}
        missingFields={missingFields}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Your certificate request has been successfully submitted! You will be notified when it's ready for pickup."
      />

      <Footer />
    </div>
  )
}

export default reqPage