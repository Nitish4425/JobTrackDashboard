import { useState } from "react";

import {
  registerUser,
  logoutUser
} from "../firebase/auth";

import {
  createUserProfile
} from "../firebase/firestore";

import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // CREATE FIREBASE ACCOUNT

      const userCredential = await registerUser(
        email,
        password
      );

      const user = userCredential.user;

      // SAVE PROFILE IN FIRESTORE

      await createUserProfile(user.uid, {
        name,
        email: user.email || email,
        currentRole,
        location,
        bio
      });

      // =========================
      // SIGN OUT AFTER REGISTRATION
      // =========================

      await logoutUser();

      // SUCCESS MESSAGE

      setMessage("Account created successfully!");

      // CLEAR FORM

      setName("");
      setEmail("");
      setCurrentRole("");
      setLocation("");
      setBio("");
      setPassword("");
      setConfirmPassword("");

      setShowPassword(false);
      setShowConfirmPassword(false);

      // GO TO LOGIN

      setTimeout(() => {
        navigate("/login", {
          replace: true
        });
      }, 1000);

    } catch (error) {
      console.error("Register error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>JobTrack Pro</h1>

        <h2>Create Account</h2>

        <p>
          Create your profile and start tracking your job applications.
        </p>

        <form onSubmit={handleRegister}>

          {/* NAME */}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          {/* CURRENT ROLE */}

          <input
            type="text"
            placeholder="Current Role"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            required
            disabled={loading}
          />

          {/* LOCATION */}

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={loading}
          />

          {/* BIO */}

          <textarea
            placeholder="Write a short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            required
            disabled={loading}
          />

          {/* PASSWORD */}

          <div className="password-input-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="password-input-wrapper">

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={loading}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>

          </div>

          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* LOGIN */}

          <p className="auth-switch">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>

        </form>

        {/* SUCCESS */}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {/* ERROR */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </div>

    </div>
  );
}

export default Register;