import React from "react";
import "../styles/Footer.css"; 

import alabka from "../assets/alabka.png";
import bagongph from "../assets/bagongph.png";
import brgylogo from "../assets/brgylogo.png";
import City from "../assets/CityLogo.png";
import President from "../assets/PresidentLogo.png";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Mission</h3>
          <img src={alabka} alt="Alabka Logo" className="footer-image" />
        </div>
        <div className="footer-section">
          <h3>Vision</h3>
          <img src={bagongph} alt="Bagong Pilipinas Logo" className="footer-image" />
        </div>
        <div className="footer-section">
          <h3 className="footer-title">
          <img src={brgylogo} alt="Barangay 58 Logo" className="brgy58-icon" />
            <span>BARANGAY 58</span>
            </h3>
          <img src={brgylogo} alt="Barangay 58 Logo" className="footer-image brgy58" />
        </div>
        <div className="footer-section">
          <h3>Contact Details</h3>
          <img src={City} alt="Pasay City Logo" className="footer-image" />
        </div>
        <div className="footer-section">
          <h3>Location</h3>
          <img src={President} alt="President's Logo" className="footer-image" />
        </div>
      </div>
      <hr className="footer-divider" />
      <p className="footer-note">Donated By: Adamson University Students</p>
    </footer>
  );
};

export default Footer;
