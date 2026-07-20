import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ComplaintProvider } from "./context/ComplaintContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import RoleSelection from "./components/pages/RoleSelection.jsx";
import Login from "./components/pages/Login.jsx";
import Dashboard from "./components/pages/Dashboard.jsx";
import EngineerDashboard from "./components/pages/EngineerDashboard.jsx";
import Analytics from "./components/pages/Analytics.jsx";
import History from "./components/pages/History.jsx";
import Settings from "./components/pages/Settings.jsx";

const DashboardRoute = () => {
  const { role } = useAuth();
  return role === "engineer" ? <EngineerDashboard /> : <Dashboard />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ComplaintProvider>
          <SettingsProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RoleSelection />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SettingsProvider>
        </ComplaintProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
