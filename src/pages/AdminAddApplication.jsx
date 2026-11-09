import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addAdminApplication } from "../firebase/firestore";

function AdminAddApplication() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    status: "Applied",
    applicationDate: "",
    jobType: "Full Time",
    notes: ""
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

      await addAdminApplication(userId, {
        company: formData.company,
        role: formData.role,
        location: formData.location,
        salary: formData.salary,
        status: formData.status,
        applicationDate: formData.applicationDate,
        jobType: formData.jobType,
        notes: formData.notes
      });

      setSuccess("Application added successfully.");

      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 1000);

    } catch (error) {
      console.error(
        "Admin add application error:",
        error
      );

      setError(
        "Failed to add application. Please try again."
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
            Add Application
          </h1>

          <p>
            Add a new job application for this user
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
              💼
            </div>

            <div>

              <h2>
                Application Details
              </h2>

              <p>
                Enter the job application information below.
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

            {/* STATUS */}

            <div className="admin-edit-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Applied">
                  Applied
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Selected">
                  Selected
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>

            </div>

            {/* APPLICATION DATE */}

            <div className="admin-edit-field">

              <label>
                Application Date
              </label>

              <input
                type="date"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleChange}
              />

            </div>

            {/* JOB TYPE */}

            <div className="admin-edit-field">

              <label>
                Job Type
              </label>

              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Remote">
                  Remote
                </option>
              </select>

            </div>

            {/* NOTES */}

            <div className="admin-edit-field admin-edit-full">

              <label>
                Notes
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add notes about this application..."
                rows="5"
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
                : "💾 Add Application"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AdminAddApplication;