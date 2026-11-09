import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth, logoutUser } from "../firebase/auth";

import {
  getInterviews,
  deleteInterview
} from "../firebase/firestore";

// =========================
// INTERVIEW REMINDER
// =========================

const getInterviewReminder = (date, time) => {
  if (!date || !time) return null;

  const interviewDateTime = new Date(`${date}T${time}`);
  const now = new Date();

  if (isNaN(interviewDateTime.getTime())) {
    return null;
  }

  const difference = interviewDateTime - now;

  if (difference <= 0) {
    return null;
  }

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return (
      `🔔 Interview in ${minutes} minute` +
      (minutes !== 1 ? "s" : "")
    );
  }

  if (days === 0) {
    return `🔔 Interview today at ${time}`;
  }

  if (days === 1) {
    return `🔔 Interview tomorrow at ${time}`;
  }

  return `🔔 Interview in ${days} days`;
};


// =========================
// CALENDAR HELPERS
// =========================

const getCalendarDays = (year, month) => {
  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const previousMonthDays = new Date(
    year,
    month,
    0
  ).getDate();

  const days = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: previousMonthDays - i,
      currentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      currentMonth: true
    });
  }

  // Next month days
  let nextDay = 1;

  while (days.length % 7 !== 0) {
    days.push({
      date: nextDay,
      currentMonth: false
    });

    nextDay++;
  }

  return days;
};


const getDateKey = (year, month, day) => {
  const monthNumber = String(
    month + 1
  ).padStart(2, "0");

  const dayNumber = String(day).padStart(
    2,
    "0"
  );

  return `${year}-${monthNumber}-${dayNumber}`;
};


function Interviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] =
    useState("All");

  // List / Calendar
  const [viewMode, setViewMode] =
    useState("list");

  // Calendar month
  const [currentDate, setCurrentDate] =
    useState(new Date());

  // =========================
  // LOAD INTERVIEWS
  // =========================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          navigate("/login");
          return;
        }

        try {
          const data = await getInterviews();

          setInterviews(data);
        } catch (error) {
          console.error(
            "Error loading interviews:",
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
  // DELETE INTERVIEW
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmDelete) return;

    try {
      await deleteInterview(id);

      setInterviews((prevInterviews) =>
        prevInterviews.filter(
          (interview) =>
            interview.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting interview:",
        error
      );

      alert(
        "Failed to delete interview."
      );
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
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  // =========================
  // FILTER INTERVIEWS
  // =========================

  const filteredInterviews =
    interviews.filter((interview) => {
      const status =
        interview.status || "Upcoming";

      return (
        statusFilter === "All" ||
        status === statusFilter
      );
    });

  // =========================
  // CALENDAR
  // =========================

  const calendarYear =
    currentDate.getFullYear();

  const calendarMonth =
    currentDate.getMonth();

  const calendarDays = getCalendarDays(
    calendarYear,
    calendarMonth
  );

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long"
      }
    );

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(
        calendarYear,
        calendarMonth - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(
        calendarYear,
        calendarMonth + 1,
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getInterviewsForDate = (
    year,
    month,
    day
  ) => {
    const dateKey = getDateKey(
      year,
      month,
      day
    );

    return filteredInterviews.filter(
      (interview) =>
        interview.interviewDate ===
        dateKey
    );
  };

  const isToday = (day) => {
    const today = new Date();

    return (
      today.getFullYear() ===
        calendarYear &&
      today.getMonth() ===
        calendarMonth &&
      today.getDate() === day
    );
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

          <a
            onClick={() =>
              navigate("/applications")
            }
          >
            💼 Applications
          </a>

          <a className="active">
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

        <header className="header">

          <div>

            <h1>
              Interviews 📅
            </h1>

            <p>
              Manage your upcoming and
              completed interviews.
            </p>

          </div>

          <button
            className="add-btn"
            onClick={() =>
              navigate("/add-interview")
            }
          >
            + Add Interview
          </button>

        </header>

        {/* =========================
            INTERVIEW CARD
        ========================= */}

        <section className="content-card">

          <div className="section-header">

            <div>

              <h2>
                Your Interviews
              </h2>

              <p>
                {filteredInterviews.length}{" "}
                interview
                {filteredInterviews.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

          </div>

          {/* =========================
              FILTER + VIEW
          ========================= */}

          <div className="interview-toolbar">

            <div className="filters">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Interviews
                </option>

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

            <div className="view-toggle">

              <button
                type="button"
                className={
                  viewMode === "list"
                    ? "view-toggle-btn active"
                    : "view-toggle-btn"
                }
                onClick={() =>
                  setViewMode("list")
                }
              >
                📋 List View
              </button>

              <button
                type="button"
                className={
                  viewMode === "calendar"
                    ? "view-toggle-btn active"
                    : "view-toggle-btn"
                }
                onClick={() =>
                  setViewMode("calendar")
                }
              >
                📅 Calendar View
              </button>

            </div>

          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading && (

            <div className="empty-state">

              <p>
                Loading interviews...
              </p>

            </div>

          )}

          {/* =========================
              EMPTY
          ========================= */}

          {!loading &&
            filteredInterviews.length ===
              0 && (

              <div className="empty-state">

                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  No interviews found
                </h3>

                <p>
                  Add an interview to start
                  tracking your schedule.
                </p>

                <button
                  className="add-btn"
                  onClick={() =>
                    navigate(
                      "/add-interview"
                    )
                  }
                >
                  + Add Interview
                </button>

              </div>

            )}

          {/* =========================
              LIST VIEW
          ========================= */}

          {!loading &&
            filteredInterviews.length > 0 &&
            viewMode === "list" && (

              <div className="interview-list">

                {filteredInterviews.map(
                  (interview) => {

                    const status =
                      interview.status ||
                      "Upcoming";

                    const remindersEnabled =
                      localStorage.getItem(
                        "jobtrack-interview-reminders"
                      ) !== "false";

                    const reminder =
                      status === "Upcoming" &&
                      remindersEnabled
                        ? getInterviewReminder(
                            interview.interviewDate,
                            interview.interviewTime
                          )
                        : null;

                    return (

                      <div
                        className="interview-card"
                        key={interview.id}
                      >

                        <div className="interview-icon">
                          📅
                        </div>

                        <div className="interview-info">

                          <h3>
                            {interview.company}
                          </h3>

                          <p className="interview-role">
                            {interview.role}
                          </p>

                          <div className="interview-details">

                            <span>
                              📅{" "}
                              {
                                interview.interviewDate
                              }
                            </span>

                            <span>
                              ⏰{" "}
                              {
                                interview.interviewTime
                              }
                            </span>

                            <span>
                              💻{" "}
                              {interview.mode}
                            </span>

                            <span
                              className={`status interview-${status
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )}`}
                            >
                              {status}
                            </span>

                          </div>

                          {reminder && (

                            <div className="interview-reminder">
                              {reminder}
                            </div>

                          )}

                          {interview.notes && (

                            <p className="interview-notes">
                              📝{" "}
                              {interview.notes}
                            </p>

                          )}

                          <div className="actions">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                navigate(
                                  `/edit-interview/${interview.id}`
                                )
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  interview.id
                                )
                              }
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          {/* =========================
              CALENDAR VIEW
          ========================= */}

          {!loading &&
            filteredInterviews.length > 0 &&
            viewMode === "calendar" && (

              <div className="interview-calendar">

                {/* Calendar Header */}

                <div className="calendar-header">

                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={
                      goToPreviousMonth
                    }
                  >
                    ←
                  </button>

                  <div className="calendar-title">

                    <h2>
                      {monthName}{" "}
                      {calendarYear}
                    </h2>

                    <button
                      type="button"
                      className="calendar-today-btn"
                      onClick={goToToday}
                    >
                      Today
                    </button>

                  </div>

                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={
                      goToNextMonth
                    }
                  >
                    →
                  </button>

                </div>

                {/* Week Days */}

                <div className="calendar-weekdays">

                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>

                </div>

                {/* Calendar Grid */}

                <div className="calendar-grid">

                  {calendarDays.map(
                    (calendarDay, index) => {

                      const dayInterviews =
                        calendarDay.currentMonth
                          ? getInterviewsForDate(
                              calendarYear,
                              calendarMonth,
                              calendarDay.date
                            )
                          : [];

                      return (

                        <div
                          className={`calendar-day ${
                            calendarDay.currentMonth
                              ? ""
                              : "calendar-day-other-month"
                          } ${
                            calendarDay.currentMonth &&
                            isToday(
                              calendarDay.date
                            )
                              ? "calendar-day-today"
                              : ""
                          }`}
                          key={index}
                        >

                          <div className="calendar-date">

                            {
                              calendarDay.date
                            }

                          </div>

                          <div className="calendar-interviews">

                            {dayInterviews.map(
                              (interview) => {

                                const status =
                                  interview.status ||
                                  "Upcoming";

                                return (

                                  <div
                                    className={`calendar-interview-card calendar-status-${status
                                      .toLowerCase()
                                      .replace(
                                        " ",
                                        "-"
                                      )}`}
                                    key={
                                      interview.id
                                    }
                                    onClick={() =>
                                      navigate(
                                        `/edit-interview/${interview.id}`
                                      )
                                    }
                                  >

                                    <div className="calendar-interview-company">

                                      {interview.company}

                                    </div>

                                    <div className="calendar-interview-role">

                                      {interview.role}

                                    </div>

                                    <div className="calendar-interview-time">

                                      ⏰{" "}
                                      {
                                        interview.interviewTime
                                      }

                                    </div>

                                  </div>

                                );

                              }
                            )}

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default Interviews;