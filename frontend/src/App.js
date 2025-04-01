import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home.js';
import ReqPage from "./pages/reqPage.js";
import TeamPage from "./pages/teamPage.js";
import Login from "./pages/Login.js";
import AboutUs from "./pages/aboutusPage.js";
import Navbar from "./components/Navbar.js";
import Events from "./pages/Events.js";
import Admin from "./pages/Admin.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="*" element={
                    <>
                        <Navbar />
                        <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Request" element={<ReqPage />} />
                <Route path="/Team" element={<TeamPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/Events" element={<Events />} />
                <Route 
                path="/admin" 
                element={
                    <ProtectedRoute>
                    <Admin />
                    </ProtectedRoute>
                } 
                />
                        </Routes>
                    </>
                } />
            </Routes>
        </Router>
    );
}

export default App;
