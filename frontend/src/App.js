import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home.js';
import ReqPage from "./pages/reqPage.js";
import TeamPage from "./pages/teamPage.js";
import Login from "./pages/Login.js";
import Navbar from "./components/Navbar.js";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Request" element={<ReqPage />} />
                <Route path="/Team" element={<TeamPage />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
