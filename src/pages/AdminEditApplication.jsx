import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminUserData,
  updateApplication
} from "../firebase/firestore";

function AdminEditApplication() {
  const navigate = useNavigate();
  const { userId, applicationId } = useParams();

  const [loading, setLoading] = useState(true);
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
    jobType: "",
    notes: ""
  });

  // =====================================================
  // LOAD APPLICATION
  // =====================================================

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUserData(userId);

        const application = data.applications.find(
          (item) => item.id === applicationId
        );

        if (!application) {
          setError("Application not found.");
          return;
        }

        setFormData({
          company: application.company || "",
          role: application.role || "",
          location: application.location || "",
          salary: application.salary || "",
          status: application.status || "Applied",
          applicationDate:
            application.applicationDate || "",
          jobType: application.jobType || "",
          notes: application.notes || ""
        });

      } catch (error) {
        console.error(
          "Error loading application:",
          error
        );

        setError(
          "Failed to load application."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [userId, applicationId]);


  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };


  // =====================================================
  // SAVE APPLICATION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.company.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!formData.role.trim()) {
      setError("Job role is required.");
      return;
    }

    try {
      setSaving(true);

      await updateApplication(
        applicationId,
        {
          company: formData.company.trim(),
          role: formData.role.trim(),
          location: formData.location.trim(),
          salary: formData.salary.trim(),
          status: formData.status,
          applicationDate:
            formData.applicationDate,
          jobType: formData.jobType.trim(),
          notes: formData.notes.trim()
        }
      );

      setSuccess(
        "Application updated successfully! ✅"
      );

      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 1000);

    } catch (error) {
      console.error(
        "Error updating application:",
        error
      );

      setError(
        "Failed to update application."
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
        Loading application...
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
            Edit Application
          </h1>

          <p>
            Update this user's job application.
          </p>

        </div>

      </header>


      {/* CONTENT */}

      <main className="admin-edit-content">

        <section className="admin-edit-card">

          <div className="admin-edit-card-header">

            <div className="admin-edit-avatar">
              💼
            </div>

            <div>

              <h2>
                Application Details
              </h2>

              <p>
                Administrator can update application information.
              </p>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="admin-edit-error">
              ❌ {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="admin-edit-success">
              ✅ {success}
            </div>
          )}


          {/* FORM */}

          <form onSubmit={handleSubmit}>

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
                />

              </div>


              {/* ROLE */}

              <div className="admin-edit-field">

                <label>
                  Job Role
                </label>

                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
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
                  placeholder="e.g. Noida"
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
                  placeholder="e.g. ₹6 LPA"
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

                <input
                  type="text"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  placeholder="e.g. Full Time"
                />

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
                  placeholder="Enter application notes..."
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

        </section>

      </main>

    </div>
  );
}

export default AdminEditApplication;