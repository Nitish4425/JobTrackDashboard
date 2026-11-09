import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth, logoutUser } from "../firebase/auth";
import {
  getUserProfile,
  updateUserProfile
} from "../firebase/firestore";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        try {
          setUser(currentUser);

          const profileData = await getUserProfile();

          setProfile(profileData);

          if (profileData) {
            setName(profileData.name || "");
            setCurrentRole(profileData.currentRole || "");
            setLocation(profileData.location || "");
            setBio(profileData.bio || "");
          }

        } catch (error) {
          console.error("Profile loading failed:", error);
          setError("Unable to load profile.");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);


  // =========================
  // EDIT PROFILE
  // =========================

  const handleEdit = () => {
    setMessage("");
    setError("");
    setIsEditing(true);
  };


  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    setName(profile?.name || "");
    setCurrentRole(profile?.currentRole || "");
    setLocation(profile?.location || "");
    setBio(profile?.bio || "");

    setMessage("");
    setError("");
    setIsEditing(false);
  };


  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!currentRole.trim()) {
      setError("Current role is required.");
      return;
    }

    if (!location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!bio.trim()) {
      setError("Bio is required.");
      return;
    }

    try {
      setSaving(true);

      await updateUserProfile({
        name: name.trim(),
        currentRole: currentRole.trim(),
        location: location.trim(),
        bio: bio.trim()
      });

      // Update local profile
      setProfile((prev) => ({
        ...prev,
        name: name.trim(),
        currentRole: currentRole.trim(),
        location: location.trim(),
        bio: bio.trim()
      }));

      setMessage("Profile updated successfully! ✅");
      setIsEditing(false);

    } catch (error) {
      console.error("Profile update failed:", error);
      setError("Unable to update profile.");
    } finally {
      setSaving(false);
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
      console.error("Logout failed:", error);
    }
  };


  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading profile...</p>
      </div>
    );
  }


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

          <a onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </a>

          <a onClick={() => navigate("/applications")}>
            💼 Applications
          </a>

          <a onClick={() => navigate("/interviews")}>
            📅 Interviews
          </a>

          <a onClick={() => navigate("/saved-jobs")}>
            ⭐ Saved Jobs
          </a>

          <a className="active">
            👤 Profile
          </a>

        </nav>

        <div className="sidebar-bottom">

          <a onClick={() => navigate("/settings")}>
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

        <header className="header">

          <div>

            <h1>My Profile 👤</h1>

            <p>
              Manage your JobTrackPro profile.
            </p>

          </div>

        </header>


        <section className="content-card profile-card">

          {/* =========================
              PROFILE HEADER
          ========================= */}

          <div className="profile-header">

            <div className="profile-avatar">

              {profile?.name
                ? profile.name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase()}

            </div>

            <div>

              <h2>
                {profile?.name || "User"}
              </h2>

              <p>
                {profile?.currentRole || "Job Seeker"}
              </p>

            </div>

          </div>


          {/* =========================
              MESSAGES
          ========================= */}

          {message && (
            <p className="profile-success">
              {message}
            </p>
          )}

          {error && (
            <p className="profile-error">
              {error}
            </p>
          )}


          {/* =========================
              EDIT MODE
          ========================= */}

          {isEditing ? (

            <form
              className="profile-edit-form"
              onSubmit={handleSave}
            >

              {/* Name */}

              <div className="profile-form-group">

                <label>👤 Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                />

              </div>


              {/* Email */}

              <div className="profile-form-group">

                <label>📧 Email</label>

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                />

                <small>
                  Email cannot be changed here.
                </small>

              </div>


              {/* Current Role */}

              <div className="profile-form-group">

                <label>💼 Current Role</label>

                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) =>
                    setCurrentRole(e.target.value)
                  }
                  placeholder="e.g. Frontend Developer"
                />

              </div>


              {/* Location */}

              <div className="profile-form-group">

                <label>📍 Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="e.g. Greater Noida"
                />

              </div>


              {/* Bio */}

              <div className="profile-form-group">

                <label>📝 Bio</label>

                <textarea
                  rows="5"
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  placeholder="Write something about yourself..."
                />

              </div>


              {/* Buttons */}

              <div className="profile-edit-actions">

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "💾 Save Changes"}
                </button>

              </div>

            </form>

          ) : (

            /* =========================
               VIEW MODE
            ========================= */

            <>

              <div className="profile-details">

                <div className="profile-item">

                  <span>👤 Name</span>

                  <strong>
                    {profile?.name || "-"}
                  </strong>

                </div>


                <div className="profile-item">

                  <span>📧 Email</span>

                  <strong>
                    {profile?.email || user?.email || "-"}
                  </strong>

                </div>


                <div className="profile-item">

                  <span>💼 Current Role</span>

                  <strong>
                    {profile?.currentRole || "-"}
                  </strong>

                </div>


                <div className="profile-item">

                  <span>📍 Location</span>

                  <strong>
                    {profile?.location || "-"}
                  </strong>

                </div>


                <div className="profile-item profile-bio">

                  <span>📝 Bio</span>

                  <strong>
                    {profile?.bio || "-"}
                  </strong>

                </div>


                <div className="profile-item">

                  <span>📅 Account Created</span>

                  <strong>
                    {user?.metadata?.creationTime
                      ? new Date(
                          user.metadata.creationTime
                        ).toLocaleDateString()
                      : "-"}
                  </strong>

                </div>

              </div>


              <button
                className="edit-profile-btn"
                onClick={handleEdit}
              >
                ✏️ Edit Profile
              </button>

            </>

          )}

        </section>

      </main>

    </div>
  );
}

export default Profile;