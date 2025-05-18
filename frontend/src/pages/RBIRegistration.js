"use client"

import { useState, useRef, useEffect } from "react"
import BirthdatePicker from "../components/BirthdatePicker"
import BirthdateMembers from "../components/BirthdateMembers"
import ConfirmationModal from "../components/ConfirmationModal"
import "../styles/RBIRegistration.css"
import step1 from "../assets/step1.png"
import step2 from "../assets/step2.png"
import step3 from "../assets/step3.png"
import numberIcon from "../assets/numberIcon.png"
import facebookIcon from "../assets/facebookIcon.png"
import emailIcon from "../assets/emailIcon.png"
import axios from "axios"
import Footer from "../components/Footer"
import ValidationErrorPopup from "../components/ValidationErrorPopup"
import SuccessPopup from "../components/SuccessPopup"

function RBIRegistration() {
  const [activeSection, setActiveSection] = useState("info")
  const birthdateRef = useRef(null)
  const [memberCount, setMemberCount] = useState(0)
  const [errors, setErrors] = useState({
    household: {},
    members: [],
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const memberRefs = useRef([])
  const [showValidationError, setShowValidationError] = useState(false)
  const [missingFields, setMissingFields] = useState([])
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Household head information
  const [householdData, setHouseholdData] = useState({
    head_last_name: "",
    head_first_name: "",
    head_middle_name: "",
    head_suffix: "",
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

  // State for household members
  const [members, setMembers] = useState([])

  // Update refs when members change
  useEffect(() => {
    memberRefs.current = memberRefs.current.slice(0, members.length)
  }, [members])

  const handleHouseholdChange = (e) => {
    let { name, value } = e.target
    if (["head_last_name", "head_first_name", "head_middle_name", "birth_place"].includes(name)) {
      value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }
    setHouseholdData({ ...householdData, [name]: value })
  }

  const handleHouseholdDateChange = (date) => {
    console.log("Date selected:", date)
    setHouseholdData({ ...householdData, birth_date: date })
  }

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target
    const updatedMembers = [...members]
    let processedValue = value

    if (["last_name", "first_name", "middle_name", "birth_place"].includes(name)) {
      processedValue = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }

    updatedMembers[index] = {
      ...updatedMembers[index],
      [name]: processedValue,
    }

    setMembers(updatedMembers)
  }

  const handleMemberDateChange = (index, date) => {
    setMembers((prevMembers) => {
      const updatedMembers = [...prevMembers]
      updatedMembers[index] = {
        ...updatedMembers[index],
        birth_date: date ? date.toISOString().split("T")[0] : "",
      }
      return updatedMembers
    })
  }

  const scrollToNewMember = (index) => {
    setTimeout(() => {
      if (memberRefs.current[index]) {
        memberRefs.current[index].scrollIntoView({ behavior: "smooth", block: "start" })

        // Add highlight effect
        memberRefs.current[index].classList.add("highlight-member")
        setTimeout(() => {
          memberRefs.current[index].classList.remove("highlight-member")
        }, 1500)
      }
    }, 100)
  }

  const addMember = () => {
    if (members.length < 10) {
      const newIndex = members.length
      setMembers([
        ...members,
        {
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
        },
      ])
      setMemberCount(memberCount + 1)
      setErrors({
        ...errors,
        members: [...errors.members, {}],
      })

      // Scroll to the new member form
      scrollToNewMember(newIndex)
    } else {
      alert("Maximum of 10 household members allowed.")
    }
  }

  const removeMember = (index) => {
    const updatedMembers = [...members]
    updatedMembers.splice(index, 1)
    setMembers(updatedMembers)

    const updatedErrors = { ...errors }
    updatedErrors.members.splice(index, 1)
    setErrors(updatedErrors)

    setMemberCount(memberCount - 1)
  }

  // Update the validateForm function to properly check for empty birth_date
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      household: {},
      members: members.map(() => ({})),
    }
    const missingFieldsList = []

    // Validate household head data
    const householdFieldLabels = {
      head_last_name: "Household Head Last Name",
      head_first_name: "Household Head First Name",
      head_middle_name: "Household Head Middle Name",
      house_unit_no: "House/Unit No.",
      street_name: "Street Name",
      subdivision: "Subdivision/Sitio/Purok",
      birth_place: "Birth Place",
      birth_date: "Birth Date",
      sex: "Sex",
      civil_status: "Civil Status",
      citizenship: "Citizenship",
      occupation: "Occupation",
      email_address: "Email Address",
    }

    // Check each household field
    if (!householdData.head_last_name || householdData.head_last_name.trim() === "") {
      newErrors.household.head_last_name = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.head_last_name)
    }

    if (!householdData.head_first_name || householdData.head_first_name.trim() === "") {
      newErrors.household.head_first_name = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.head_first_name)
    }

    if (!householdData.head_middle_name || householdData.head_middle_name.trim() === "") {
      newErrors.household.head_middle_name = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.head_middle_name)
    }

    if (!householdData.house_unit_no || householdData.house_unit_no.trim() === "") {
      newErrors.household.house_unit_no = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.house_unit_no)
    }

    if (!householdData.street_name || householdData.street_name.trim() === "") {
      newErrors.household.street_name = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.street_name)
    }

    if (!householdData.subdivision || householdData.subdivision.trim() === "") {
      newErrors.household.subdivision = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.subdivision)
    }

    if (!householdData.birth_place || householdData.birth_place.trim() === "") {
      newErrors.household.birth_place = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.birth_place)
    }

    // Explicitly check birth_date
    if (!householdData.birth_date) {
      newErrors.household.birth_date = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.birth_date)
    }

    if (!householdData.sex || householdData.sex.trim() === "") {
      newErrors.household.sex = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.sex)
    }

    if (!householdData.civil_status || householdData.civil_status.trim() === "") {
      newErrors.household.civil_status = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.civil_status)
    }

    if (!householdData.citizenship || householdData.citizenship.trim() === "") {
      newErrors.household.citizenship = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.citizenship)
    }

    if (!householdData.occupation || householdData.occupation.trim() === "") {
      newErrors.household.occupation = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.occupation)
    }

    if (!householdData.email_address || householdData.email_address.trim() === "") {
      newErrors.household.email_address = "This field is required"
      isValid = false
      missingFieldsList.push(householdFieldLabels.email_address)
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(householdData.email_address)) {
      newErrors.household.email_address = "Please enter a valid email address"
      isValid = false
      missingFieldsList.push("Email Address (Invalid format)")
    }

    // Validate members data if there are any
    members.forEach((member, index) => {
      const memberFieldLabels = {
        last_name: `Member ${index + 1} Last Name`,
        first_name: `Member ${index + 1} First Name`,
        middle_name: `Member ${index + 1} Middle Name`,
        birth_place: `Member ${index + 1} Birth Place`,
        birth_date: `Member ${index + 1} Birth Date`,
        sex: `Member ${index + 1} Sex`,
        civil_status: `Member ${index + 1} Civil Status`,
        citizenship: `Member ${index + 1} Citizenship`,
        occupation: `Member ${index + 1} Occupation`,
      }

      // Check each member field
      if (!member.last_name || member.last_name.trim() === "") {
        newErrors.members[index].last_name = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.last_name)
      }

      if (!member.first_name || member.first_name.trim() === "") {
        newErrors.members[index].first_name = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.first_name)
      }

      if (!member.middle_name || member.middle_name.trim() === "") {
        newErrors.members[index].middle_name = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.middle_name)
      }

      if (!member.birth_place || member.birth_place.trim() === "") {
        newErrors.members[index].birth_place = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.birth_place)
      }

      // Explicitly check birth_date for members
      if (!member.birth_date) {
        newErrors.members[index].birth_date = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.birth_date)
      }

      if (!member.sex || member.sex.trim() === "") {
        newErrors.members[index].sex = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.sex)
      }

      if (!member.civil_status || member.civil_status.trim() === "") {
        newErrors.members[index].civil_status = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.civil_status)
      }

      if (!member.citizenship || member.citizenship.trim() === "") {
        newErrors.members[index].citizenship = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.citizenship)
      }

      if (!member.occupation || member.occupation.trim() === "") {
        newErrors.members[index].occupation = "This field is required"
        isValid = false
        missingFieldsList.push(memberFieldLabels.occupation)
      }
    })

    setErrors(newErrors)
    setMissingFields(missingFieldsList)
    return isValid
  }

  // Now, let's update the handleSubmit function to ensure it shows the validation popup
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate the form
    const isValid = validateForm()

    if (!isValid) {
      // Show validation error popup
      setShowValidationError(true)
      return
    }

    if (!document.getElementById("terms").checked) {
      setMissingFields(["Agreement to terms and conditions"])
      setShowValidationError(true)
      return
    }

    // Show confirmation modal only when all validations pass
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      // Format dates
      const formattedHouseholdData = {
        ...householdData,
        birth_date: householdData.birth_date ? new Date(householdData.birth_date).toISOString().split("T")[0] : null,
      }

      const formattedMembers = members.map((member) => ({
        ...member,
        birth_date: member.birth_date ? new Date(member.birth_date).toISOString().split("T")[0] : null,
      }))

      // Submit data to API
      const response = await axios.post("http://localhost:5000/api/households/", {
        household: formattedHouseholdData,
        members: formattedMembers,
      })

      if (response.status === 200 || response.status === 201) {
        setShowConfirmation(false)
        // Show success popup instead of alert
        setShowSuccessPopup(true)

        // Reset form
        setHouseholdData({
          head_last_name: "",
          head_first_name: "",
          head_middle_name: "",
          head_suffix: "",
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
        setMembers([])
        setMemberCount(0)
        document.getElementById("terms").checked = false
      } else {
        setShowConfirmation(false)
        // Show error popup
        setShowSuccessPopup(false)
      }
    } catch (error) {
      setShowConfirmation(false)
      console.error("Error submitting RBI registration:", error)
      // Show error popup
      setShowSuccessPopup(false)
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

              <form className="rbi-form-content" onSubmit={handleSubmit} noValidate>
                {/* Household Head Information */}
                <div className="rbi-form-section">
                  <h2 className="rbi-form-section-title">HOUSEHOLD HEAD INFORMATION</h2>

                  <div className="form-sections">
                    <div className="rbi-form-personal">
                      <h3 className="rbi-form-subsection-title">PERSONAL INFORMATION</h3>

                      <div className="form-row">
                        <input
                          type="text"
                          id="head_lname"
                          name="head_last_name"
                          placeholder="LAST NAME"
                          className={`rbi-form-input ${errors.household.head_last_name ? "input-error" : ""}`}
                          value={householdData.head_last_name}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.head_last_name && (
                          <p className="error-message">*{errors.household.head_last_name}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          type="text"
                          id="head_fname"
                          name="head_first_name"
                          placeholder="FIRST NAME"
                          className={`rbi-form-input ${errors.household.head_first_name ? "input-error" : ""}`}
                          value={householdData.head_first_name}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.head_first_name && (
                          <p className="error-message">*{errors.household.head_first_name}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          type="text"
                          id="head_mname"
                          name="head_middle_name"
                          placeholder="MIDDLE NAME"
                          className={`rbi-form-input ${errors.household.head_middle_name ? "input-error" : ""}`}
                          value={householdData.head_middle_name}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.head_middle_name && (
                          <p className="error-message">*{errors.household.head_middle_name}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <select
                          id="head_suffix"
                          name="head_suffix"
                          className="rbi-form-select"
                          value={householdData.head_suffix}
                          onChange={handleHouseholdChange}
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
                      <h3 className="rbi-form-subsection-title">ADDRESS</h3>

                      <div className="form-row">
                        <input
                          type="text"
                          id="house_no"
                          name="house_unit_no"
                          placeholder="HOUSE/UNIT NO."
                          className={`rbi-form-input ${errors.household.house_unit_no ? "input-error" : ""}`}
                          value={householdData.house_unit_no}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.house_unit_no && (
                          <p className="error-message">*{errors.household.house_unit_no}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          type="text"
                          id="street_name"
                          name="street_name"
                          placeholder="STREET NAME"
                          className={`rbi-form-input ${errors.household.street_name ? "input-error" : ""}`}
                          value={householdData.street_name}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.street_name && (
                          <p className="error-message">*{errors.household.street_name}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          type="text"
                          id="subdivision"
                          name="subdivision"
                          placeholder="NAME OF SUBDIVISION, SITIO OR PUROK"
                          className={`rbi-form-input ${errors.household.subdivision ? "input-error" : ""}`}
                          value={householdData.subdivision}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.subdivision && (
                          <p className="error-message">*{errors.household.subdivision}</p>
                        )}
                      </div>
                    </div>

                    <div className="rbi-form-other-info">
                      <h3 className="rbi-form-subsection-title">OTHER INFORMATION</h3>

                      <div className="form-row">
                        <input
                          type="text"
                          id="head_place_of_birth"
                          name="birth_place"
                          placeholder="PLACE OF BIRTH"
                          className={`rbi-form-input ${errors.household.birth_place ? "input-error" : ""}`}
                          value={householdData.birth_place}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.birth_place && (
                          <p className="error-message">*{errors.household.birth_place}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="birthdate-container">
                          <label htmlFor="head_birth_date" className="form-label">
                            DATE OF BIRTH
                          </label>
                          <BirthdatePicker
                            ref={birthdateRef}
                            selectedDate={householdData.birth_date}
                            onChange={handleHouseholdDateChange}
                          />
                        </div>
                        {errors.household.birth_date && <p className="error-message">*{errors.household.birth_date}</p>}
                      </div>

                      <div className="form-row">
                        <select
                          id="head_sex"
                          name="sex"
                          className={`rbi-form-select ${errors.household.sex ? "input-error" : ""}`}
                          value={householdData.sex}
                          onChange={handleHouseholdChange}
                          required
                        >
                          <option value="" disabled selected>
                            SEX
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        {errors.household.sex && <p className="error-message">*{errors.household.sex}</p>}
                      </div>

                      <div className="form-row">
                        <select
                          id="head_civil_status"
                          name="civil_status"
                          className={`rbi-form-select ${errors.household.civil_status ? "input-error" : ""}`}
                          value={householdData.civil_status}
                          onChange={handleHouseholdChange}
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
                        {errors.household.civil_status && (
                          <p className="error-message">*{errors.household.civil_status}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          type="text"
                          id="head_citizenship"
                          name="citizenship"
                          placeholder="CITIZENSHIP"
                          className={`rbi-form-input ${errors.household.citizenship ? "input-error" : ""}`}
                          value={householdData.citizenship}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.citizenship && (
                          <p className="error-message">*{errors.household.citizenship}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <input
                          type="text"
                          id="head_occupation"
                          name="occupation"
                          placeholder="OCCUPATION"
                          className={`rbi-form-input ${errors.household.occupation ? "input-error" : ""}`}
                          value={householdData.occupation}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.occupation && <p className="error-message">*{errors.household.occupation}</p>}
                      </div>

                      <div className="form-row">
                        <input
                          type="email"
                          id="head_email"
                          name="email_address"
                          placeholder="EMAIL ADDRESS"
                          className={`rbi-form-input ${errors.household.email_address ? "input-error" : ""}`}
                          value={householdData.email_address}
                          onChange={handleHouseholdChange}
                          required
                        />
                        {errors.household.email_address && (
                          <p className="error-message">*{errors.household.email_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Household Members Section */}
                <div className="rbi-form-section household-members-section">
                  <h2 className="rbi-form-section-title">HOUSEHOLD MEMBERS</h2>

                  {members.map((member, index) => (
                    <div key={index} className="member-form" ref={(el) => (memberRefs.current[index] = el)}>
                      <div className="member-header">
                        <h3 className="member-title">Member {index + 1}</h3>
                        <button type="button" className="remove-member-button" onClick={() => removeMember(index)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="remove-icon"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="18" y1="8" x2="23" y2="13"></line>
                            <line x1="23" y1="8" x2="18" y2="13"></line>
                          </svg>
                          Remove
                        </button>
                      </div>

                      <div className="form-sections">
                        <div className="member-personal">
                          <h3 className="rbi-form-subsection-title">PERSONAL INFORMATION</h3>
                          <div className="form-row">
                            <input
                              type="text"
                              name="last_name"
                              placeholder="LAST NAME"
                              className={`rbi-form-input ${errors.members[index]?.last_name ? "input-error" : ""}`}
                              value={member.last_name}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            />
                            {errors.members[index]?.last_name && (
                              <p className="error-message">*{errors.members[index].last_name}</p>
                            )}
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="first_name"
                              placeholder="FIRST NAME"
                              className={`rbi-form-input ${errors.members[index]?.first_name ? "input-error" : ""}`}
                              value={member.first_name}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            />
                            {errors.members[index]?.first_name && (
                              <p className="error-message">*{errors.members[index].first_name}</p>
                            )}
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="middle_name"
                              placeholder="MIDDLE NAME"
                              className={`rbi-form-input ${errors.members[index]?.middle_name ? "input-error" : ""}`}
                              value={member.middle_name}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            />
                            {errors.members[index]?.middle_name && (
                              <p className="error-message">*{errors.members[index].middle_name}</p>
                            )}
                          </div>

                          <div className="form-row">
                            <select
                              name="suffix"
                              className="rbi-form-select"
                              value={member.suffix}
                              onChange={(e) => handleMemberChange(index, e)}
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

                        <div className="member-other-info">
                          <h3 className="rbi-form-subsection-title">OTHER INFORMATION</h3>

                          <div className="form-row">
                            <input
                              type="text"
                              name="birth_place"
                              placeholder="PLACE OF BIRTH"
                              className={`rbi-form-input ${errors.members[index]?.birth_place ? "input-error" : ""}`}
                              value={member.birth_place}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            />
                            {errors.members[index]?.birth_place && (
                              <p className="error-message">*{errors.members[index].birth_place}</p>
                            )}
                          </div>
                          <div className="form-row">
                            <div className="form-row">
                              <div className="birthdate-container">
                                <label htmlFor={`member_birth_date_${index}`} className="form-label">
                                  DATE OF BIRTH
                                </label>
                                <BirthdateMembers
                                  selectedDate={member.birth_date}
                                  onChange={(date) => handleMemberDateChange(index, date)}
                                  index={index}
                                />
                              </div>
                              {errors.members[index]?.birth_date && (
                                <p className="error-message">*{errors.members[index].birth_date}</p>
                              )}
                            </div>
                            {errors.members[index]?.birth_date && (
                              <p className="error-message">*{errors.members[index].birth_date}</p>
                            )}
                          </div>
                          <div className="form-row">
                            <select
                              name="sex"
                              className={`rbi-form-select ${errors.members[index]?.sex ? "input-error" : ""}`}
                              value={member.sex}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            >
                              <option value="" disabled selected>
                                SEX
                              </option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                            {errors.members[index]?.sex && (
                              <p className="error-message">*{errors.members[index].sex}</p>
                            )}
                          </div>

                          <div className="form-row">
                            <select
                              name="civil_status"
                              className={`rbi-form-select ${errors.members[index]?.civil_status ? "input-error" : ""}`}
                              value={member.civil_status}
                              onChange={(e) => handleMemberChange(index, e)}
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
                            {errors.members[index]?.civil_status && (
                              <p className="error-message">*{errors.members[index].civil_status}</p>
                            )}
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="citizenship"
                              placeholder="CITIZENSHIP"
                              className={`rbi-form-input ${errors.members[index]?.citizenship ? "input-error" : ""}`}
                              value={member.citizenship}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            />
                            {errors.members[index]?.citizenship && (
                              <p className="error-message">*{errors.members[index].citizenship}</p>
                            )}
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              name="occupation"
                              placeholder="OCCUPATION"
                              className={`rbi-form-input ${errors.members[index]?.occupation ? "input-error" : ""}`}
                              value={member.occupation}
                              onChange={(e) => handleMemberChange(index, e)}
                              required
                            />
                            {errors.members[index]?.occupation && (
                              <p className="error-message">*{errors.members[index].occupation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="add-member-button" onClick={addMember}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="add-icon"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Add Household Member
                  </button>
                  <p className="members-count">Number of members: {memberCount} (Max: 10)</p>
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

      {/* Confirmation Modal - only shown when all validations pass */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        formData={{ ...householdData, members }}
        formType="rbi"
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
        message="Your RBI Registration has been successfully submitted! You will be notified once it has been processed."
      />

      <Footer />
    </div>
  )
}

export default RBIRegistration
