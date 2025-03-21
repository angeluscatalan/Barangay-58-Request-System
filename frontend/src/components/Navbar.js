import React from "react";
import { Link } from "react-router-dom";
import brgyLogo from "../assets/brgyMenuLogo.png";
import "../styles/Navbar.css";

function Navbar() {
    return (
        <div className="indexHeader">
            <div className="indexLogoContainer">
                <img src={brgyLogo} alt="Barangay Logo" className="indexLogo" />
                <h1 className="indexTitle">BARANGAY 58</h1>
            </div>

            <nav className="indexNav">
                <Link to="/">HOME</Link>
                <Link to="/Team">TEAM</Link>
                <Link to="/Request">SERVICES</Link>
                <Link to="#">EVENTS</Link>
                <Link to="#">ABOUT US</Link>
            </nav>

            <Link to="/login" className="loginBtn">Login</Link>
        </div>
    );
}

export default Navbar; 