"use client"

import { useRef } from "react"
import BirthdatePicker from "../components/BirthdatePicker"
import "../styles/reqPage.css"

const RequestForm = ({
  formData,
  errors,
  handleChange,
  getReq,
  validatorNum,
  validatorEmail,
  setFormData,
  toggleSection,
}) => {
  const birthdateRef = useRef(null)
  return (
    <div className="requirements">
      <div className="reqContainer2">
        <div className="reqFillUp">
          <h1 className="fillUpTitle">Complete the Form to Request your Certificate</h1>

          <div className="reqForm">
            <div className="form-sections">
              <div className="reqFormPersonal">
                <h1 className="reqFormPersonalTitle">PERSONAL</h1>

                <div className="form-row">
                  <input
                    type="text"
                    id="lname"
                    name="last_name"
                    placeholder="LAST NAME"
                    className="reqFormInput"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    id="fname"
                    name="first_name"
                    placeholder="FIRST NAME"
                    className="reqFormInput"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    id="mname"
                    name="middle_name"
                    placeholder="MIDDLE NAME"
                    className="reqFormInput"
                    value={formData.middle_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row form-row-split">
                  <select
                    id="suffix"
                    name="suffix"
                    className="reqFormSelect"
                    value={formData.suffix}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      SUFFIX
                    </option>
                    <option value="None">None</option>
                    <option value="I.">I.</option>
                    <option value="II.">II.</option>
                    <option value="III.">III.</option>
                    <option value="IV.">IV.</option>
                    <option value="V.">V.</option>
                    <option value="VI.">VI.</option>
                    <option value="VII.">VII.</option>
                    <option value="VIII.">VIII.</option>
                    <option value="IX.">IX.</option>
                    <option value="X.">X.</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                  </select>

                  <select id="sex" name="sex" className="reqFormSelect" value={formData.sex} onChange={handleChange}>
                    <option value="" disabled>
                      SEX
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="birthdate-container">
                    <label htmlFor="birthday" className="form-label">
                      BIRTHDAY
                    </label>
                    <BirthdatePicker
                      ref={birthdateRef}
                      selectedDate={formData.birthday}
                      onChange={(date) => setFormData({ ...formData, birthday: date })}
                    />
                  </div>
                </div>

                <div className="form-row form-row-split">
                  <div className="input-container">
                    <input
                      type="number"
                      id="contactNum"
                      name="contact_no"
                      placeholder="CONTACT NO."
                      className={`reqFormNum ${errors.contact_no ? "input-error" : ""}`}
                      value={formData.contact_no}
                      onChange={(e) => {
                        handleChange(e)
                        validatorNum()
                      }}
                      onBlur={validatorNum}
                    />
                    {errors.contact_no && <p className="error-message">*Invalid Phone Number</p>}
                  </div>

                  <div className="input-container">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="EMAIL ADDRESS"
                      className={`reqFormEmail ${errors.email ? "input-error" : ""}`}
                      value={formData.email}
                      onChange={(e) => {
                        handleChange(e)
                        validatorEmail()
                      }}
                      onBlur={validatorEmail}
                    />
                    {errors.email && <p className="error-message">*Invalid Email</p>}
                  </div>
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="ADDRESS"
                    className="reqFormAddress"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="reqFormCert">
                <h1 className="reqFormCertTitle">CERTIFICATE DETAILS</h1>

                <div className="form-row">
                  <select
                    id="certType"
                    name="type_of_certificate"
                    className="reqFormCertSelect"
                    value={formData.type_of_certificate}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      TYPE OF CERTIFICATE
                    </option>
                    <option value="IDApp">Barangay ID Application</option>
                    <option value="IndigencyCert">Certificate of Indigency</option>
                    <option value="JobseekerCert">Barangay Jobseeker</option>
                    <option value="ClearanceCert">Barangay Clearance</option>
                    <option value="BrgyCert">Barangay Certificate</option>
                  </select>
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    id="reqPurpose"
                    name="purpose_of_request"
                    placeholder="PURPOSE OF REQUEST"
                    className="reqFormInput"
                    value={formData.purpose_of_request}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <input
                    type="number"
                    id="copyAmount"
                    name="number_of_copies"
                    className="reqFormCopyAmount"
                    min="1"
                    placeholder="Number of Copies"
                    value={formData.number_of_copies}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="reqFormTermsContainer">
              <input type="checkbox" id="terms" name="terms" className="reqFormTerms" />
              <label htmlFor="terms" className="reqFormTermsLabel">
                I confirm that the information provided is correct and understand that false details may result in
                request denial.
              </label>
            </div>

            <div className="reqFormSubmitContainer">
              <button className="reqFormSubmit" onClick={getReq}>
                SUBMIT
              </button>
            </div>

            {}
            <div className="back-button-container">
              <button className="mobile-back-button" onClick={() => toggleSection("info")}>
                Back to Information
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default RequestForm

