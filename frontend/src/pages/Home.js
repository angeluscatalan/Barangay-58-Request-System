import { Link } from "react-router-dom"
import brgyLogo from "../assets/brgylogo.png"
import "../styles/Home.css"

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-text">
          <h1 className="home-title">Fast & Easy Barangay Services!</h1>
          <p className="home-subtitle">Request certificates online. Stay updated. Save time!</p>
          <p className="home-description">
            No more long lines and unnecessary trips to the barangay hall! Our online system allows you to request
            barangay certificates with ease and stay informed about important announcements and events. Simply submit
            your request online, get notified when it's ready, and pick it up hassle-free. Join us in modernizing our
            barangay services—start your request today!
          </p>

          <Link to="/Request" className="request-button">
            Click here to Request a Certificate
          </Link>
        </div>

        <div className="logo-container">
          <img src={brgyLogo || "/placeholder.svg"} alt="Barangay 58 Logo" className="home-logo" />
        </div>
      </div>
    </div>
  )
}

export default Home

