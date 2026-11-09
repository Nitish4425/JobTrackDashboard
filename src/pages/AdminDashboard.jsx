import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  subscribeToAllUsers,
  updateUserStatus
} from "../firebase/firestore";

import { logoutUser } from "../firebase/auth";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // all / active / inactive
  const [userFilter, setUserFilter] = useState("all");

  // newest / oldest / name-az / name-za
  const [sortOption, setSortOption] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Retry listener
  const [retryKey, setRetryKey] = useState(0);

  // =========================
  // STATUS CONFIRMATION
  // =========================

  const [confirmStatus, setConfirmStatus] = useState(null);

  const [statusUpdating, setStatusUpdating] = useState(false);

  // =========================
  // REAL-TIME LOAD ALL USERS
  // =========================

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    setLoading(true);
    setError("");

    try {
      unsubscribe = subscribeToAllUsers(
        // =========================
        // SUCCESS CALLBACK
        // =========================
        (data) => {
          if (!isMounted) return;

          try {
            // Admin ko normal user list mein
            // show nahi karna
            const normalUsers = data.filter(
              (user) => user.role !== "admin"
            );

            setUsers(normalUsers);
            setError("");
            setLoading(false);
          } catch (processingError) {
            console.error(
              "Error processing users:",
              processingError
            );

            setError(
              "Failed to process users. Please try again."
            );

            setLoading(false);
          }
        },

        // =========================
        // ERROR CALLBACK
        // =========================
        (listenerError) => {
          if (!isMounted) return;

          console.error(
            "Admin users listener failed:",
            listenerError
          );

          if (
            listenerError.code === "permission-denied"
          ) {
            setError(
              "Permission denied. Please check Firestore security rules."
            );
          } else {
            setError(
              "Unable to load users. Check your internet connection and try again."
            );
          }

          setLoading(false);
        }
      );
    } catch (listenerError) {
      console.error(
        "Unable to start users listener:",
        listenerError
      );

      if (isMounted) {
        setError(
          "Unable to connect to the users database. Please try again."
        );

        setLoading(false);
      }
    }

    // Cleanup listener
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [retryKey]);

  // =========================
  // RETRY LISTENER
  // =========================

  const handleRetry = () => {
    setError("");
    setRetryKey((previousKey) => previousKey + 1);
  };

  // =========================
  // ACTIVE / INACTIVE USERS
  // =========================

  const activeUsers = users.filter(
    (user) => user.status !== "inactive"
  );

  const inactiveUsers = users.filter(
    (user) => user.status === "inactive"
  );

  // =========================
  // STATUS FILTER
  // =========================

  const statusFilteredUsers = users.filter(
    (user) => {
      if (userFilter === "active") {
        return user.status !== "inactive";
      }

      if (userFilter === "inactive") {
        return user.status === "inactive";
      }

      return true;
    }
  );

  // =========================
  // CREATED DATE HELPER
  // =========================

  const getCreatedTime = (createdAt) => {
    if (!createdAt) {
      return 0;
    }

    // Firestore Timestamp
    if (
      typeof createdAt.toMillis === "function"
    ) {
      return createdAt.toMillis();
    }

    // JavaScript Date
    if (createdAt instanceof Date) {
      return createdAt.getTime();
    }

    // String / number
    const parsedTime = new Date(createdAt).getTime();

    return Number.isNaN(parsedTime)
      ? 0
      : parsedTime;
  };

  // =========================
  // SEARCH + SORT
  // =========================

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const searchedUsers = statusFilteredUsers.filter(
      (user) => {
        const name =
          user.name?.toLowerCase() || "";

        const email =
          user.email?.toLowerCase() || "";

        const role =
          user.currentRole?.toLowerCase() || "";

        const location =
          user.location?.toLowerCase() || "";

        return (
          name.includes(search) ||
          email.includes(search) ||
          role.includes(search) ||
          location.includes(search)
        );
      }
    );

    const sortedUsers = [...searchedUsers];

    // =========================
    // SORT
    // =========================

    if (sortOption === "name-az") {
      sortedUsers.sort((a, b) => {
        const nameA =
          a.name?.toLowerCase() || "";

        const nameB =
          b.name?.toLowerCase() || "";

        return nameA.localeCompare(nameB);
      });
    }

    if (sortOption === "name-za") {
      sortedUsers.sort((a, b) => {
        const nameA =
          a.name?.toLowerCase() || "";

        const nameB =
          b.name?.toLowerCase() || "";

        return nameB.localeCompare(nameA);
      });
    }

    if (sortOption === "newest") {
      sortedUsers.sort(
        (a, b) =>
          getCreatedTime(b.createdAt) -
          getCreatedTime(a.createdAt)
      );
    }

    if (sortOption === "oldest") {
      sortedUsers.sort(
        (a, b) =>
          getCreatedTime(a.createdAt) -
          getCreatedTime(b.createdAt)
      );
    }

    return sortedUsers;
  }, [
    statusFilteredUsers,
    searchTerm,
    sortOption
  ]);

  // =========================
  // CLEAR FILTERS
  // =========================

  const handleClearFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    setSortOption("newest");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    userFilter !== "all" ||
    sortOption !== "newest";

  // =========================
  // OPEN STATUS CONFIRMATION
  // =========================

  const openStatusConfirmation = (
    user,
    currentStatus
  ) => {
    const newStatus =
      currentStatus === "inactive"
        ? "active"
        : "inactive";

    setConfirmStatus({
      userId: user.id,
      userName: user.name || "this user",
      currentStatus,
      newStatus
    });
  };

  // =========================
  // CLOSE CONFIRMATION
  // =========================

  const closeStatusConfirmation = () => {
    if (statusUpdating) {
      return;
    }

    setConfirmStatus(null);
  };

  // =========================
  // UPDATE USER STATUS
  // =========================

  const handleStatusChange = async () => {
    if (!confirmStatus || statusUpdating) {
      return;
    }

    try {
      setStatusUpdating(true);

      await updateUserStatus(
        confirmStatus.userId,
        confirmStatus.newStatus
      );

      // Real-time listener will also
      // update this automatically.
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === confirmStatus.userId
            ? {
                ...user,
                status: confirmStatus.newStatus
              }
            : user
        )
      );

      setConfirmStatus(null);
    } catch (error) {
      console.error(
        "Error updating user status:",
        error
      );

      alert(
        "Failed to update user status."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

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
        "Admin logout failed:",
        error
      );
    }
  };

  // =========================
  // VIEW USER
  // =========================

  const handleViewUser = (userId) => {
    navigate(
      `/admin/users/${userId}`
    );
  };

  // =========================
  // FILTER CHANGE
  // =========================

  const handleFilterChange = (filter) => {
    setUserFilter(filter);
    setSearchTerm("");
  };

  // =========================
  // TITLE
  // =========================

  const getUsersTitle = () => {
    if (userFilter === "active") {
      return "Active Users";
    }

    if (userFilter === "inactive") {
      return "Inactive Users";
    }

    return "All Users";
  };

  // =========================
  // SUBTITLE
  // =========================

  const getUsersSubtitle = () => {
    if (userFilter === "active") {
      return "Currently active JobTrackPro users.";
    }

    if (userFilter === "inactive") {
      return "Users currently marked as inactive.";
    }

    return "Select a user to view their complete JobTrackPro data.";
  };

  return (
    <div className="admin-app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          JobTrack<span>Pro</span>
        </div>

        <div className="admin-badge">
          👑 Admin Panel
        </div>

        <nav className="admin-nav">

          <a
            className="admin-nav-active"
            onClick={() =>
              navigate("/admin")
            }
          >
            👥 Users
          </a>

          <a
            onClick={() =>
              navigate("/admin/settings")
            }
          >
            ⚙️ Settings
          </a>

        </nav>

        <div className="admin-sidebar-bottom">

          <a onClick={handleLogout}>
            🚪 Logout
          </a>

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <h1>
              Admin Dashboard 👑
            </h1>

            <p>
              Manage and view JobTrackPro users.
            </p>

          </div>

          <div className="admin-header-info">

            <span>
              👤 Administrator
            </span>

          </div>

        </header>

        {/* =========================
            CONTENT
        ========================= */}

        <section className="admin-content">

          {/* =========================
              STATISTICS
          ========================= */}

          <div className="admin-stats-grid">

            {/* TOTAL */}

            <div
              className={`admin-stat-card ${
                userFilter === "all"
                  ? "admin-stat-active"
                  : ""
              }`}
              onClick={() =>
                handleFilterChange("all")
              }
            >

              <div>

                <span>
                  Total Users
                </span>

                <h2>
                  {users.length}
                </h2>

              </div>

              <div className="admin-stat-icon">
                👥
              </div>

            </div>

            {/* ACTIVE */}

            <div
              className={`admin-stat-card ${
                userFilter === "active"
                  ? "admin-stat-active"
                  : ""
              }`}
              onClick={() =>
                handleFilterChange("active")
              }
            >

              <div>

                <span>
                  Active Users
                </span>

                <h2>
                  {activeUsers.length}
                </h2>

              </div>

              <div className="admin-stat-icon">
                🟢
              </div>

            </div>

            {/* INACTIVE */}

            <div
              className={`admin-stat-card ${
                userFilter === "inactive"
                  ? "admin-stat-active"
                  : ""
              }`}
              onClick={() =>
                handleFilterChange("inactive")
              }
            >

              <div>

                <span>
                  Inactive Users
                </span>

                <h2>
                  {inactiveUsers.length}
                </h2>

              </div>

              <div className="admin-stat-icon">
                🔴
              </div>

            </div>

          </div>

          {/* =========================
              USERS CARD
          ========================= */}

          <div className="admin-users-card">

            <div className="admin-users-header">

              <div>

                <h2>
                  {getUsersTitle()}
                </h2>

                <p>
                  {getUsersSubtitle()}
                </p>

              </div>

              {userFilter !== "all" && (

                <button
                  className="admin-show-all-btn"
                  onClick={() =>
                    handleFilterChange("all")
                  }
                >
                  ← Show All Users
                </button>

              )}

            </div>

            {/* =========================
                SEARCH + SORT CONTROLS
            ========================= */}

            <div className="admin-user-controls">

              {/* SEARCH */}

              <div className="admin-search">

                <span>
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search by name, email, role or location..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>

              {/* SORT */}

              <select
                className="admin-sort-select"
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value)
                }
              >

                <option value="newest">
                  Newest Users
                </option>

                <option value="oldest">
                  Oldest Users
                </option>

                <option value="name-az">
                  Name A–Z
                </option>

                <option value="name-za">
                  Name Z–A
                </option>

              </select>

              {/* CLEAR */}

              {hasActiveFilters && (

                <button
                  className="admin-clear-filter-btn"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>

              )}

            </div>

            {/* =========================
                RESULT INFO
            ========================= */}

            {!loading && !error && (

              <div className="admin-result-info">

                <span>
                  Showing{" "}
                  <strong>
                    {filteredUsers.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {users.length}
                  </strong>{" "}
                  users
                </span>

              </div>

            )}

            {/* =========================
                LOADING
            ========================= */}

            {loading && (

              <div className="admin-state">

                <div className="admin-loader">
                  Loading users...
                </div>

              </div>

            )}

            {/* =========================
                ERROR + RETRY
            ========================= */}

            {!loading && error && (

              <div className="admin-error">

                <p>
                  ❌ {error}
                </p>

                <button
                  type="button"
                  className="admin-clear-filter-btn"
                  onClick={handleRetry}
                >
                  ↻ Try Again
                </button>

              </div>

            )}

            {/* =========================
                EMPTY
            ========================= */}

            {!loading &&
              !error &&
              filteredUsers.length === 0 && (

                <div className="admin-empty">

                  <div>
                    👥
                  </div>

                  <h3>
                    No users found
                  </h3>

                  <p>

                    {userFilter === "inactive"
                      ? "There are no inactive users."
                      : userFilter === "active"
                      ? "There are no active users."
                      : "No users match your current filters."}

                  </p>

                  {hasActiveFilters && (

                    <button
                      className="admin-clear-filter-btn empty-clear-btn"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </button>

                  )}

                </div>

              )}

            {/* =========================
                USERS TABLE
            ========================= */}

            {!loading &&
              !error &&
              filteredUsers.length > 0 && (

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>

                      <tr>

                        <th>
                          User
                        </th>

                        <th>
                          Email
                        </th>

                        <th>
                          Current Role
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredUsers.map((user) => (

                        <tr key={user.id}>

                          {/* USER */}

                          <td>

                            <div className="admin-user-cell">

                              <div className="admin-avatar">

                                {user.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}

                              </div>

                              <div>

                                <strong>
                                  {user.name || "Unnamed User"}
                                </strong>

                                <span>
                                  User
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td>
                            {user.email || "No email"}
                          </td>

                          {/* ROLE */}

                          <td>

                            <span className="admin-role-badge">

                              {user.currentRole || "Not specified"}

                            </span>

                          </td>

                          {/* LOCATION */}

                          <td>
                            {user.location || "Not specified"}
                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                user.status === "inactive"
                                  ? "admin-status-badge inactive"
                                  : "admin-status-badge active"
                              }
                            >

                              {user.status === "inactive"
                                ? "Inactive"
                                : "Active"}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            <div className="admin-action-buttons">

                              <button
                                className="admin-view-btn"
                                onClick={() =>
                                  handleViewUser(user.id)
                                }
                              >
                                👁 View
                              </button>

                              <button
                                className={
                                  user.status === "inactive"
                                    ? "admin-activate-btn"
                                    : "admin-deactivate-btn"
                                }
                                onClick={() =>
                                  openStatusConfirmation(
                                    user,
                                    user.status
                                  )
                                }
                              >

                                {user.status === "inactive"
                                  ? "Activate"
                                  : "Deactivate"}

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

          </div>

        </section>

      </main>

      {/* =========================
          STATUS CONFIRMATION MODAL
      ========================= */}

      {confirmStatus && (

        <div className="admin-modal-overlay">

          <div className="admin-confirm-modal">

            <div
              className={
                confirmStatus.newStatus === "inactive"
                  ? "admin-confirm-icon danger"
                  : "admin-confirm-icon success"
              }
            >

              {confirmStatus.newStatus === "inactive"
                ? "⚠️"
                : "✅"}

            </div>

            <h3>

              {confirmStatus.newStatus === "inactive"
                ? "Deactivate User?"
                : "Activate User?"}

            </h3>

            <p>

              Are you sure you want to{" "}

              <strong>
                {confirmStatus.newStatus === "inactive"
                  ? "deactivate"
                  : "activate"}
              </strong>{" "}

              <strong>
                {confirmStatus.userName}
              </strong>
              ?

            </p>

            {confirmStatus.newStatus === "inactive" && (

              <div className="admin-warning-box">

                ⚠️ This user will not be able
                to access JobTrack Pro until
                the account is activated again.

              </div>

            )}

            <div className="admin-modal-actions">

              <button
                className="admin-cancel-btn"
                onClick={closeStatusConfirmation}
                disabled={statusUpdating}
              >
                Cancel
              </button>

              <button
                className={
                  confirmStatus.newStatus === "inactive"
                    ? "admin-confirm-danger-btn"
                    : "admin-confirm-success-btn"
                }
                onClick={handleStatusChange}
                disabled={statusUpdating}
              >

                {statusUpdating
                  ? "Updating..."
                  : confirmStatus.newStatus === "inactive"
                  ? "Deactivate"
                  : "Activate"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;