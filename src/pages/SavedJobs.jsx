import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth, logoutUser } from "../firebase/auth";

import { getSavedJobs, deleteSavedJob } from "../firebase/firestore";

function SavedJobs() {
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const data = await getSavedJobs();

        // Latest saved job first
        const sortedJobs = [...data].sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;

          const dateB = b.createdAt?.seconds || 0;

          return dateB - dateA;
        });

        setSavedJobs(sortedJobs);
      } catch (error) {
        console.error("Error loading saved jobs:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Remove this job from saved jobs?");

    if (!confirmDelete) return;

    try {
      await deleteSavedJob(id);

      setSavedJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Error deleting saved job:", error);

      alert("Failed to remove saved job.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredJobs = savedJobs.filter((job) => {
    const search = searchTerm.toLowerCase();

    return (
      job.company?.toLowerCase().includes(search) ||
      job.role?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <div className="logo">
          JobTrack<span>Pro</span>
        </div>

        <nav className="sidebar-nav">
          <a onClick={() => navigate("/dashboard")}>📊 Dashboard</a>

          <a onClick={() => navigate("/applications")}>💼 Applications</a>

          <a onClick={() => navigate("/interviews")}>📅 Interviews</a>

          <a className="active">⭐ Saved Jobs</a>

          <a onClick={() => navigate("/profile")}>👤 Profile</a>
        </nav>

        <div className="sidebar-bottom">
          <a onClick={() => navigate("/settings")}>⚙️ Settings</a>

          <a onClick={handleLogout}>🚪 Logout</a>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">
        {/* Header */}

        <header className="header">
          <div>
            <h1>Saved Jobs ⭐</h1>

            <p>Keep track of jobs you want to apply for later.</p>
          </div>

          <button
            className="add-btn"
            onClick={() => navigate("/add-saved-job")}
          >
            + Save Job
          </button>
        </header>

        {/* ================= SAVED JOBS ================= */}

        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Your Saved Jobs</h2>

              <p>
                {filteredJobs.length} job
                {filteredJobs.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {/* ================= SEARCH ================= */}

          {!loading && savedJobs.length > 0 && (
            <div className="saved-jobs-search">
              <input
                type="text"
                placeholder="🔍 Search by company, role or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Loading */}

          {loading && (
            <div className="empty-state">
              <p>Loading saved jobs...</p>
            </div>
          )}

          {/* Empty State */}

          {!loading && savedJobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>

              <h3>No saved jobs yet</h3>

              <p>Save interesting jobs here so you can apply later.</p>

              <button
                className="add-btn"
                onClick={() => navigate("/add-saved-job")}
              >
                + Save Your First Job
              </button>
            </div>
          )}

          {/* No Search Result */}

          {!loading && savedJobs.length > 0 && filteredJobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>

              <h3>No jobs found</h3>

              <p>Try searching with another company, role or location.</p>
            </div>
          )}

          {/* Saved Jobs List */}

          {!loading && filteredJobs.length > 0 && (
            <div className="saved-jobs-list">
              {filteredJobs.map((job) => (
                <div className="saved-job-card" key={job.id}>
                  {/* Job Icon */}

                  <div className="saved-job-icon">💼</div>

                  {/* Job Information */}

                  <div className="saved-job-info">
                    <h3>{job.company}</h3>

                    <p className="saved-job-role">{job.role}</p>

                    <div className="saved-job-details">
                      <span>📍 {job.location || "-"}</span>

                      <span>💰 {job.salary ? `₹ ${job.salary}` : "-"}</span>
                    </div>

                    {/* Description */}

                    {job.description && (
                      <p className="saved-job-description">{job.description}</p>
                    )}
                  </div>

                  {/* Actions */}

                  <div className="saved-job-actions">
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-job-btn"
                      >
                        🔗 View Job
                      </a>
                    )}
                    <button
                      className="apply-job-btn"
                      onClick={() =>
                        navigate("/add-application", {
                          state: {
                            savedJob: job,
                          },
                        })
                      }
                    >
                      🚀 Apply Now
                    </button>
                    <button
                      className="saved-edit-btn"
                      onClick={() => navigate(`/edit-saved-job/${job.id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(job.id)}
                    >
                      🗑️ Remove
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

export default SavedJobs;
