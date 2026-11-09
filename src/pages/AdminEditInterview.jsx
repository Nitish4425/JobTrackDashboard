import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminUserData,
  updateInterview
} from "../firebase/firestore";

function AdminEditInterview() {
  const navigate = useNavigate();
  const { userId, interviewId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    interviewDate: "",
    interviewTime: "",
    mode: "Online",
    status: "Upcoming",
    notes: ""
  });

  // =====================================================
  // LOAD INTERVIEW
  // =====================================================

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUserData(userId);

        const interview = data.interviews.find(
          (item) => item.id === interviewId
        );

        if (!interview) {
          setError("Interview not found.");
          return;
        }

        setFormData({
          company: interview.company || "",
          role: interview.role || "",
          interviewDate: interview.interviewDate || "",
          interviewTime: interview.interviewTime || "",
          mode: interview.mode || "Online",
          status: interview.status || "Upcoming",
          notes: interview.notes || ""
        });

      } catch (error) {
        console.error("Error loading interview:", error);
        setError("Failed to load interview.");
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [userId, interviewId]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =====================================================
  // SAVE INTERVIEW
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateInterview(interviewId, {
        company: formData.company,
        role: formData.role,
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        mode: formData.mode,
        status: formData.status,
        notes: formData.notes
      });

      setSuccess("Interview updated successfully.");

      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 1000);

    } catch (error) {
      console.error("Update interview error:", error);
      setError("Failed to update interview.");
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
        Loading interview...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !formData.company && !formData.role) {
    return (
      <div className="admin-user-error">
        <h2>Something went wrong</h2>

        <p>{error}</p>

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
            Edit Interview
          </h1>

          <p>
            Update interview details
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
              📅
            </div>

            <div>
              <h2>
                Interview Details
              </h2>

              <p>
                Update the interview information below.
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

          {/* FORM GRID */}

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

            {/* DATE */}

            <div className="admin-edit-field">
              <label>
                Interview Date
              </label>

              <input
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* TIME */}

            <div className="admin-edit-field">
              <label>
                Interview Time
              </label>

              <input
                type="time"
                name="interviewTime"
                value={formData.interviewTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* MODE */}

            <div className="admin-edit-field">
              <label>
                Mode
              </label>

              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
              >
                <option value="Online">
                  Online
                </option>

                <option value="Offline">
                  Offline
                </option>

                <option value="Phone">
                  Phone
                </option>
              </select>
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
                <option value="Upcoming">
                  Upcoming
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
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
                placeholder="Enter interview notes..."
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
                : "💾 Save Changes"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AdminEditInterview;