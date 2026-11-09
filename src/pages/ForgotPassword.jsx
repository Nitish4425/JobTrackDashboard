import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { resetPassword } from "../firebase/auth";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await resetPassword(email);

      setMessage("Password reset link has been sent to your email.");
    } catch (error) {
      console.error("Password reset error:", error);

      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card forgot-card">
        {/* Logo */}

        <div className="forgot-logo">
          JobTrack<span>Pro</span>
        </div>

        {/* Icon */}

        <div className="forgot-icon">🔐</div>

        <h2>Forgot Password?</h2>

        <p className="forgot-description">
          No worries! Enter your registered email and we'll send you a secure
          password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="reset-btn">
            📧 Send Reset Link
          </button>
        </form>

        {message && <div className="reset-success">✅ {message}</div>}

        {error && <div className="reset-error">❌ {error}</div>}

        <div className="back-login-wrapper">
          <span className="back-login-link" onClick={() => navigate("/login")}>
            ← Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
