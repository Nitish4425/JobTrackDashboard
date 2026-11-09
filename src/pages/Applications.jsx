import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  logoutUser
} from "../firebase/auth";

import {
  getApplications,
  deleteApplication
} from "../firebase/firestore";

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filters
  const [sortOrder, setSortOrder] = useState("latest");
  const [dateFilter, setDateFilter] = useState("All");

  // =========================
  // LOAD APPLICATIONS
  // =========================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          navigate("/login", {
            replace: true
          });
          return;
        }

        try {
          const data = await getApplications();

          setApplications(data);
        } catch (error) {
          console.error(
            "Error loading applications:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =========================
  // DELETE APPLICATION
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    try {
      await deleteApplication(id);

      setApplications((prev) =>
        prev.filter(
          (application) =>
            application.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete failed:",
        error
      );

      alert(
        "Failed to delete application."
      );
    }
  };

  // =========================
  // FILTER + SORT
  // =========================

  const filteredApplications =
    applications
      .filter((application) => {
        const company =
          application.company?.toLowerCase() || "";

        const role =
          application.role?.toLowerCase() || "";

        const search =
          searchTerm.toLowerCase();

        // Search
        const matchesSearch =
          company.includes(search) ||
          role.includes(search);

        // Status
        const matchesStatus =
          statusFilter === "All" ||
          application.status === statusFilter;

        // Date
        let matchesDate = true;

        if (
          dateFilter === "7" ||
          dateFilter === "30"
        ) {
          if (!application.applicationDate) {
            matchesDate = false;
          } else {
            const applicationDate = new Date(
              `${application.applicationDate}T00:00:00`
            );

            const today = new Date();

            today.setHours(
              0,
              0,
              0,
              0
            );

            const days =
              dateFilter === "7"
                ? 7
                : 30;

            const startDate = new Date(today);

            startDate.setDate(
              today.getDate() - days
            );

            matchesDate =
              applicationDate >= startDate &&
              applicationDate <= today;
          }
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          `${a.applicationDate || "1970-01-01"}T00:00:00`
        );

        const dateB = new Date(
          `${b.applicationDate || "1970-01-01"}T00:00:00`
        );

        if (sortOrder === "latest") {
          return dateB - dateA;
        }

        return dateA - dateB;
      });

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await logoutUser();

      navigate("/login", {
        replace: true
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      alert(
        "Failed to logout. Please try again."
      );
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

          <a className="active">
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

          <a
            onClick={() =>
              navigate("/settings")
            }
          >
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
              Applications 💼
            </h1>

            <p>
              Manage and track all your
              job applications.
            </p>

          </div>

          <button
            className="add-btn"
            onClick={() =>
              navigate("/add-application")
            }
          >
            + Add Application
          </button>

        </header>

        {/* =========================
            APPLICATIONS CARD
        ========================= */}

        <section className="content-card">

          <div className="section-header">

            <div>

              <h2>
                All Applications
              </h2>

              <p>
                {filteredApplications.length}{" "}
                application
                {filteredApplications.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

          </div>

          {/* =========================
              FILTERS
          ========================= */}

          <div className="filters">

            {/* Search */}

            <input
              type="text"
              placeholder="🔍 Search company or role..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="All">
                All Status
              </option>

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

            {/* Sort */}

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value)
              }
            >

              <option value="latest">
                Latest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

            </select>

            {/* Date Filter */}

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
            >

              <option value="All">
                All Time
              </option>

              <option value="7">
                Last 7 Days
              </option>

              <option value="30">
                Last 30 Days
              </option>

            </select>

          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading && (
            <div className="empty-state">

              <p>
                Loading applications...
              </p>

            </div>
          )}

          {/* =========================
              NO APPLICATIONS
          ========================= */}

          {!loading &&
            filteredApplications.length === 0 && (

              <div className="empty-state">

                <div className="empty-icon">
                  📂
                </div>

                <h3>
                  No applications found
                </h3>

                <p>
                  Try changing your filters or add a new application.
                </p>

                <button
                  className="add-btn"
                  onClick={() =>
                    navigate("/add-application")
                  }
                >
                  + Add Application
                </button>

              </div>
            )}

          {/* =========================
              APPLICATION TABLE
          ========================= */}

          {!loading &&
            filteredApplications.length > 0 && (

              <div className="table-wrapper">

                <div className="table">

                  {/* Table Header */}

                  <div className="table-row table-heading">

                    <span>
                      Company
                    </span>

                    <span>
                      Position
                    </span>

                    <span>
                      Location
                    </span>

                    <span>
                      Salary / CTC
                    </span>

                    <span>
                      Date
                    </span>

                    <span>
                      Status
                    </span>

                    <span>
                      Actions
                    </span>

                  </div>

                  {/* Table Data */}

                  {filteredApplications.map(
                    (application) => (

                      <div
                        className="table-row"
                        key={application.id}
                      >

                        <span className="company-name">
                          {application.company}
                        </span>

                        <span>
                          {application.role}
                        </span>

                        <span>
                          {application.location || "-"}
                        </span>

                        <span>
                          {application.salary
                            ? `₹ ${application.salary}`
                            : "-"}
                        </span>

                        <span>
                          {application.applicationDate}
                        </span>

                        <span>

                          <span
                            className={`status ${
                              application.status
                                ?.toLowerCase()
                                .replace(" ", "-")
                            }`}
                          >
                            {application.status}
                          </span>

                        </span>

                        {/* Actions */}

                        <div className="actions">

                          <button
                            className="edit-btn"
                            onClick={() =>
                              navigate(
                                `/edit-application/${application.id}`
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(application.id)
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default Applications;