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

  function calculateAge(birthday) {
    if (!birthday) return '';
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  }

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
                    className={`reqFormInput ${errors.last_name ? 'input-error' : ''}`}
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {errors.last_name && <p className="error-message">{errors.last_name}</p>}
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    id="fname"
                    name="first_name"
                    placeholder="FIRST NAME"
                    className={`reqFormInput ${errors.first_name ? 'input-error' : ''}`}
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                   {errors.first_name && <p className="error-message">{errors.first_name}</p>}
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    id="mname"
                    name="middle_name"
                    placeholder="MIDDLE NAME"
                    className={`reqFormInput ${errors.middle_name ? 'input-error' : ''}`}
                    value={formData.middle_name}
                    onChange={handleChange}
                  />
                  {errors.middle_name && <p className="error-message">{errors.middle_name}</p>}
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
                  <div className="birthdate-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="birthday" className="form-label">BIRTHDAY</label>
                    <div className="address-field" style={{ display: 'flex', alignItems: 'center', width: '100%', background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '0 1.5rem', height: '48px', fontSize: '1rem' }}>
                      <BirthdatePicker
                        ref={birthdateRef}
                        selectedDate={formData.birthday}
                        onChange={(date) => setFormData({ ...formData, birthday: date })}
                        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', height: '100%', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <span style={{ marginLeft: 32, minWidth: 110, fontWeight: 500, color: '#666', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, marginRight: 4 }}>AGE:</span> {formData.birthday ? `${calculateAge(formData.birthday)} yrs old` : ''}
                      </span>
                    </div>
                  </div>
                </div>


                <div className="input-container">
  <div className="contact-number-flex">
    <input
      type="text"
      name="country_code"
      placeholder="+63"
      className="country-code-input"
      value={formData.country_code || ""}
      onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
    />
    <input
      type="tel"
      name="contact_no"
      placeholder="9XXXXXXXXX"
      className={`reqFormNum ${errors.contact_no ? "input-error" : ""}`}
      value={formData.contact_no}
      onChange={(e) => {
        handleChange(e);
        validatorNum();
      }}
      onBlur={validatorNum}
    />
  </div>
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
                <label htmlFor="address" className="form-label">
                  ADDRESS
                </label>
                <div className="form-row address-box">
                  <input
                    type="text"
                    id="unitNo"
                    name="unit_no"
                    placeholder="HOUSE/UNIT NO."
                    className={`address-field ${errors.unit_no ? "error" : ""}`}
                    value={formData.unit_no}
                    onChange={handleChange}
                  />
                  {errors.unit_no && <p className="error-message">{errors.unit_no}</p>}
                  <span className="address-separator">/</span>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    placeholder="STREET NAME"
                    className={`address-field ${errors.street ? "error" : ""}`}
                    value={formData.street}
                    onChange={handleChange}
                  />
                  {errors.street && <p className="error-message">{errors.street}</p>}
                  <span className="address-separator">/</span>
                  <input
                    type="text"
                    id="subdivision"
                    name="subdivision"
                    placeholder="NAME OF SUBDIVISION, SITIO OR PUROK"
                    className={`address-field ${errors.subdivision ? "error" : ""}`}
                    value={formData.subdivision}
                    onChange={handleChange}
                  />
                   {errors.subdivision && <p className="error-message">{errors.subdivision}</p>}
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
                    className={`reqFormCopyAmount ${errors.number_of_copies ? "error" : ""}`}
                    min="1"
                    placeholder="Number of Copies"
                    value={formData.number_of_copies}
                    onChange={handleChange}
                  />
                  {errors.number_of_copies && <p className="error-message">{errors.number_of_copies}</p>}
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

            { }
            <div className="back-button-container">
              <button className="mobile-back-button" onClick={() => toggleSection("info")}>
                Back to Information
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default RequestForm

