import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { auth, logoutUser } from "../firebase/auth";

import {
  getApplications,
  deleteApplication,
  getInterviews
} from "../firebase/firestore";

function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setLoading(false);
          navigate("/login");
          return;
        }

        try {
          const applicationData = await getApplications();
          setApplications(applicationData);

          const interviewData = await getInterviews();
          setInterviews(interviewData);
        } catch (error) {
          console.error(
            "Error loading dashboard data:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    try {
      await deleteApplication(id);

      setApplications((prevApplications) =>
        prevApplications.filter(
          (application) => application.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting application:",
        error
      );

      alert("Failed to delete application.");
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
  // APPLICATION STATS
  // =========================

  const totalApplications = applications.length;

  const applied = applications.filter(
    (application) =>
      application.status === "Applied"
  ).length;

  const shortlisted = applications.filter(
    (application) =>
      application.status === "Shortlisted"
  ).length;

  const interviewApplications = applications.filter(
    (application) =>
      application.status === "Interview"
  ).length;

  const selected = applications.filter(
    (application) =>
      application.status === "Selected"
  ).length;

  const rejected = applications.filter(
    (application) =>
      application.status === "Rejected"
  ).length;

  // =========================
  // INTERVIEW STATS
  // =========================

  const upcomingInterviews = interviews.filter(
    (interview) =>
      (interview.status || "Upcoming") ===
      "Upcoming"
  ).length;

  const completedInterviews = interviews.filter(
    (interview) =>
      interview.status === "Completed"
  ).length;

  const cancelledInterviews = interviews.filter(
    (interview) =>
      interview.status === "Cancelled"
  ).length;

  // =========================
  // UPCOMING INTERVIEWS
  // =========================

  const upcomingInterviewList = interviews
    .filter(
      (interview) =>
        (interview.status || "Upcoming") ===
        "Upcoming"
    )
    .sort((a, b) => {
      const dateA = new Date(
        `${a.interviewDate}T${a.interviewTime || "00:00"}`
      );

      const dateB = new Date(
        `${b.interviewDate}T${b.interviewTime || "00:00"}`
      );

      return dateA - dateB;
    })
    .slice(0, 5);

  // =========================
  // APPLICATION FILTER
  // =========================

  const filteredApplications =
    applications.filter((application) => {
      const company =
        application.company?.toLowerCase() || "";

      const role =
        application.role?.toLowerCase() || "";

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        company.includes(search) ||
        role.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // =========================
  // CHART DATA
  // =========================

  const chartData = [
    {
      name: "Applied",
      count: applied
    },
    {
      name: "Shortlisted",
      count: shortlisted
    },
    {
      name: "Interview",
      count: interviewApplications
    },
    {
      name: "Selected",
      count: selected
    },
    {
      name: "Rejected",
      count: rejected
    }
  ];

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="logo">
          JobTrack<span>Pro</span>
        </div>

        <nav className="sidebar-nav">

          <a
            className="active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            📊 Dashboard
          </a>

          <a
            onClick={() =>
              navigate("/applications")
            }
          >
            💼 Applications
          </a>

          <a
            onClick={() =>
              navigate("/interviews")
            }
          >
            📅 Interviews
          </a>

          <a onClick={() => navigate("/saved-jobs")}>
            ⭐ Saved Jobs
          </a>

          <a onClick={() => navigate("/profile")} >
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

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* ================= HEADER ================= */}

        <header className="header">

          <div>

            <h1>
              Good Morning, Nitish 👋
            </h1>

            <p>
              Here's what's happening with
              your job applications.
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

        {/* ================= STATS ================= */}

        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon blue">
              📨
            </div>

            <div>
              <p>Total Applications</p>
              <h2>{totalApplications}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              📤
            </div>

            <div>
              <p>Applied</p>
              <h2>{applied}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              🎯
            </div>

            <div>
              <p>Shortlisted</p>
              <h2>{shortlisted}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              📅
            </div>

            <div>
              <p>Interviews</p>
              <h2>{interviewApplications}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              🏆
            </div>

            <div>
              <p>Selected</p>
              <h2>{selected}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              ❌
            </div>

            <div>
              <p>Rejected</p>
              <h2>{rejected}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              📅
            </div>

            <div>
              <p>Upcoming Interviews</p>
              <h2>{upcomingInterviews}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ✅
            </div>

            <div>
              <p>Completed Interviews</p>
              <h2>{completedInterviews}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              🚫
            </div>

            <div>
              <p>Cancelled Interviews</p>
              <h2>{cancelledInterviews}</h2>
            </div>
          </div>

        </section>

        {/* ================= ANALYTICS ================= */}

        <section className="content-card chart-card">

          <div className="section-header">

            <div>
              <h2>Application Analytics</h2>

              <p>
                Track your application status
              </p>
            </div>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={240}
            >

              <BarChart data={chartData}>

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  barSize={42}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>

        {/* ================= UPCOMING INTERVIEWS ================= */}

        <section className="content-card">

          <div className="section-header">

            <div>

              <h2>
                Upcoming Interviews 📅
              </h2>

              <p>
                Your next scheduled interviews
              </p>

            </div>

            <button
              className="view-btn"
              onClick={() =>
                navigate("/interviews")
              }
            >
              View All
            </button>

          </div>

          {!loading &&
            upcomingInterviewList.length === 0 && (

              <div className="empty-state">

                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  No upcoming interviews
                </h3>

                <p>
                  Schedule an interview to
                  see it here.
                </p>

                <button
                  className="add-btn"
                  onClick={() =>
                    navigate("/add-interview")
                  }
                >
                  + Add Interview
                </button>

              </div>

            )}

          {loading && (

            <div className="empty-state">
              <p>
                Loading interviews...
              </p>
            </div>

          )}

          {!loading &&
            upcomingInterviewList.length > 0 && (

              <div className="upcoming-interviews">

                {upcomingInterviewList.map(
                  (interview) => (

                    <div
                      className="upcoming-interview-card"
                      key={interview.id}
                    >

                      <div className="upcoming-date">

                        <span>
                          📅
                        </span>

                      </div>

                      <div className="upcoming-info">

                        <h3>
                          {interview.company}
                        </h3>

                        <p>
                          {interview.role}
                        </p>

                        <div className="upcoming-details">

                          <span>
                            📅{" "}
                            {interview.interviewDate}
                          </span>

                          <span>
                            ⏰{" "}
                            {interview.interviewTime}
                          </span>

                          <span>
                            💻{" "}
                            {interview.mode}
                          </span>

                        </div>

                      </div>

                      <div className="upcoming-actions">

                        <span className="status upcoming">
                          Upcoming
                        </span>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(
                              `/edit-interview/${interview.id}`
                            )
                          }
                        >
                          ✏️
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </section>

        {/* ================= RECENT APPLICATIONS ================= */}

        <section className="content-card">

          <div className="section-header">

            <div>

              <h2>
                Recent Applications
              </h2>

              <p>
                Track your latest job applications
              </p>

            </div>

            <button
              className="view-btn"
              onClick={() =>
                navigate("/applications")
              }
            >
              View All
            </button>

          </div>

          <div className="filters">

            <input
              type="text"
              placeholder="🔍 Search company or role..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

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

          </div>

          {loading && (

            <div className="empty-state">
              <p>
                Loading applications...
              </p>
            </div>

          )}

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
                  Try changing your search
                  or add a new application.
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

          {!loading &&
            filteredApplications.length > 0 && (

              <div className="table-wrapper">

                <div className="table">

                  <div className="table-row table-heading">

                    <span>Company</span>
                    <span>Position</span>
                    <span>Location</span>
                    <span>Salary / CTC</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span>Actions</span>

                  </div>

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
                          {application.location ||
                            "-"}
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
                            className={`status ${application.status
                              ?.toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >
                            {application.status}
                          </span>

                        </span>

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
                              handleDelete(
                                application.id
                              )
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

export default Dashboard;