import React, { useState, useEffect,useRef} from "react";
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
    var birthdateRef = useRef(null);
    var email = "";
    var phone = "";
    function getReq(){
    var lastName, firstName, middlename, suffix, sex, birthday, contactNo, emailAd, address, certificateType, purpose, NumberofCopies, DateRequested;
    if(
        document.getElementById("lname").value == "" || birthdateRef.current?.value =="" || document.getElementById("fname").value == "" 
        || document.getElementById("mname").value == ""  || document.getElementById("suffix").value == "" || document.getElementById("sex").value == ""
        || document.getElementById("certType").value == "" || document.getElementById("reqPurpose").value == "" || document.getElementById("copyAmount").value == ""
        || document.getElementById("address").value == "" || document.getElementById("contactNum").value==""||document.getElementById("email").value == "")
    {
        alert("Please fill in all the boxes in the request form.");
    }
    else if(document.getElementById("terms").checked == false){
        alert("Please verify with our terms by clicking the checkbox.");
    }
    else if(document.getElementById("phoneNumP").style.visibility == "visible" || document.getElementById("emailP").style.visibility == "visible"){
        alert("Please put in a valid phone number or email.");
    }
    else{
        lastName = document.getElementById("lname").value;
        firstName =document.getElementById("fname").value;
        middlename = document.getElementById("mname").value;
        suffix = document.getElementById("suffix").value;
        sex = document.getElementById("sex").value;
        birthday = birthdateRef.current?.value;
        contactNo = document.getElementById("contactNum").value;
        emailAd = document.getElementById("email").value;
        address = document.getElementById("address").value;
        certificateType = document.getElementById("certType").value;
        purpose = document.getElementById("reqPurpose").value;
        NumberofCopies = document.getElementById("copyAmount").value;
        DateRequested = new Date().toLocaleDateString("en-CA");
    }
}
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

                        <input type="text" id="lname" name="lname" placeholder="LAST NAME" className="reqFormInput" />
                        <input type="text" id="fname" name="fname" placeholder="FIRST NAME" className="reqFormInput" />
                        <input type="text" id="mname" name="mname" placeholder="MIDDLE NAME" className="reqFormInput" />

                        <select id="suffix" name="suffix" className="reqFormSelect">
                            <option value="" disabled selected>SUFFIX</option>
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

                        <select id="sex" name="sex" className="reqFormSelect">
                            <option value="" disabled selected>SEX</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <BirthdatePicker ref={birthdateRef}/>
                        <input type="number" id="contactNum" name="contactNum" placeholder="CONTACT NO." className="reqFormNum" onKeyUp={validatorNum} />
                        <input type="email" id="email" name="email" placeholder="EMAIL ADDRESS" className="reqFormEmail" onKeyUp={validatorEmail}/>
                        <div className="validators"><p  id="phoneNumP"className="phoneNumP">*Invalid PhoneNo.</p><p  id="emailP"className="emailP">*Invalid Email</p></div>
                        <input type="text" id="address" name="address" placeholder="ADDRESS" className="reqFormAddress" />
                    </div>

                    <div className="reqFormCert">
                        <h1 className="reqFormCertTitle">CERTIFICATE DETAILS</h1>

                        <select id="certType" name="certType" className="reqFormCertSelect">
                            <option value="" disabled selected>TYPE OF CERTIFICATE</option>
                            <option value="IDApp">Barangay ID Application</option>
                        </select>

                        <input type="text" id="reqPurpose" name="reqPurpose" placeholder="PURPOSE OF REQUEST" className="reqFormInput" />

                        <input type="number" id="copyAmount" className="reqFormCopyAmount" name="copyAmount" min="1" placeholder="Number of Copies"></input>

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



function validatorNum(){
    const phoneRegex =/^[0-9]{10}$/;
    if(document.getElementById("contactNum").value =="")
    {
        document.getElementById("phoneNumP").style.visibility = "hidden";
    }
    else if(!phoneRegex.test(document.getElementById("contactNum").value))
    {
        document.getElementById("phoneNumP").style.visibility = "visible";
    }
    else{
        document.getElementById("phoneNumP").style.visibility = "hidden";
    }
}
function validatorEmail(){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(document.getElementById("email").value =="")
        {
            document.getElementById("emailP").style.visibility = "hidden";
        }
        else if(!emailRegex.test(document.getElementById("email").value))
        {
            document.getElementById("emailP").style.visibility = "visible";
        }
        else{
            document.getElementById("emailP").style.visibility = "hidden";
        }
}
