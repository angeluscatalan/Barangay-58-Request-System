import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home.js';
import ReqPage from "./pages/reqPage.js";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Request" element={<ReqPage />} />
            </Routes>
        </Router>

        
    );

    
}

export default App;
