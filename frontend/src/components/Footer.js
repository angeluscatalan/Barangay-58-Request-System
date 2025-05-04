import "../styles/Footer.css"

import alabka from "../assets/alabka.png"
import bagongph from "../assets/bagongph.png"
import brgylogo from "../assets/brgylogo.png"
import City from "../assets/CityLogo.png"
import President from "../assets/PresidentLogo.png"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#da1c6f"
            fillOpacity="1"
            d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,165.3C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brgy">
            <div className="footer-logo-container">
              <img src={brgylogo || "/placeholder.svg"} alt="Barangay 58 Logo" className="footer-brgy-logo" />
              <h2>BARANGAY 58</h2>
            </div>
            <p>
              Serving the community with dedication and excellence. Together we build a better barangay for all
              residents.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/Team">Team</a>
                </li>
                <li>
                  <a href="/Events">Events</a>
                </li>
                <li>
                  <a href="/AboutUs">About Us</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Services</h3>
              <ul>
                <li>
                  <a href="/Request">Certificate Request</a>
                </li>
                <li>
                  <a href="/RBI">RBI Registration</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Contact</h3>
              <ul>
                <li>
                  <i className="fas fa-map-marker-alt"></i> 312B Taylo Street, Pasay City
                </li>
                <li>
                  <i className="fas fa-phone"></i> 0905xxxxxxx
                </li>
                <li>
                  <i className="fas fa-envelope"></i> baranggay58.pasay.city@gmail.com
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-logos">
          <div className="logo-item">
            <h4>Mission</h4>
            <img src={alabka || "/placeholder.svg"} alt="Alabka Logo" />
          </div>
          <div className="logo-item">
            <h4>Vision</h4>
            <img src={bagongph || "/placeholder.svg"} alt="Bagong Pilipinas Logo" />
          </div>
          <div className="logo-item logo-item-large">
            <h4>Barangay 58</h4>
            <img src={brgylogo || "/placeholder.svg"} alt="Barangay 58 Logo" />
          </div>
          <div className="logo-item">
            <h4>City</h4>
            <img src={City || "/placeholder.svg"} alt="Pasay City Logo" />
          </div>
          <div className="logo-item">
            <h4>National</h4>
            <img src={President || "/placeholder.svg"} alt="President's Logo" />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2023 Barangay 58. All rights reserved.</p>
        <p className="footer-note">Donated By: Adamson University Students</p>
      </div>
    </footer>
  )
}

export default Footer
