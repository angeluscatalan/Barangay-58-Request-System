import React, { useState, useEffect } from "react";
import brgyLogo from "../assets/brgyMenuLogo.png";
import kapMembers from "../assets/kapMembers.png";
import { Link } from "react-router-dom";
import "../styles/teamPage.css";

function TeamPage() {
    return(
        <div className="teamPage">
            <div className="teamPageBg"></div>

            <div className="indexHeader">

                <div className="indexLogoContainer">
                    <img src={brgyLogo} alt="Barangay Logo" className="indexLogo" />
                    <h1 className="indexTitle">BARANGAY 58</h1>
                </div>

                <nav className="indexNav">
                    <Link to="/">HOME</Link>
                    <Link to="/Team">TEAM</Link>
                    <div className="dropdown1">
                        <Link to="/Request">SERVICES</Link>
                    </div>
                    <div className="dropdown2">
                        <Link to="#">EVENTS</Link>
                    </div>
                    <Link to="#">ABOUT US</Link>
                </nav>

                <button className="loginBtn">Login</button>
            </div>

            <div className="teamHeader">
                <h1 className="teamTitle">Sangguniang Barangay</h1>
                <h2 className="teamSubtext">Leaders Committed to Community Service</h2>
                <p className="teamDesc">The Sangguniang Barangay is dedicated to governing and improving our community. 
                Through leadership, transparency, and service, we ensure the well-being and development of our barangay.</p>
            </div>

            <div className="teamImg">
                <img src={kapMembers} alt="Kapitan and Kagawads" className="kapMembers" />
            </div>
        </div>
    )
}

export default TeamPage;