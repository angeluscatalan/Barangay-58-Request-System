import React, { useState, useEffect } from "react";
import backgroundImage from "./assets/indexBG.png";
import pinkGradient from "./assets/pinkGradient_1.png";
import "./styles/App.css";


function App() {
    return (

        <div className="App">
            <div className="indexBg">

            </div>

            <div className = "indexText">
                
                <div className="indexTitle">
                    <img src={pinkGradient} alt="Pink Gradient" className="indexImage" />
                    <h1 className="indexTitle1">
                    Fast & Easy Barangay Services!
                    </h1>
                </div>

            </div>
            
        </div>
        
    );
}

export default App;
