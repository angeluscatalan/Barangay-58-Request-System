import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import step1 from "../assets/step1.png";
import step2 from "../assets/step2.png";
import step3 from "../assets/step3.png";
import step4 from "../assets/step4.png";
import numberIcon from "../assets/numberIcon.png";
import facebookIcon from "../assets/facebookIcon.png";
import emailIcon from "../assets/emailIcon.png";
import BirthdatePicker from "../components/BirthdatePicker";
import "../styles/reqPage.css";

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
    });

    const [errors, setErrors] = useState({ contact_no: false, email: false });

    const handleChange = (e) => {
        let { name, value } = e.target
        if (["last_name", "first_name", "middle_name", "suffix"].includes(name)) {
            value = value
                .toLowerCase() // Convert to lowercase first
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
               
        }
        setFormData({ ...formData, [name]: value });
    };

    var birthdateRef = useRef(null);

    const getReq = () => {
        if (Object.values(formData).some(value => value.trim() === "")) {
            alert("Please fill in all the required fields in the request form.");
            return;
        }
    
        if (!document.getElementById("terms").checked) {
            alert("Please verify with our terms by clicking the checkbox.");
            return;
        }
    
        const isPhoneValid = (/^0\d{10}$/.test(formData.contact_no) || /^[1-9]\d{9}$/.test(formData.contact_no));
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    
        if (!isPhoneValid || !isEmailValid) {
            alert("Please provide a valid phone number and email.");
            return;
        }
    
        const requestData = {
            ...formData,
            number_of_copies: Number(formData.number_of_copies)
        };
    
        axios.post("http://localhost:5000/requests", requestData, {
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        })
        .then(response => {
            alert("✅ Request successfully submitted!");
        })
        .catch(error => {
            console.error("❌ Error details:", {
                message: error.message,
                code: error.code,
                config: error.config
            });
    
            if (error.code === "ECONNREFUSED") {
                alert("Could not connect to server. Please ensure the backend is running.");
            } else if (error.code === "ERR_NETWORK") {
                alert("Network error. Please check your internet connection.");
            } else {
                alert(`Error: ${error.message}`);
            }
        });
    };
    const validatorNum = () => {
        const isValid = (/^0\d{10}$/.test(formData.contact_no) || /^[1-9]\d{9}$/.test(formData.contact_no));
        console.log('Phone validation:', isValid);
        setErrors(prev => ({ ...prev, contact_no: !isValid }));
    };
    
    const validatorEmail = () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        console.log('Email validation:', isValid); 
        setErrors(prev => ({ ...prev, email: !isValid }));
    };
    return (
        <div className="req">
            <div className="allofelements">
                <div className="reqText">
                    <h1 className="reqTitle">Skip the Lines—Request Online!</h1>
                    <h2 className="reqSubtext">No need to visit the barangay hall until your document is ready—save time and effort!</h2>
                    <div className="reqContainer">
                        <div className="reqSteps">
                            <div className="reqStep1">
                                <img src={step1} alt="step1" className="step1" />
                                <p className="stepsInfo"><strong>Fill Out the Form</strong> – Provide your details and select the type of certificate.</p>
                            </div>

                            <div className="reqStep2">
                                <img src={step2} alt="step2" className="step2" />
                                <p className="stepsInfo"><strong>Submit Your Request</strong> – Click "Submit" and wait for confirmation.</p>
                            </div>

                            <div className="reqStep3">
                                <img src={step3} alt="step3" className="step3" />
                                <p className="stepsInfo"><strong>Get Notified</strong> – We'll inform you when your certificate is ready.</p>
                            </div>

                            <div className="reqStep4">
                                <img src={step4} alt="step4" className="step4" />
                                <p className="stepsInfo"><strong>Pick It Up</strong> – Visit the barangay hall to claim your document.</p>
                            </div>

                            <p className="reqNote"><strong>Note:</strong> Avoid submitting multiple requests for the same certificate to prevent delays.
                                If you need to check your request status, please wait for the notification or contact the barangay office.</p>
                        </div>
                    </div>
                </div>
                
                <div className="requirements">
                    <div className="reqContainer2">
                        <div className="reqFillUp">
                            <h1 className="fillUpTitle">Complete the Form to Request your Certificate.</h1>

                            <div className="reqForm">
                                <div className="reqFormPersonal">
                                    <h1 className="reqFormPersonalTitle">PERSONAL</h1>

                                    <input 
                                        type="text" 
                                        id="lname" 
                                        name="last_name" 
                                        placeholder="LAST NAME" 
                                        className="reqFormInput"
                                        value={formData.last_name}
                                        onChange={handleChange} 
                                    />

                                    <input 
                                        type="text" 
                                        id="fname" 
                                        name="first_name" 
                                        placeholder="FIRST NAME" 
                                        className="reqFormInput"
                                        value={formData.first_name}
                                        onChange={handleChange} 
                                    />

                                    <input 
                                        type="text" 
                                        id="mname" 
                                        name="middle_name" 
                                        placeholder="MIDDLE NAME" 
                                        className="reqFormInput"
                                        value={formData.middle_name}
                                        onChange={handleChange} 
                                    />

                                    <select id="suffix" name="suffix" className="reqFormSelect" value={formData.suffix} onChange={handleChange}>
                                        <option value="" disabled>SUFFIX</option>
                                        <option value="none">NONE</option>
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
                                        <option value="" disabled>SEX</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <BirthdatePicker
                                        ref={birthdateRef}
                                        selectedDate={formData.birthday}
                                        onChange={(date) => setFormData({ ...formData, birthday: date })}
                                    />

                                    <input 
                                        type="number" 
                                        id="contactNum" 
                                        name="contact_no" 
                                        placeholder="CONTACT NO." 
                                        className={`reqFormNum ${errors.contact_no ? 'input-error' : ''}`}
                                        value={formData.contact_no} 
                                        onChange={(e) => {
                                            handleChange(e);
                                            validatorNum(); 
                                        }}
                                        onBlur={validatorNum} 
                                    />

                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        placeholder="EMAIL ADDRESS" 
                                        className={`reqFormEmail ${errors.email ? 'input-error' : ''}`}
                                        value={formData.email} 
                                        onChange={(e) => {
                                            handleChange(e);
                                            validatorEmail();
                                        }}
                                        onBlur={validatorEmail}
                                    />

                                    <div className="validators">
                                        {errors.contact_no && <p className="phoneNumP">*Invalid Phone Number</p>}
                                        {errors.email && <p className="emailP">*Invalid Email (e.g., user@example.com)</p>}
                                    </div>

                                    <input type="text" id="address" name="address" placeholder="ADDRESS" className="reqFormAddress" value={formData.address} onChange={handleChange} />
                                </div>

                                <div className="reqFormCert">
                                    <h1 className="reqFormCertTitle">CERTIFICATE DETAILS</h1>

                                    <select id="certType" name="type_of_certificate" className="reqFormCertSelect" value={formData.type_of_certificate} onChange={handleChange}>
                                        <option value="" disabled>TYPE OF CERTIFICATE</option>
                                        <option value="IDApp">Barangay ID Application</option>
                                    </select>

                                    <input type="text" id="reqPurpose" name="purpose_of_request" placeholder="PURPOSE OF REQUEST" className="reqFormInput" value={formData.purpose_of_request} onChange={handleChange} />
                                    <input type="number" id="copyAmount" name="number_of_copies" className="reqFormCopyAmount" min="1" placeholder="Number of Copies" value={formData.number_of_copies} onChange={handleChange} />
                                </div>

                                <div className="reqFormTermsContainer">
                                    <input type="checkbox" id="terms" name="terms" className="reqFormTerms" />
                                    <label htmlFor="terms" className="reqFormTermsLabel">
                                        I confirm that the information provided is correct and understand that false details may result in request denial.
                                    </label>
                                </div>

                                <div className="reqFormSubmitContainer">
                                    <button className="reqFormSubmit" onClick={getReq}>SUBMIT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="reqContact">
                        <h1 className="reqContactTitle">For inquiries or follow-ups, reach us at</h1>

                        <div className="reqContactNumber">
                            <img src={numberIcon} alt="numberIcon" />
                            <h2>0905xxxxxxx</h2>
                        </div>

                        <div className="reqContactFacebook">
                            <img src={facebookIcon} alt="facebookIcon" />
                            <h2>Baranggay 58</h2>
                        </div>

                        <div className="reqContactEmail">
                            <img src={emailIcon} alt="emailIcon" />
                            <h2>baranggay58.pasay.city@gmail.com</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default reqPage;