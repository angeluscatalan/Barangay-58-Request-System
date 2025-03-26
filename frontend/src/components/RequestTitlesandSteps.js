import React from "react";
import "../styles/reqPage.css";
import step1 from "../assets/step1.png";
import step2 from "../assets/step2.png";
import step3 from "../assets/step3.png";
import step4 from "../assets/step4.png";
function RequestTitlesandSteps() {
    
    return (
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
    );
}

export default RequestTitlesandSteps;