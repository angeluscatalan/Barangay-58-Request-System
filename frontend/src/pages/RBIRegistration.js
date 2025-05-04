"use client"

import { useState, useRef } from "react"
import BirthdatePicker from "../components/BirthdatePicker"
import "../styles/RBIRegistration.css"
import step1 from "../assets/step1.png"
import step2 from "../assets/step2.png"
import step3 from "../assets/step3.png"
import numberIcon from "../assets/numberIcon.png"
import facebookIcon from "../assets/facebookIcon.png"
import emailIcon from "../assets/emailIcon.png"
import axios from "axios"
import Footer from "../components/Footer"

function RBIRegistration() {
  const [activeSection, setActiveSection] = useState("info")
  const birthdateRef = useRef(null)
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "",
    house_unit_no: "",
    street_name: "",
    subdivision: "",
    birth_place: "",
    birth_date: "",
    sex: "",
    civil_status: "",
    citizenship: "",
    occupation: "",
    email_address: "",
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    let { name, value } = e.target
    if (["last_name", "first_name", "middle_name", "birth_place"].includes(name)) {
      value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      if (formData[key].trim() === "" && key !== "suffix") {
        newErrors[key] = "This field is required"
      }
    })

    // Add email validation
    if (formData.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = "Please enter a valid email address"
    }

    if (!document.getElementById("terms").checked) {
      alert("Please verify with our terms by clicking the checkbox.")
      return
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      alert("Please fill in all required fields.")
      return
    }

    try {
      const formattedData = {
        ...formData,
        birth_date: new Date(formData.birth_date).toISOString().split("T")[0], // 'YYYY-MM-DD'
      }

      const response = await axios.post("http://localhost:5000/rbi", formattedData)

      if (response.status === 200 || response.status === 201) {
        alert("✅ RBI Registration successfully submitted!")

        // Reset form
        setFormData({
          last_name: "",
          first_name: "",
          middle_name: "",
          suffix: "",
          house_unit_no: "",
          street_name: "",
          subdivision: "",
          birth_place: "",
          birth_date: "",
          sex: "",
          civil_status: "",
          citizenship: "",
          occupation: "",
          email_address: "",
        })
        document.getElementById("terms").checked = false
      } else {
        alert("Submission failed. Please try again later.")
      }
    } catch (error) {
      console.error("Error submitting RBI registration:", error)
      alert(`Error: ${error.response?.data?.message || error.message || "Failed to submit registration"}`)
    }
  }

  // For mobile view navigation
  const toggleSection = (section) => {
    setActiveSection(section)
  }

  return (
    <div className="rbi-container">
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
          Registration Form
        </button>
      </div>

      <div className="rbi-content">
        {/* Information section */}
        <div className={`rbi-info ${activeSection === "info" ? "active" : ""}`}>
          <div className="rbi-text">
            <h1 className="rbi-title">RBI Registration</h1>
            <h2 className="rbi-subtext">
              Register your household information online—no need for multiple visits to the barangay hall!
            </h2>
            <div className="rbi-steps-container">
              <div className="rbi-steps">
                <div className="rbi-step">
                  <img src={step1 || "/placeholder.svg"} alt="step1" className="step-icon" />
                  <p className="steps-info">
                    <strong>Fill Out the Form</strong> – Complete the required personal and household details
                    accurately.
                  </p>
                </div>

                <div className="rbi-step">
                  <img src={step2 || "/placeholder.svg"} alt="step2" className="step-icon" />
                  <p className="steps-info">
                    <strong>Submit Your Registration</strong> – Click "Submit" and wait for confirmation from the
                    barangay office.
                  </p>
                </div>

                <div className="rbi-step">
                  <img src={step3 || "/placeholder.svg"} alt="step3" className="step-icon" />
                  <p className="steps-info">
                    <strong>Get Notified</strong> – We'll send you a message once your RBI registration has been
                    processed.
                  </p>
                </div>

                <p className="rbi-note">
                  <strong>Note:</strong> Please avoid submitting multiple registrations for the same household to
                  prevent duplication. For updates on your registration, wait for the official notification or directly
                  contact the barangay office.
                </p>
              </div>
            </div>
          </div>

          {/* Contact information */}
          <div className="rbi-contact">
            <h1 className="rbi-contact-title">For inquiries or follow-ups, reach us at</h1>

            <div className="contact-methods">
              <div className="rbi-contact-number">
                <img src={numberIcon || "/placeholder.svg"} alt="numberIcon" />
                <h2>0905xxxxxxx</h2>
              </div>

              <div className="rbi-contact-facebook">
                <img src={facebookIcon || "/placeholder.svg"} alt="facebookIcon" />
                <h2>Baranggay 58</h2>
              </div>

              <div className="rbi-contact-email">
                <img src={emailIcon || "/placeholder.svg"} alt="emailIcon" />
                <h2>baranggay58.pasay.city@gmail.com</h2>
              </div>
            </div>
          </div>
          <button className="mobile-next-button" onClick={() => toggleSection("form")}>
            Continue to Form
          </button>
        </div>

        {/* Form section */}
        <div className={`rbi-form ${activeSection === "form" ? "active" : ""}`}>
          <div className="rbi-form-container">
            <div className="rbi-fill-up">
              <h1 className="fill-up-title">Complete the Form to Register Your Household</h1>

              <form className="rbi-form-content" onSubmit={handleSubmit}>
                <div className="form-sections">
                  <div className="rbi-form-personal">
                    <h1 className="rbi-form-section-title">PERSONAL INFORMATION</h1>

                    <div className="form-row">
                      <input
                        type="text"
                        id="lname"
                        name="last_name"
                        placeholder="LAST NAME"
                        className={`rbi-form-input ${errors.last_name ? "input-error" : ""}`}
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.last_name && <p className="error-message">*{errors.last_name}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="fname"
                        name="first_name"
                        placeholder="FIRST NAME"
                        className={`rbi-form-input ${errors.first_name ? "input-error" : ""}`}
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.first_name && <p className="error-message">*{errors.first_name}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="mname"
                        name="middle_name"
                        placeholder="MIDDLE NAME"
                        className={`rbi-form-input ${errors.middle_name ? "input-error" : ""}`}
                        value={formData.middle_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.middle_name && <p className="error-message">*{errors.middle_name}</p>}
                    </div>

                    <div className="form-row">
                      <select
                        id="suffix"
                        name="suffix"
                        className="rbi-form-select"
                        value={formData.suffix}
                        onChange={handleChange}
                      >
                        <option value="" disabled selected>
                          SUFFIX
                        </option>
                        <option value="None">None</option>
                        <option value="Jr.">Jr.</option>
                        <option value="Sr.">Sr.</option>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                      </select>
                    </div>
                  </div>

                  <div className="rbi-form-address">
                    <h1 className="rbi-form-section-title">ADDRESS</h1>

                    <div className="form-row">
                      <input
                        type="text"
                        id="house_no"
                        name="house_unit_no"
                        placeholder="HOUSE/UNIT NO."
                        className={`rbi-form-input ${errors.house_unit_no ? "input-error" : ""}`}
                        value={formData.house_unit_no}
                        onChange={handleChange}
                        required
                      />
                      {errors.house_unit_no && <p className="error-message">*{errors.house_unit_no}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="street_name"
                        name="street_name"
                        placeholder="STREET NAME"
                        className={`rbi-form-input ${errors.street_name ? "input-error" : ""}`}
                        value={formData.street_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.street_name && <p className="error-message">*{errors.street_name}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="subdivision"
                        name="subdivision"
                        placeholder="NAME OF SUBDIVISION, SITIO OR PUROK"
                        className={`rbi-form-input ${errors.subdivision ? "input-error" : ""}`}
                        value={formData.subdivision}
                        onChange={handleChange}
                        required
                      />
                      {errors.subdivision && <p className="error-message">*{errors.subdivision}</p>}
                    </div>
                  </div>

                  <div className="rbi-form-other-info">
                    <h1 className="rbi-form-section-title">OTHER INFORMATION</h1>

                    <div className="form-row">
                      <input
                        type="text"
                        id="place_of_birth"
                        name="birth_place"
                        placeholder="PLACE OF BIRTH"
                        className={`rbi-form-input ${errors.birth_place ? "input-error" : ""}`}
                        value={formData.birth_place}
                        onChange={handleChange}
                        required
                      />
                      {errors.birth_place && <p className="error-message">*{errors.birth_place}</p>}
                    </div>

                    <div className="form-row">
                      <div className="birthdate-container">
                        <label htmlFor="birth_date" className="form-label">
                          DATE OF BIRTH
                        </label>
                        <BirthdatePicker
                          ref={birthdateRef}
                          selectedDate={formData.birth_date}
                          onChange={(date) => setFormData({ ...formData, birth_date: date })}
                        />
                      </div>
                      {errors.birth_date && <p className="error-message">*{errors.birth_date}</p>}
                    </div>

                    <div className="form-row">
                      <select
                        id="sex"
                        name="sex"
                        className={`rbi-form-select ${errors.sex ? "input-error" : ""}`}
                        value={formData.sex}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled selected>
                          SEX
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {errors.sex && <p className="error-message">*{errors.sex}</p>}
                    </div>

                    <div className="form-row">
                      <select
                        id="civil_status"
                        name="civil_status"
                        className={`rbi-form-select ${errors.civil_status ? "input-error" : ""}`}
                        value={formData.civil_status}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled selected>
                          CIVIL STATUS
                        </option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                      {errors.civil_status && <p className="error-message">*{errors.civil_status}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="citizenship"
                        name="citizenship"
                        placeholder="CITIZENSHIP"
                        className={`rbi-form-input ${errors.citizenship ? "input-error" : ""}`}
                        value={formData.citizenship}
                        onChange={handleChange}
                        required
                      />
                      {errors.citizenship && <p className="error-message">*{errors.citizenship}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="occupation"
                        name="occupation"
                        placeholder="OCCUPATION"
                        className={`rbi-form-input ${errors.occupation ? "input-error" : ""}`}
                        value={formData.occupation}
                        onChange={handleChange}
                        required
                      />
                      {errors.occupation && <p className="error-message">*{errors.occupation}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="email"
                        id="email"
                        name="email_address"
                        placeholder="EMAIL ADDRESS"
                        className={`rbi-form-input ${errors.email_address ? "input-error" : ""}`}
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                      />
                      {errors.email_address && <p className="error-message">*{errors.email_address}</p>}
                    </div>
                  </div>
                </div>

                <div className="rbi-form-terms-container">
                  <input type="checkbox" id="terms" name="terms" className="rbi-form-terms" />
                  <label htmlFor="terms" className="rbi-form-terms-label">
                    I confirm that the information provided is correct and understand that false details may result in
                    registration denial.
                  </label>
                </div>

                <div className="rbi-form-submit-container">
                  <button type="submit" className="rbi-form-submit">
                    SUBMIT
                  </button>
                </div>

                <div className="back-button-container">
                  <button type="button" className="mobile-back-button" onClick={() => toggleSection("info")}>
                    Back to Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default RBIRegistration
