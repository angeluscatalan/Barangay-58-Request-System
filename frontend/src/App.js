import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home.js';
import ReqPage from "./pages/reqPage.js";
import TeamPage from "./pages/teamPage.js";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Request" element={<ReqPage />} />
                <Route path="/Team" element={<TeamPage />} />
            </Routes>
        </Router>

        
    );

    
}

export default App;
