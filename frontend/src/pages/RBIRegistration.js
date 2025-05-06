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
  const [memberForms, setMemberForms] = useState([])
  const [formData, setFormData] = useState({
    head_last_name: "",
    head_first_name: "",
    head_middle_name: "",
    head_suffix: "",
    house_unit_no: "",
    street_name: "",
    subdivision: "",
    email_address: "",
  })
  const [errors, setErrors] = useState({})

  // Initialize empty member form
  const emptyMemberForm = {
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "",
    birth_place: "",
    birth_date: "",
    sex: "",
    civil_status: "",
    citizenship: "",
    occupation: "",
  }

  // Add a new member form
  const addMemberForm = () => {
    if (memberForms.length < 10) {
      setMemberForms([...memberForms, { ...emptyMemberForm, id: Date.now() }])
    } else {
      alert("Maximum of 10 household members allowed.")
    }
  }

  // Remove a member form
  const removeMemberForm = (id) => {
    setMemberForms(memberForms.filter(member => member.id !== id))
  }

  // Handle changes in household head form
  const handleChange = (e) => {
    let { name, value } = e.target
    if (["head_last_name", "head_first_name", "head_middle_name"].includes(name)) {
      value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }
    setFormData({ ...formData, [name]: value })
  }

  // Handle changes in member forms
  const handleMemberChange = (id, e) => {
    let { name, value } = e.target
    
    if (["last_name", "first_name", "middle_name", "birth_place"].includes(name)) {
      value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }
    
    setMemberForms(memberForms.map(member => 
      member.id === id ? { ...member, [name]: value } : member
    ))
  }

  // Handle member date change
  const handleMemberDateChange = (id, date) => {
    setMemberForms(memberForms.map(member => 
      member.id === id ? { ...member, birth_date: date } : member
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation for household head
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      if (formData[key].trim() === "" && key !== "head_suffix") {
        newErrors[key] = "This field is required"
      }
    })

    // Add email validation
    if (formData.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = "Please enter a valid email address"
    }

    // Validate member forms if any exist
    let memberErrors = false
    if (memberForms.length > 0) {
      memberForms.forEach((member, index) => {
        Object.keys(member).forEach(key => {
          if (key !== 'id' && key !== 'suffix' && !member[key]) {
            memberErrors = true
            alert(`Please fill in all required fields for Member ${index + 1}`)
            return
          }
        })
      })
    }

    if (!document.getElementById("terms").checked) {
      alert("Please verify with our terms by clicking the checkbox.")
      return
    }

    if (Object.keys(newErrors).length > 0 || memberErrors) {
      setErrors(newErrors)
      alert("Please fill in all required fields.")
      return
    }

    try {
      // Create household first
      const householdResponse = await axios.post("http://localhost:5000/households", formData)

      if (householdResponse.status === 200 || householdResponse.status === 201) {
        const householdId = householdResponse.data.householdId

        // If we have members, submit them
        if (memberForms.length > 0) {
          const membersData = memberForms.map(member => ({
            ...member,
            household_id: householdId,
            birth_date: new Date(member.birth_date).toISOString().split("T")[0]
          }))

          await axios.post("http://localhost:5000/household-members", { members: membersData })
        }

        alert("✅ RBI Registration successfully submitted!")

        // Reset form
        setFormData({
          head_last_name: "",
          head_first_name: "",
          head_middle_name: "",
          head_suffix: "",
          house_unit_no: "",
          street_name: "",
          subdivision: "",
          email_address: "",
        })
        setMemberForms([])
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
                    <h1 className="rbi-form-section-title">HOUSEHOLD HEAD INFORMATION</h1>

                    <div className="form-row">
                      <input
                        type="text"
                        id="head_last_name"
                        name="head_last_name"
                        placeholder="LAST NAME"
                        className={`rbi-form-input ${errors.head_last_name ? "input-error" : ""}`}
                        value={formData.head_last_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.head_last_name && <p className="error-message">*{errors.head_last_name}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="head_first_name"
                        name="head_first_name"
                        placeholder="FIRST NAME"
                        className={`rbi-form-input ${errors.head_first_name ? "input-error" : ""}`}
                        value={formData.head_first_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.head_first_name && <p className="error-message">*{errors.head_first_name}</p>}
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        id="head_middle_name"
                        name="head_middle_name"
                        placeholder="MIDDLE NAME"
                        className={`rbi-form-input ${errors.head_middle_name ? "input-error" : ""}`}
                        value={formData.head_middle_name}
                        onChange={handleChange}
                        required
                      />
                      {errors.head_middle_name && <p className="error-message">*{errors.head_middle_name}</p>}
                    </div>

                    <div className="form-row">
                      <select
                        id="head_suffix"
                        name="head_suffix"
                        className="rbi-form-select"
                        value={formData.head_suffix}
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
                        id="house_unit_no"
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
                  
                  {/* Household Members Section */}
                  <div className="rbi-form-household-members">
                    <div className="household-members-header">
                      <h1 className="rbi-form-section-title">HOUSEHOLD MEMBERS</h1>
                      <button 
                        type="button" 
                        className="add-member-btn"
                        onClick={addMemberForm}
                      >
                        + Add Member
                      </button>
                    </div>
                    
                    {memberForms.length === 0 && (
                      <div className="no-members-message">
                        <p>No household members added. Click "Add Member" to include family members.</p>
                      </div>
                    )}
                    
                    {memberForms.map((member, index) => (
                      <div key={member.id} className="member-form">
                        <div className="member-header">
                          <h3>Member {index + 1}</h3>
                          <button 
                            type="button" 
                            className="remove-member-btn"
                            onClick={() => removeMemberForm(member.id)}
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="member-form-fields">
                          <div className="form-row">
                            <input
                              type="text"
                              name="last_name"
                              placeholder="LAST NAME"
                              className="rbi-form-input"
                              value={member.last_name}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="first_name"
                              placeholder="FIRST NAME"
                              className="rbi-form-input"
                              value={member.first_name}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="middle_name"
                              placeholder="MIDDLE NAME"
                              className="rbi-form-input"
                              value={member.middle_name}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <select
                              name="suffix"
                              className="rbi-form-select"
                              value={member.suffix}
                              onChange={(e) => handleMemberChange(member.id, e)}
                            >
                              <option value="" disabled selected>SUFFIX</option>
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

                          <div className="form-row">
                            <input
                              type="text"
                              name="birth_place"
                              placeholder="PLACE OF BIRTH"
                              className="rbi-form-input"
                              value={member.birth_place}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <div className="birthdate-container">
                              <label className="form-label">DATE OF BIRTH</label>
                              <BirthdatePicker
                                selectedDate={member.birth_date}
                                onChange={(date) => handleMemberDateChange(member.id, date)}
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <select
                              name="sex"
                              className="rbi-form-select"
                              value={member.sex}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            >
                              <option value="" disabled selected>SEX</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div className="form-row">
                            <select
                              name="civil_status"
                              className="rbi-form-select"
                              value={member.civil_status}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            >
                              <option value="" disabled selected>CIVIL STATUS</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Separated">Separated</option>
                              <option value="Divorced">Divorced</option>
                            </select>
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="citizenship"
                              placeholder="CITIZENSHIP"
                              className="rbi-form-input"
                              value={member.citizenship}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            />
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="occupation"
                              placeholder="OCCUPATION"
                              className="rbi-form-input"
                              value={member.occupation}
                              onChange={(e) => handleMemberChange(member.id, e)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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