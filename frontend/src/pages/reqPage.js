"use client"

import { useState } from "react"
import axios from "axios"
import RequestTitlesandSteps from "../components/RequestTitlesandSteps"
import RequestForm from "../components/RequestForm"
import ConfirmationModal from "../components/ConfirmationModal"
import "../styles/reqPage.css"
import Footer from "../components/Footer"

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

  // Handle form field changes
  const handleChange = (e) => {
    let { name, value } = e.target

    // Auto-capitalize names
    if (["last_name", "first_name", "middle_name"].includes(name)) {
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

    // Define required fields
    const requiredFields = [
      "last_name",
      "first_name",
      "middle_name",
      "unit_no",
      "street",
      "subdivision",
      "contact_no",
      "email",
      "number_of_copies",
      "type_of_certificate",
    ]

    // Check for empty required fields
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = true
        formValid = false
      }
    })

    // Validate phone number format
    if (formData.contact_no && !/^(0\d{10}|[1-9]\d{9})$/.test(formData.contact_no)) {
      newErrors.contact_no = true
      formValid = false
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true
      formValid = false
    }

    // Validate number of copies
    const numberOfCopies = formData.number_of_copies
    if (numberOfCopies && (isNaN(numberOfCopies) || numberOfCopies <= 0)) {
      newErrors.number_of_copies = true
      formValid = false
    }

    // Update state with errors
    setErrors(newErrors)

    return formValid
  }

  // Handle form submission
  const getReq = () => {
    // Validate form
    const isValid = validateForm()

    if (!isValid) {
      // Highlight errors in the form
      alert("Please fill in all required fields correctly.")
      return
    }

    // Check terms checkbox
    const termsCheckbox = document.getElementById("terms")
    if (!termsCheckbox || !termsCheckbox.checked) {
      alert("Please agree to the terms and conditions.")
      return
    }

    // If all validations pass, show confirmation modal
    setShowConfirmation(true)
  }

  // Handle final submission after confirmation
  const handleConfirmSubmit = () => {
    const fullAddress = `${formData.unit_no}, ${formData.street}, ${formData.subdivision}`

    const requestData = {
      ...formData,
      address: fullAddress,
      number_of_copies: Number(formData.number_of_copies),
    }

    console.log("Sending request data:", requestData)

    axios
      .post("http://localhost:5000/api/requests", requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      })
      .then((response) => {
        setShowConfirmation(false)
        alert("✅ Request successfully submitted!")

        // Reset form after successful submission
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
        })

        // Reset checkbox and errors
        if (document.getElementById("terms")) {
          document.getElementById("terms").checked = false
        }
        setErrors({})
      })
      .catch((error) => {
        setShowConfirmation(false)
        console.error("❌ Error details:", {
          message: error.message,
          code: error.code,
          config: error.config,
        })

        let errorMessage = "An error occurred while submitting your request."

        if (error.code === "ECONNREFUSED") {
          errorMessage = "Could not connect to server. Please ensure the backend is running."
        } else if (error.code === "ERR_NETWORK") {
          errorMessage = "Network error. Please check your internet connection."
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`
        }

        alert(`❌ ${errorMessage}`)
      })
  }

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
      />

      <Footer />
    </div>
  )
}

export default reqPage
