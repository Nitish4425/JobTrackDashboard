import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addAdminSavedJob } from "../firebase/firestore";

function AdminAddSavedJob() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: ""
  });

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await addAdminSavedJob(userId, {
        company: formData.company,
        role: formData.role,
        location: formData.location,
        salary: formData.salary
      });

      setSuccess("Saved job added successfully.");

      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 1000);

    } catch (error) {
      console.error(
        "Admin add saved job error:",
        error
      );

      setError(
        "Failed to add saved job. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-edit-page">

      {/* HEADER */}

      <header className="admin-edit-header">

        <div>

          <button
            className="admin-back-btn"
            onClick={() =>
              navigate(`/admin/users/${userId}`)
            }
          >
            ← Back to User
          </button>

          <h1>
            Add Saved Job
          </h1>

          <p>
            Add a new saved job for this user
          </p>

        </div>

      </header>

      {/* CONTENT */}

      <main className="admin-edit-content">

        <form
          className="admin-edit-card"
          onSubmit={handleSubmit}
        >

          {/* CARD HEADER */}

          <div className="admin-edit-card-header">

            <div className="admin-edit-avatar">
              ⭐
            </div>

            <div>

              <h2>
                Saved Job Details
              </h2>

              <p>
                Enter the saved job information below.
              </p>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="admin-edit-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="admin-edit-success">
              {success}
            </div>
          )}

          {/* FORM */}

          <div className="admin-edit-grid">

            {/* COMPANY */}

            <div className="admin-edit-field">

              <label>
                Company
              </label>

              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />

            </div>

            {/* ROLE */}

            <div className="admin-edit-field">

              <label>
                Role
              </label>

              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter job role"
                required
              />

            </div>

            {/* LOCATION */}

            <div className="admin-edit-field">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
              />

            </div>

            {/* SALARY */}

            <div className="admin-edit-field">

              <label>
                Salary / CTC
              </label>

              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 6-8 LPA"
              />

            </div>

          </div>

          {/* ACTIONS */}

          <div className="admin-edit-actions">

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() =>
                navigate(`/admin/users/${userId}`)
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "💾 Add Saved Job"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AdminAddSavedJob;