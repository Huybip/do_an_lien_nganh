import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminServices from "./pages/admin/AdminServices";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHelp from "./pages/admin/AdminHelp";
import AdminScores from "./pages/admin/AdminScores";
import AdminShifts from "./pages/admin/AdminShifts";
import AdminPayments from "./pages/admin/AdminPayments";

// Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorShifts from "./pages/doctor/DoctorShifts";
import DoctorRecords from "./pages/doctor/DoctorRecords";
import DoctorImages from "./pages/doctor/DoctorImages";
import DoctorChat from "./pages/doctor/DoctorChat";

import DoctorPayments from "./pages/doctor/DoctorPayments";

// Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientPayments from "./pages/patient/PatientPayments";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientAppointment from "./pages/patient/PatientAppointment";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientImages from "./pages/patient/PatientImages";
import PatientDentalScore from "./pages/patient/PatientDentalScore";
import PatientChat from "./pages/patient/PatientChat";

import VideoCallPage from "./pages/VideoCallPage";

// Redirect authenticated users away from auth pages
function LoginRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    return <Navigate to="/patient" replace />;
  }
  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root - ALWAYS show homepage (public landing page) */}
      <Route path="/" element={<HomePage />} />

      {/* Auth pages - redirect to dashboard if already logged in */}
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shifts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminShifts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/scores"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminScores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/help"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminHelp />
          </ProtectedRoute>
        }
      />

      {/* Doctor */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/shifts"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorShifts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/records"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/images"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorImages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/payments"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/chat"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorChat />
          </ProtectedRoute>
        }
      />

      {/* Patient */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/records"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/images"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientImages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/dental-score"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDentalScore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/payments"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/chat"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientChat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/video-call"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
