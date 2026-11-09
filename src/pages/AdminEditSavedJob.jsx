import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminUserData,
  updateAdminSavedJob
} from "../firebase/firestore";

function AdminEditSavedJob() {
  const navigate = useNavigate();
  const { userId, jobId } = useParams();

  const [loading, setLoading] = useState(true);
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
  // LOAD SAVED JOB
  // =====================================================

  useEffect(() => {
    const loadSavedJob = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUserData(userId);

        const job = data.savedJobs.find(
          (item) => item.id === jobId
        );

        if (!job) {
          setError("Saved job not found.");
          return;
        }

        setFormData({
          company: job.company || "",
          role: job.role || "",
          location: job.location || "",
          salary: job.salary || job.ctc || ""
        });

      } catch (error) {
        console.error(
          "Error loading saved job:",
          error
        );

        setError(
          "Failed to load saved job."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSavedJob();
  }, [userId, jobId]);

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
  // SAVE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateAdminSavedJob(jobId, {
        company: formData.company,
        role: formData.role,
        location: formData.location,
        salary: formData.salary
      });

      setSuccess(
        "Saved job updated successfully."
      );

      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 1000);

    } catch (error) {
      console.error(
        "Update saved job error:",
        error
      );

      setError(
        "Failed to update saved job."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-user-loading">
        Loading saved job...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (
    error &&
    !formData.company &&
    !formData.role
  ) {
    return (
      <div className="admin-user-error">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={() =>
            navigate(`/admin/users/${userId}`)
          }
        >
          ← Back to User
        </button>

      </div>
    );
  }

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
            Edit Saved Job
          </h1>

          <p>
            Update saved job details
          </p>

        </div>

      </header>

      {/* CONTENT */}

      <main className="admin-edit-content">

        <form
          className="admin-edit-card"
          onSubmit={handleSubmit}
        >

          <div className="admin-edit-card-header">

            <div className="admin-edit-avatar">
              ⭐
            </div>

            <div>

              <h2>
                Saved Job Details
              </h2>

              <p>
                Update the saved job information below.
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
                placeholder="Enter salary or CTC"
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
                : "💾 Save Changes"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AdminEditSavedJob;