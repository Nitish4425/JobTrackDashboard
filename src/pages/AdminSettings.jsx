import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  changePassword,
  logoutUser,
  auth
} from "../firebase/auth";

function AdminSettings() {
  const navigate = useNavigate();

  // =========================
  // PASSWORD STATES
  // =========================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  // =========================
  // ADMIN EMAIL
  // =========================

  const adminEmail =
    auth.currentUser?.email || "Administrator";

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    // Current password
    if (!currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    // New password length
    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    // Confirm password
    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    // Same password check
    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(
        "Password changed successfully! 🔐"
      );

      // Clear inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error(
        "Admin change password error:",
        error
      );

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setPasswordError(
          "Current password is incorrect."
        );
      } else if (
        error.code === "auth/weak-password"
      ) {
        setPasswordError(
          "New password is too weak."
        );
      } else if (
        error.code === "auth/requires-recent-login"
      ) {
        setPasswordError(
          "Please log in again before changing your password."
        );
      } else {
        setPasswordError(
          "Failed to change password. Please try again."
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await logoutUser();

      navigate("/login");
    } catch (error) {
      console.error(
        "Admin logout failed:",
        error
      );
    }
  };

  return (
    <div className="admin-app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          JobTrack<span>Pro</span>
        </div>

        <div className="admin-badge">
          👑 Admin Panel
        </div>

        <nav className="admin-nav">

          <a
            onClick={() =>
              navigate("/admin")
            }
          >
            👥 Users
          </a>

          <a
            className="admin-nav-active"
            onClick={() =>
              navigate("/admin/settings")
            }
          >
            ⚙️ Settings
          </a>

        </nav>

        <div className="admin-sidebar-bottom">

          <a onClick={handleLogout}>
            🚪 Logout
          </a>

        </div>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <h1>
              Admin Settings ⚙️
            </h1>

            <p>
              Manage your administrator account settings.
            </p>

          </div>

          <div className="admin-header-info">

            <span>
              👤 Administrator
            </span>

          </div>

        </header>


        {/* =========================
            CONTENT
        ========================= */}

        <section className="admin-settings-content">

          {/* =========================
              ADMIN ACCOUNT
          ========================= */}

          <div className="admin-settings-card">

            <div className="admin-settings-section">

              <h2>
                Administrator Account 👤
              </h2>

              <p>
                Your admin account information.
              </p>


              <div className="admin-account-info">

                <div className="admin-account-avatar">
                  👑
                </div>

                <div>

                  <h3>
                    Administrator
                  </h3>

                  <span>
                    {adminEmail}
                  </span>

                </div>

              </div>

            </div>


            {/* =========================
                CHANGE PASSWORD
            ========================= */}

            <div className="admin-settings-section">

              <h2>
                Change Password 🔐
              </h2>

              <p>
                Update your administrator password securely.
              </p>


              <form
                className="admin-password-form"
                onSubmit={handleChangePassword}
              >

                {/* CURRENT PASSWORD */}

                <div className="admin-password-field">

                  <label>
                    Current Password
                  </label>

                  <div className="admin-password-input-wrapper">

                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      disabled={passwordLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                      disabled={passwordLoading}
                      aria-label="Toggle current password"
                    >
                      {showCurrentPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                </div>


                {/* NEW PASSWORD */}

                <div className="admin-password-field">

                  <label>
                    New Password
                  </label>

                  <div className="admin-password-input-wrapper">

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      disabled={passwordLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                      disabled={passwordLoading}
                      aria-label="Toggle new password"
                    >
                      {showNewPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="admin-password-field">

                  <label>
                    Confirm New Password
                  </label>

                  <div className="admin-password-input-wrapper">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      disabled={passwordLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      disabled={passwordLoading}
                      aria-label="Toggle confirm password"
                    >
                      {showConfirmPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                </div>


                {/* CHANGE PASSWORD BUTTON */}

                <button
                  type="submit"
                  className="admin-change-password-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? "Updating..."
                    : "🔐 Change Password"}
                </button>

              </form>


              {/* SUCCESS */}

              {passwordMessage && (

                <div className="admin-password-success">
                  ✅ {passwordMessage}
                </div>

              )}


              {/* ERROR */}

              {passwordError && (

                <div className="admin-password-error">
                  ❌ {passwordError}
                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminSettings;