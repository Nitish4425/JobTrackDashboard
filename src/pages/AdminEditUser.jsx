import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminUserData,
  updateAdminUserProfile
} from "../firebase/firestore";

function AdminEditUser() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentRole: "",
    location: "",
    bio: ""
  });

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUserData(userId);

        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          currentRole: data.user.currentRole || "",
          location: data.user.location || "",
          bio: data.user.bio || ""
        });
      } catch (error) {
        console.error("Error loading user:", error);
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  // =====================================================
  // HANDLE INPUT
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
  // SAVE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);

      await updateAdminUserProfile(userId, {
        name: formData.name.trim(),
        currentRole: formData.currentRole.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim()
      });

      setSuccess("User profile updated successfully! ✅");

      setTimeout(() => {
        navigate(`/admin/users/${userId}`);
      }, 1000);

    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user profile.");
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
        Loading profile...
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
            ← Back to Profile
          </button>

          <h1>
            Edit User Profile
          </h1>

          <p>
            Update the user's JobTrackPro profile information.
          </p>

        </div>

      </header>


      {/* CONTENT */}

      <main className="admin-edit-content">

        <section className="admin-edit-card">

          <div className="admin-edit-card-header">

            <div className="admin-edit-avatar">
              {formData.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div>

              <h2>
                {formData.name || "User"}
              </h2>

              <p>
                Administrator can update profile details
              </p>

            </div>

          </div>


          {/* MESSAGES */}

          {error && (
            <div className="admin-edit-error">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="admin-edit-success">
              ✅ {success}
            </div>
          )}


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            <div className="admin-edit-grid">

              {/* NAME */}

              <div className="admin-edit-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />

              </div>


              {/* EMAIL */}

              <div className="admin-edit-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  disabled
                />

                <small>
                  Email cannot be changed from Admin Panel.
                </small>

              </div>


              {/* CURRENT ROLE */}

              <div className="admin-edit-field">

                <label>
                  Current Role
                </label>

                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
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
                  placeholder="e.g. Noida, Uttar Pradesh"
                />

              </div>


              {/* BIO */}

              <div className="admin-edit-field admin-edit-full">

                <label>
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Enter user bio..."
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

export default AdminEditUser;