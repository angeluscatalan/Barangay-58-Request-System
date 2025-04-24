"use client"

import { useState} from "react"
import axios from "axios"
import RequestTitlesandSteps from "../components/RequestTitlesandSteps"
import RequestForm from "../components/RequestForm"
import "../styles/reqPage.css"

function reqPage() {
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "",
    sex: "",
    birthday: "",
    contact_no: "",
    email: "",
    address: "",
    type_of_certificate: "",
    purpose_of_request: "",
    number_of_copies: "",
  })

  const [errors, setErrors] = useState({ contact_no: false, email: false })
  const [activeSection, setActiveSection] = useState("info") // "info" or "form"

  const handleChange = (e) => {
    let { name, value } = e.target
    if (["last_name", "first_name", "middle_name"].includes(name)) {
      value = value
        .toLowerCase() // Convert to lowercase first
        .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    }
    setFormData({ ...formData, [name]: value })
  }

  const getReq = () => {
    if (Object.values(formData).some((value) => value.trim() === "")) {
      alert("Please fill in all the required fields in the request form.")
      return
    }

    if (!document.getElementById("terms").checked) {
      alert("Please verify with our terms by clicking the checkbox.")
      return
    }

    const isPhoneValid = /^0\d{10}$/.test(formData.contact_no) || /^[1-9]\d{9}$/.test(formData.contact_no)
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

    if (!isPhoneValid || !isEmailValid) {
      alert("Please provide a valid phone number and email.")
      return
    }

    const requestData = {
      ...formData,
      number_of_copies: Number(formData.number_of_copies),
    }

    axios
      .post("http://localhost:5000/requests", requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      })
      .then((response) => {
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
          email: "",
          address: "",
          type_of_certificate: "",
          purpose_of_request: "",
          number_of_copies: "",
        })
        document.getElementById("terms").checked = false
      })
      .catch((error) => {
        console.error("❌ Error details:", {
          message: error.message,
          code: error.code,
          config: error.config,
        })

        if (error.code === "ECONNREFUSED") {
          alert("Could not connect to server. Please ensure the backend is running.")
        } else if (error.code === "ERR_NETWORK") {
          alert("Network error. Please check your internet connection.")
        } else {
          alert(`Error: ${error.message}`)
        }
      })
  }

  const validatorNum = () => {
    const isValid = /^0\d{10}$/.test(formData.contact_no) || /^[1-9]\d{9}$/.test(formData.contact_no)
    console.log("Phone validation:", isValid)
    setErrors((prev) => ({ ...prev, contact_no: !isValid }))
  }

  const validatorEmail = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    console.log("Email validation:", isValid)
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
    </div>
  )
}

export default reqPage

