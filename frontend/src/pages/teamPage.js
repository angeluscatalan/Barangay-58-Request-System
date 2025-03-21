import React from "react";
import kapMembers from "../assets/kapMembers.png";
import "../styles/teamPage.css";
import Navbar from "../components/Navbar";

function TeamPage() {
    return (
        <div className="teamPage">
            <div className="teamPageBg"></div>
            <Navbar />
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
    );
}

export default TeamPage;