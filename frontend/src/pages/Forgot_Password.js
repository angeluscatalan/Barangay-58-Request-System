import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ForgotPassword.css";
import brgyLoginPageLogo from "../assets/brgyLoginPageLogo.png";

function Forgot_Password() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1 = email input, 2 = code verification, 3 = new password
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      if (response.data.success) {
        setStep(2); // Move to code verification step
      } else {
        setError(response.data.message || "Email not found");
      }
    } catch (err) {
      setError("Failed to send verification code");
      console.error(err);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-code", {
        email,
        code: verificationCode
      });
      if (response.data.success) {
        localStorage.setItem('resetToken', response.data.tempToken);
        setStep(3);
      } else {
        setError("Invalid verification code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      console.error(err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        tempToken: localStorage.getItem('resetToken'), // Store this after verify-code
        newPassword,
        confirmPassword
      });
      if (response.data.success) {
        alert("Password reset successfully!");
        localStorage.removeItem('resetToken');
        navigate("/");
      } else {
        setError(response.data.message || "Password reset failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
      console.error(err);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="forgot-password-left-side">
          <img src={brgyLoginPageLogo} alt="Barangay Logo" className="forgot-password-logo" />
          <h1 className="forgot-password-logo-text">BARANGAY 58</h1>
        </div>
        <div className="forgot-password-right-side">
          <div className="forgot-password-header">
            <h1>Forgot Password</h1>
            {step === 1 && <h2>Enter your email to reset your password</h2>}
            {step === 2 && <h2>Enter the verification code sent to your email</h2>}
            {step === 3 && <h2>Enter your new password</h2>}
          </div>

          {error && <div className="error-message">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <button type="submit" className="forgot-password-submit-btn">
                Send Reset Code
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <button type="submit" className="forgot-password-submit-btn">
                Verify Code
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button type="submit" className="forgot-password-submit-btn">
                Reset Password
              </button>
            </form>
          )}

          <div className="back-to-login">
            <Link to="/">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forgot_Password;