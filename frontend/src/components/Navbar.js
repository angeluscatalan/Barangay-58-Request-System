import React from "react";
import { Link, useLocation } from "react-router-dom";
import brgyLogo from "../assets/brgyMenuLogo.png";
import "../styles/Navbar.css";

function Navbar() {
    const location = useLocation();

    return (
        <div className="indexHeader">
            <div className="indexLogoContainer">
                <img src={brgyLogo} alt="Barangay Logo" className="indexLogo" />
                <h1 className="indexTitle">BARANGAY 58</h1>
            </div>

            <nav className="indexNav">
                <Link to="/" className={location.pathname === "/" ? "active" : ""}>HOME</Link>
                <Link to="/Team" className={location.pathname === "/Team" ? "active" : ""}>TEAM</Link>
                <Link to="/Request" className={location.pathname === "/Request" ? "active" : ""}>SERVICES</Link>
                <Link to="#" className={location.pathname === "/Events" ? "active" : ""}>EVENTS</Link>
                <Link to="/AboutUs" className={location.pathname === "/About" ? "active" : ""}>ABOUT US</Link>
            </nav>

            <Link to="/login" className="loginBtn">Login</Link>
        </div>
    );
}

export default Navbar;
