import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =========================
// AUTH PAGES
// =========================

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// =========================
// USER PAGES
// =========================

import Dashboard from "./pages/Dashboard";

import Applications from "./pages/Applications";
import AddApplication from "./pages/AddApplication";
import EditApplication from "./pages/EditApplication";

import Interviews from "./pages/Interviews";
import AddInterview from "./pages/AddInterview";
import EditInterview from "./pages/EditInterview";

import Profile from "./pages/Profile";

import SavedJobs from "./pages/SavedJobs";
import AddSavedJob from "./pages/AddSavedJob";
import EditSavedJob from "./pages/EditSavedJob";

import Settings from "./pages/Settings";

// =========================
// ROUTE PROTECTION
// =========================

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminEditUser from "./pages/AdminEditUser";
import AdminEditApplication from "./pages/AdminEditApplication";
import AdminEditInterview from "./pages/AdminEditInterview";
import AdminEditSavedJob from "./pages/AdminEditSavedJob";
import AdminAddApplication from "./pages/AdminAddApplication";
import AdminAddInterview from "./pages/AdminAddInterview";
import AdminAddSavedJob from "./pages/AdminAddSavedJob";
import AdminSettings from "./pages/AdminSettings";
// =========================
// GLOBAL CSS
// =========================

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* =========================
            PUBLIC AUTH ROUTES
        ========================= */}

        {/* Normal User Login */}

        <Route path="/login" element={<Login />} />

        {/* Normal User Registration */}

        <Route path="/register" element={<Register />} />

        {/* Forgot Password */}

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Login */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users/:userId"
          element={
            <AdminRoute>
              <AdminUserDetails />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/edit"
          element={
            <AdminRoute>
              <AdminEditUser />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/applications/:applicationId/edit"
          element={
            <AdminRoute>
              <AdminEditApplication />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/interviews/:interviewId/edit"
          element={
            <AdminRoute>
              <AdminEditInterview />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/saved-jobs/:jobId/edit"
          element={
            <AdminRoute>
              <AdminEditSavedJob />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/applications/add"
          element={
            <AdminRoute>
              <AdminAddApplication />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/interviews/add"
          element={
            <AdminRoute>
              <AdminAddInterview />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/saved-jobs/add"
          element={
            <AdminRoute>
              <AdminAddSavedJob />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />
        {/* =========================
            PROTECTED USER ROUTES
        ========================= */}

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
            APPLICATIONS
        ========================= */}

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* Add Application */}

        <Route
          path="/add-application"
          element={
            <ProtectedRoute>
              <AddApplication />
            </ProtectedRoute>
          }
        />

        {/* Edit Application */}

        <Route
          path="/edit-application/:id"
          element={
            <ProtectedRoute>
              <EditApplication />
            </ProtectedRoute>
          }
        />

        {/* =========================
            INTERVIEWS
        ========================= */}

        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          }
        />

        {/* Add Interview */}

        <Route
          path="/add-interview"
          element={
            <ProtectedRoute>
              <AddInterview />
            </ProtectedRoute>
          }
        />

        {/* Edit Interview */}

        <Route
          path="/edit-interview/:id"
          element={
            <ProtectedRoute>
              <EditInterview />
            </ProtectedRoute>
          }
        />

        {/* =========================
            PROFILE
        ========================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =========================
            SAVED JOBS
        ========================= */}

        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        {/* Add Saved Job */}

        <Route
          path="/add-saved-job"
          element={
            <ProtectedRoute>
              <AddSavedJob />
            </ProtectedRoute>
          }
        />

        {/* Edit Saved Job */}

        <Route
          path="/edit-saved-job/:id"
          element={
            <ProtectedRoute>
              <EditSavedJob />
            </ProtectedRoute>
          }
        />

        {/* =========================
            SETTINGS
        ========================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* =========================
            INVALID ROUTE
        ========================= */}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
