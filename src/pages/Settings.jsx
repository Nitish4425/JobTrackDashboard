import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  changePassword,
  logoutUser,
  deleteCurrentUser
} from "../firebase/auth";

import {
  deleteUserData
} from "../firebase/firestore";

function Settings() {
  const navigate = useNavigate();

  // =========================
  // SETTINGS STATES
  // =========================

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [jobReminders, setJobReminders] = useState(
    localStorage.getItem("jobtrack-interview-reminders") !== "false"
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("jobtrack-theme") || "light"
  );

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

  // =========================
  // DELETE ACCOUNT STATES
  // =========================

  const [deletePassword, setDeletePassword] =
    useState("");

  const [showDeletePassword, setShowDeletePassword] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  // =========================
  // THEME
  // =========================

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    localStorage.setItem(
      "jobtrack-theme",
      theme
    );
  }, [theme]);

  // =========================
  // INTERVIEW REMINDERS
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "jobtrack-interview-reminders",
      jobReminders
    );
  }, [jobReminders]);

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      await changePassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(
        "Password changed successfully! 🔐"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

    } catch (error) {
      console.error(
        "Change password error:",
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
        "Logout failed:",
        error
      );
    }
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDeleteAccount = () => {
    setDeletePassword("");
    setDeleteError("");
    setShowDeletePassword(false);
    setShowDeleteModal(true);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const handleCancelDelete = () => {
    if (deleteLoading) {
      return;
    }

    setDeletePassword("");
    setDeleteError("");
    setShowDeletePassword(false);
    setShowDeleteModal(false);
  };

  // =========================
  // CONFIRM DELETE ACCOUNT
  // =========================

  const handleConfirmDelete = async () => {
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError(
        "Please enter your current password."
      );
      return;
    }

    try {
      setDeleteLoading(true);

      /*
       * IMPORTANT:
       * First re-authenticate the user.
       * This prevents Firestore data from being
       * deleted when the password is incorrect.
       */

      await deleteCurrentUser(
        deletePassword,
        false
      );

      /*
       * Delete all Firestore data
       */

      await deleteUserData();

      /*
       * Firebase Authentication account
       * was already authenticated above.
       */

      await deleteCurrentUser(
        deletePassword,
        true
      );

      /*
       * Clear local settings
       */

      localStorage.removeItem(
        "jobtrack-interview-reminders"
      );

      localStorage.removeItem(
        "jobtrack-theme"
      );

      alert(
        "Your account and all associated data have been deleted successfully."
      );

      navigate("/login");

    } catch (error) {
  console.error("Delete account error:", error);

  setDeleteError(
    `${error.code || "Unknown error"}: ${
      error.message || "Failed to delete account."
    }`
  );
} finally {
  setDeleteLoading(false);
}
  };

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="logo">
          JobTrack<span>Pro</span>
        </div>

        <nav className="sidebar-nav">

          <a
            onClick={() =>
              navigate("/dashboard")
            }
          >
            📊 Dashboard
          </a>

          <a
            onClick={() =>
              navigate("/applications")
            }
          >
            💼 Applications
          </a>

          <a
            onClick={() =>
              navigate("/interviews")
            }
          >
            📅 Interviews
          </a>

          <a
            onClick={() =>
              navigate("/saved-jobs")
            }
          >
            ⭐ Saved Jobs
          </a>

          <a
            onClick={() =>
              navigate("/profile")
            }
          >
            👤 Profile
          </a>

        </nav>

        <div className="sidebar-bottom">

          <a className="active">
            ⚙️ Settings
          </a>

          <a onClick={handleLogout}>
            🚪 Logout
          </a>

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">

        {/* HEADER */}

        <header className="header">

          <div>

            <h1>
              Settings ⚙️
            </h1>

            <p>
              Manage your JobTrackPro preferences.
            </p>

          </div>

        </header>

        {/* =========================
            SETTINGS CARD
        ========================= */}

        <section className="content-card settings-card">

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          <div className="settings-section">

            <h2>
              Notifications 🔔
            </h2>

            <p>
              Choose which notifications you want
              to receive.
            </p>

            {/* Email Notifications */}

            <div className="setting-item">

              <div>

                <h3>
                  Email Notifications
                </h3>

                <span>
                  Receive important updates by email.
                </span>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) =>
                    setEmailNotifications(
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            {/* Interview Reminders */}

            <div className="setting-item">

              <div>

                <h3>
                  Interview Reminders
                </h3>

                <span>
                  Get reminders about upcoming
                  interviews.
                </span>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={jobReminders}
                  onChange={(e) =>
                    setJobReminders(
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

          </div>


          {/* =========================
              APPEARANCE
          ========================= */}

          <div className="settings-section">

            <h2>
              Appearance 🎨
            </h2>

            <p>
              Customize how JobTrackPro looks.
            </p>

            <div className="setting-item">

              <div>

                <h3>
                  Theme
                </h3>

                <span>
                  Select your preferred theme.
                </span>

              </div>

              <select
                className="settings-select"
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value)
                }
              >

                <option value="light">
                  ☀️ Light
                </option>

                <option value="dark">
                  🌙 Dark
                </option>

              </select>

            </div>

          </div>


          {/* =========================
              CHANGE PASSWORD
          ========================= */}

          <div className="settings-section">

            <h2>
              Change Password 🔐
            </h2>

            <p>
              Update your account password securely.
            </p>

            <form
              className="change-password-form"
              onSubmit={handleChangePassword}
            >

              {/* Current Password */}

              <div className="password-field">

                <label>
                  Current Password
                </label>

                <div className="password-input-wrapper">

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
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    aria-label="Toggle current password"
                  >
                    {showCurrentPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>


              {/* New Password */}

              <div className="password-field">

                <label>
                  New Password
                </label>

                <div className="password-input-wrapper">

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
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    aria-label="Toggle new password"
                  >
                    {showNewPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>


              {/* Confirm Password */}

              <div className="password-field">

                <label>
                  Confirm New Password
                </label>

                <div className="password-input-wrapper">

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
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>


              {/* Change Password Button */}

              <button
                type="submit"
                className="change-password-btn"
              >
                🔐 Change Password
              </button>

            </form>


            {/* Success */}

            {passwordMessage && (

              <div className="password-success">
                ✅ {passwordMessage}
              </div>

            )}


            {/* Error */}

            {passwordError && (

              <div className="password-error">
                ❌ {passwordError}
              </div>

            )}

          </div>


          {/* =========================
              ACCOUNT
          ========================= */}

          <div className="settings-section">

            <h2>
              Account 👤
            </h2>

            <p>
              Manage your account information.
            </p>

            <div className="settings-actions">

              <button
                className="secondary-btn"
                onClick={() =>
                  navigate("/profile")
                }
              >
                👤 View Profile
              </button>

              <button
                className="delete-account-btn"
                onClick={handleDeleteAccount}
              >
                🗑️ Delete Account
              </button>

            </div>

          </div>

        </section>

      </main>


      {/* =========================
          DELETE ACCOUNT MODAL
      ========================= */}

      {showDeleteModal && (

        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <div className="delete-modal-icon">
              ⚠️
            </div>

            <h2>
              Delete Account?
            </h2>

            <p>
              This action cannot be undone.
              Your profile, applications, interviews
              and saved jobs will be permanently deleted.
            </p>

            <div className="delete-warning">
              ⚠️ All your JobTrackPro data will be permanently removed.
            </div>

            <label className="delete-password-label">
              Current Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showDeletePassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter current password"
                value={deletePassword}
                onChange={(e) =>
                  setDeletePassword(
                    e.target.value
                  )
                }
                disabled={deleteLoading}
                autoFocus
              />

              <button
                type="button"
                onClick={() =>
                  setShowDeletePassword(
                    !showDeletePassword
                  )
                }
                disabled={deleteLoading}
                aria-label="Toggle delete account password"
              >
                {showDeletePassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

            {deleteError && (

              <div className="delete-error">
                ❌ {deleteError}
              </div>

            )}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="cancel-delete-btn"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "🗑️ Delete Permanently"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;