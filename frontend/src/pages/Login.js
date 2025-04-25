import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import brgyLoginPageLogo from "../assets/brgyLoginPageLogo.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Clear previous errors
        
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // If you're using token-based auth, store the token from the response
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                localStorage.setItem("access_level", data.user.access_level); 
                console.log("Login successful, navigating...");
                navigate("/admin");
            } else {
                // Handle different error cases
                if (response.status === 403) {
                    setErrorMessage(data.message || "Account disabled. Please contact the administrator.");
                } else {
                    setErrorMessage(data.message || "Invalid username or password");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Server error. Please try again later.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left-side">
                    <img src={brgyLoginPageLogo} alt="Barangay Logo" className="login-logo-large" />
                    <h1 className="login-logo-text">BARANGAY 58</h1>
                </div>
                <div className="login-right-side">
                    <div className="login-header">
                        <h1>Login</h1>
                        <h2>Welcome Back to Barangay 58 Portal</h2>
                    </div>
                    {/* Display error message if exists */}
                    {errorMessage && (
                        <div className="login-error-message">
                            {errorMessage}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div className="password-container">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <div className="forgot-password">
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>
                        </div>
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <button type="submit" className="login-submit-btn">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;