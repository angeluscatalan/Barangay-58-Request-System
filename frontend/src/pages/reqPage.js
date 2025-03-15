import React, { useState, useEffect } from "react";
import brgyLogo from "../assets/brgyMenuLogo.png";
import step1 from "../assets/step1.png";
import step2 from "../assets/step2.png";
import step3 from "../assets/step3.png";
import step4 from "../assets/step4.png";
import { Link } from "react-router-dom";
import "../styles/reqPage.css";

function reqPage(){
    return(
        <div className="req">

            <div className="reqBg">
                <div className="topGradient">

                </div>
                <div className="bottomleftGradient">
                </div>
                <div className="bottomrightGradient">
                </div>
            </div>

            <div className="indexHeader">
                            <div className="indexLogoContainer">
                                <img src={brgyLogo} alt="Barangay Logo" className="indexLogo" />
                                <h1 className="indexTitle">BARANGAY 58</h1>
                            </div>
            
                            <nav className="indexNav">
                                <Link to="/">HOME</Link>
                                <Link to="#">TEAM</Link>
                                <div className="dropdown">
                                    <Link to="/Request">SERVICES</Link>
                                </div>
                                <div className="dropdown">
                                    <Link to="#">EVENTS</Link>
                                </div>
                                <Link to="#">ABOUT US</Link>
                            </nav>
            
                            <button className="loginBtn">Login</button>
                        </div>

                <div className="reqText">
                    <h1 className="reqTitle">Skip the Lines—Request Online!</h1>
                    <h2 className="reqSubtext">No need to visit the barangay hall until your document is ready—save time and effort!</h2>

                    <div className="reqContainer">
                        
                    </div>

                    <div className="reqSteps">
                            <div className="reqStep1">
                                <img src={step1} alt="step1" className="step1"/>
                                <h1 className="stepsInfo"><strong>Fill Out the Form</strong> – Provide your details and select the type of certificate.</h1>
                            </div>

                            <div className="reqStep2">
                                <img src={step2} alt="step2" className="step2"/>
                                <h1 className="stepsInfo"><strong>Submit Your Request</strong> – Click "Submit" and wait for confirmation.</h1>
                            </div>

                            <div className="reqStep3">
                                <img src={step3} alt="step3" className="step3"/>
                                <h1 className="stepsInfo"><strong>Get Notified</strong> – We’ll inform you when your certificate is ready.</h1>
                            </div>

                            <div className="reqStep4">
                                <img src={step4} alt="step4" className="step4"/>
                                <h1 className="stepsInfo"><strong>Pick It Up</strong> – Visit the barangay hall to claim your document.</h1>
                            </div>

                            <h1 className="reqNote"><strong>Note:</strong> Avoid submitting multiple requests for the same certificate to prevent delays. 
                            If you need to check your request status, please wait for the notification or contact the barangay office.</h1>
                    </div>
                </div>
                
                <div className="reqContainer2">

                </div>

                <div className="reqFillUp">
                    <h1 className="fillUpTitle">Complete the Form to Request your Certificate.</h1>

                    <div className="lastName">
                        <input type="text" placeholder="LAST NAME" required value="" />
                    </div>
                </div>

                
        </div> 
    );
    
}

export default reqPage;