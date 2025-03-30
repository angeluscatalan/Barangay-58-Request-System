import React from "react";
import pinkGradient from '../assets/pinkGradient_1.png';
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    return (
        <div className="App">
                <img src={pinkGradient} alt="Pink Gradient" className="indexImage" />

                <div className="indexText">
                    <h1 className="indexTitle1">TEST Fast & Easy Barangay Services!</h1>
                    <p className="indexSubtext1">
                        Request certificates online. Stay updated. Save time!
                    </p>
                    <p className="indexSubtext2">
                        No more long lines and unnecessary trips to the barangay hall! Our online system allows you to request barangay certificates with ease and stay informed about important announcements and events.
                        Simply submit your request online, get notified when it's ready, and pick it up hassle-free. Join us in modernizing our barangay services—start your request today!
                    </p>

                    <button className="indexRequestBtn">
                        <Link to="/Request">Click here to Request a Certificate</Link>
                    </button>
                </div>
        </div>
    );
}

export default Home;