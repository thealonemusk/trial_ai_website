import { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import Dashboard from "./components/pages/dashboard";
import Success from "./components/pages/success";
import Home from "./components/pages/home";
import AdminInfo from "./components/pages/admin-info";
import { AuthProvider, useAuth } from "../supabase/auth";

// Leave Management Pages
import LeaveDashboard from "./components/pages/leave/dashboard";
import LeaveRequestPage from "./components/pages/leave/request";
import LeaveCalendarPage from "./components/pages/leave/calendar";
import LeaveAdminPage from "./components/pages/leave/admin";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/admin-info" element={<AdminInfo />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />

        {/* Leave Management Routes */}
        <Route
          path="/leave/dashboard"
          element={
            <PrivateRoute>
              <LeaveDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave/request"
          element={
            <PrivateRoute>
              <LeaveRequestPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave/calendar"
          element={
            <PrivateRoute>
              <LeaveCalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave/admin"
          element={
            <PrivateRoute>
              <LeaveAdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <AppRoutes />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
