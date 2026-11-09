import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminUserData,
  deleteApplication,
  deleteInterview,
  deleteSavedJob
} from "../firebase/firestore";

function AdminUserDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USER DATA
  // =====================================================

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUserData(userId);

        setUserData(data.user);
        setApplications(data.applications);
        setInterviews(data.interviews);
        setSavedJobs(data.savedJobs);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  // =====================================================
  // EDIT APPLICATION
  // =====================================================

  const handleEditApplication = (applicationId) => {
    navigate(
      `/admin/users/${userId}/applications/${applicationId}/edit`
    );
  };

  // =====================================================
  // DELETE APPLICATION
  // =====================================================

  const handleDeleteApplication = async (applicationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteApplication(applicationId);

      const data = await getAdminUserData(userId);

      setUserData(data.user);
      setApplications(data.applications);
      setInterviews(data.interviews);
      setSavedJobs(data.savedJobs);

      alert("Application deleted successfully.");
    } catch (error) {
      console.error("Delete application error:", error);
      alert("Failed to delete application.");
    }
  };

  // =====================================================
  // EDIT INTERVIEW
  // =====================================================

  const handleEditInterview = (interviewId) => {
    navigate(
      `/admin/users/${userId}/interviews/${interviewId}/edit`
    );
  };

  // =====================================================
  // DELETE INTERVIEW
  // =====================================================

  const handleDeleteInterview = async (interviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteInterview(interviewId);

      const data = await getAdminUserData(userId);

      setUserData(data.user);
      setApplications(data.applications);
      setInterviews(data.interviews);
      setSavedJobs(data.savedJobs);

      alert("Interview deleted successfully.");
    } catch (error) {
      console.error("Delete interview error:", error);
      alert("Failed to delete interview.");
    }
  };

  // =====================================================
  // EDIT SAVED JOB
  // =====================================================

  const handleEditSavedJob = (jobId) => {
    navigate(
      `/admin/users/${userId}/saved-jobs/${jobId}/edit`
    );
  };

  // =====================================================
  // DELETE SAVED JOB
  // =====================================================

  const handleDeleteSavedJob = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this saved job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteSavedJob(jobId);

      const data = await getAdminUserData(userId);

      setUserData(data.user);
      setApplications(data.applications);
      setInterviews(data.interviews);
      setSavedJobs(data.savedJobs);

      alert("Saved job deleted successfully.");
    } catch (error) {
      console.error("Delete saved job error:", error);
      alert("Failed to delete saved job.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-user-loading">
        Loading user details...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="admin-user-error">
        <h2>Something went wrong</h2>

        <p>{error}</p>

        <button onClick={() => navigate("/admin")}>
          ← Back to Users
        </button>
      </div>
    );
  }

  // =====================================================
  // USER NOT FOUND
  // =====================================================

  if (!userData) {
    return (
      <div className="admin-user-error">
        <h2>User not found</h2>

        <button onClick={() => navigate("/admin")}>
          ← Back to Users
        </button>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-user-page">

      {/* HEADER */}

      <header className="admin-user-header">
        <div>

          <button
            className="admin-back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back to Users
          </button>

          <h1>
            {userData.name || "User"}'s Profile
          </h1>

          <p>
            View complete JobTrackPro data
          </p>

        </div>
      </header>

      {/* MAIN CONTENT */}

      <main className="admin-user-content">

        {/* PROFILE */}

        <section className="admin-profile-card">

          <div className="admin-profile-top">

            <div className="admin-large-avatar">
              {userData.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="admin-profile-info">

              <h2>
                {userData.name || "Unnamed User"}
              </h2>

              <p>
                {userData.email || "No email"}
              </p>

              <span className="admin-profile-role">
                {userData.currentRole ||
                  "Role not specified"}
              </span>

            </div>

            <button
              className="admin-edit-profile-btn"
              onClick={() =>
                navigate(
                  `/admin/users/${userId}/edit`
                )
              }
            >
              ✏️ Edit Profile
            </button>

          </div>

          <div className="admin-profile-details">

            <div>
              <span>Location</span>

              <strong>
                {userData.location ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>Email</span>

              <strong>
                {userData.email ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>Current Role</span>

              <strong>
                {userData.currentRole ||
                  "Not specified"}
              </strong>
            </div>

          </div>

          {userData.bio && (
            <div className="admin-profile-bio">

              <span>Bio</span>

              <p>
                {userData.bio}
              </p>

            </div>
          )}

        </section>

        {/* STATS */}

        <section className="admin-user-stats">

          <div className="admin-user-stat">
            <span>Applications</span>

            <strong>
              {applications.length}
            </strong>
          </div>

          <div className="admin-user-stat">
            <span>Interviews</span>

            <strong>
              {interviews.length}
            </strong>
          </div>

          <div className="admin-user-stat">
            <span>Saved Jobs</span>

            <strong>
              {savedJobs.length}
            </strong>
          </div>

        </section>

        {/* =================================================
            APPLICATIONS
        ================================================= */}

        <section className="admin-data-card">

          <div className="admin-data-header">

            <div>
              <h2>💼 Applications</h2>

              <p>
                Jobs applied by this user
              </p>
            </div>

            <div className="admin-header-actions">

              <button
                className="admin-add-btn"
                onClick={() =>
                  navigate(
                    `/admin/users/${userId}/applications/add`
                  )
                }
              >
                + Add Application
              </button>

              <span>
                {applications.length}
              </span>

            </div>

          </div>

          {applications.length === 0 ? (

            <div className="admin-no-data">
              No applications found.
            </div>

          ) : (

            <div className="admin-data-list">

              {applications.map((application) => (

                <div
                  className="admin-data-row"
                  key={application.id}
                >

                  <div>

                    <strong>
                      {application.company ||
                        "Company"}
                    </strong>

                    <span>
                      {application.role ||
                        "Role not specified"}
                    </span>

                  </div>

                  <div>

                    <span>Status</span>

                    <strong>
                      {application.status ||
                        "Applied"}
                    </strong>

                  </div>

                  <div>

                    <span>Location</span>

                    <strong>
                      {application.location ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div className="admin-data-actions">

                    <button
                      className="admin-action-edit"
                      onClick={() =>
                        handleEditApplication(
                          application.id
                        )
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="admin-action-delete"
                      onClick={() =>
                        handleDeleteApplication(
                          application.id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* =================================================
            INTERVIEWS
        ================================================= */}

        <section className="admin-data-card">

          <div className="admin-data-header">

            <div>

              <h2>📅 Interviews</h2>

              <p>
                Interview schedule of this user
              </p>

            </div>

            <div className="admin-header-actions">

              <button
                className="admin-add-btn"
                onClick={() =>
                  navigate(
                    `/admin/users/${userId}/interviews/add`
                  )
                }
              >
                + Add Interview
              </button>

              <span>
                {interviews.length}
              </span>

            </div>

          </div>

          {interviews.length === 0 ? (

            <div className="admin-no-data">
              No interviews found.
            </div>

          ) : (

            <div className="admin-data-list">

              {interviews.map((interview) => (

                <div
                  className="admin-data-row"
                  key={interview.id}
                >

                  <div>

                    <strong>
                      {interview.company ||
                        "Company"}
                    </strong>

                    <span>
                      {interview.role ||
                        "Role not specified"}
                    </span>

                  </div>

                  <div>

                    <span>Date</span>

                    <strong>
                      {interview.interviewDate ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div>

                    <span>Time</span>

                    <strong>
                      {interview.interviewTime ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div>

                    <span>Status</span>

                    <strong>
                      {interview.status ||
                        "Upcoming"}
                    </strong>

                  </div>

                  <div className="admin-data-actions">

                    <button
                      className="admin-action-edit"
                      onClick={() =>
                        handleEditInterview(
                          interview.id
                        )
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="admin-action-delete"
                      onClick={() =>
                        handleDeleteInterview(
                          interview.id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* =================================================
            SAVED JOBS
        ================================================= */}

        <section className="admin-data-card">

          <div className="admin-data-header">

            <div>

              <h2>⭐ Saved Jobs</h2>

              <p>
                Jobs saved by this user
              </p>

            </div>

            <div className="admin-header-actions">

              <button
                className="admin-add-btn"
                onClick={() =>
                  navigate(
                    `/admin/users/${userId}/saved-jobs/add`
                  )
                }
              >
                + Add Saved Job
              </button>

              <span>
                {savedJobs.length}
              </span>

            </div>

          </div>

          {savedJobs.length === 0 ? (

            <div className="admin-no-data">
              No saved jobs found.
            </div>

          ) : (

            <div className="admin-data-list">

              {savedJobs.map((job) => (

                <div
                  className="admin-data-row"
                  key={job.id}
                >

                  <div>

                    <strong>
                      {job.company ||
                        "Company"}
                    </strong>

                    <span>
                      {job.role ||
                        "Role not specified"}
                    </span>

                  </div>

                  <div>

                    <span>Location</span>

                    <strong>
                      {job.location ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div>

                    <span>Salary</span>

                    <strong>
                      {job.salary ||
                        job.ctc ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div className="admin-data-actions">

                    <button
                      className="admin-action-edit"
                      onClick={() =>
                        handleEditSavedJob(
                          job.id
                        )
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="admin-action-delete"
                      onClick={() =>
                        handleDeleteSavedJob(
                          job.id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminUserDetails;