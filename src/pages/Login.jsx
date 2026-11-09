import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginUser,
  logoutUser
} from "../firebase/auth";

import { db } from "../firebase/firestore";

import {
  doc,
  getDoc
} from "firebase/firestore";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      // =========================
      // FIREBASE LOGIN
      // =========================

      const userCredential = await loginUser(
        email,
        password
      );

      const user = userCredential.user;

      // =========================
      // GET USER PROFILE
      // =========================

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const userSnapshot = await getDoc(
        userRef
      );

      // =========================
      // PROFILE NOT FOUND
      // =========================

      if (!userSnapshot.exists()) {
        await logoutUser();

        setMessage(
          "User profile not found. Please contact support."
        );

        return;
      }

      const userData =
        userSnapshot.data();

      // =========================
      // CHECK ACCOUNT STATUS
      // =========================

      // Missing status = Active
      // Only explicit "inactive" is blocked

      if (userData.status === "inactive") {
        await logoutUser();

        setMessage(
          "Your account is inactive. Please contact admin."
        );

        return;
      }

      // =========================
      // CHECK USER ROLE
      // =========================

      if (userData.role === "admin") {
        setMessage(
          "Admin login successful! 👑"
        );

        setTimeout(() => {
          navigate("/admin");
        }, 500);

        return;
      }

      // =========================
      // NORMAL USER
      // =========================

      setMessage(
        "Login successful! ✅"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      // =========================
      // FIREBASE AUTH ERRORS
      // =========================

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        setMessage(
          "Invalid email or password."
        );
      } else if (
        error.code ===
        "auth/user-not-found"
      ) {
        setMessage(
          "Invalid email or password."
        );
      } else if (
        error.code ===
        "auth/wrong-password"
      ) {
        setMessage(
          "Invalid email or password."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setMessage(
          "Please enter a valid email address."
        );
      } else {
        setMessage(
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        {/* =========================
            TITLE
        ========================= */}

        <h1>
          JobTrack Pro
        </h1>

        <h2>
          Welcome Back 👋
        </h2>

        <p>
          Login to continue to JobTrack Pro.
        </p>


        {/* =========================
            LOGIN FORM
        ========================= */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            disabled={loading}
            required
          />


          {/* PASSWORD */}

          <div className="password-input-wrapper">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              disabled={loading}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              disabled={loading}
              aria-label="Toggle password"
            >
              {showPassword
                ? "🙈"
                : "👁️"}
            </button>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Checking..."
              : "Login"}
          </button>


          {/* FORGOT PASSWORD */}

          <p
            className="forgot-password"
            onClick={() =>
              navigate(
                "/forgot-password"
              )
            }
          >
            Forgot Password?
          </p>


          {/* REGISTER */}

          <p className="auth-switch">

            Don't have an account?{" "}

            <span
              onClick={() =>
                navigate("/register")
              }
            >
              Create Account
            </span>

          </p>

        </form>


        {/* =========================
            LOGIN MESSAGE
        ========================= */}

        {message && (

          <div
            className={
              message.includes("successful")
                ? "login-message success"
                : "login-message error"
            }
          >

            <span className="login-message-icon">

              {message.includes("successful")
                ? "✅"
                : "⚠️"}

            </span>

            <span>
              {message}
            </span>

          </div>

        )}

      </div>

    </div>
  );
}

export default Login;