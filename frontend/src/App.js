import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        if (role === "admin")
            return _jsx(Navigate, { to: "/admin", replace: true });
        if (role === "doctor")
            return _jsx(Navigate, { to: "/doctor", replace: true });
        return _jsx(Navigate, { to: "/patient", replace: true });
    }
    return _jsx(LoginPage, {});
}
function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginRedirect, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/admin/users", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminUsers, {}) }) }), _jsx(Route, { path: "/admin/doctors", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminDoctors, {}) }) }), _jsx(Route, { path: "/admin/services", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminServices, {}) }) }), _jsx(Route, { path: "/admin/appointments", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminAppointments, {}) }) }), _jsx(Route, { path: "/admin/shifts", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminShifts, {}) }) }), _jsx(Route, { path: "/admin/reports", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminReports, {}) }) }), _jsx(Route, { path: "/admin/settings", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminSettings, {}) }) }), _jsx(Route, { path: "/admin/scores", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminScores, {}) }) }), _jsx(Route, { path: "/admin/payments", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminPayments, {}) }) }), _jsx(Route, { path: "/admin/help", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(AdminHelp, {}) }) }), _jsx(Route, { path: "/doctor", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorDashboard, {}) }) }), _jsx(Route, { path: "/doctor/patients", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorPatients, {}) }) }), _jsx(Route, { path: "/doctor/appointments", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorAppointments, {}) }) }), _jsx(Route, { path: "/doctor/shifts", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorShifts, {}) }) }), _jsx(Route, { path: "/doctor/records", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorRecords, {}) }) }), _jsx(Route, { path: "/doctor/images", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorImages, {}) }) }), _jsx(Route, { path: "/doctor/payments", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorPayments, {}) }) }), _jsx(Route, { path: "/doctor/chat", element: _jsx(ProtectedRoute, { allowedRoles: ["doctor"], children: _jsx(DoctorChat, {}) }) }), _jsx(Route, { path: "/patient", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientDashboard, {}) }) }), _jsx(Route, { path: "/patient/profile", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientProfile, {}) }) }), _jsx(Route, { path: "/patient/appointments", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientAppointment, {}) }) }), _jsx(Route, { path: "/patient/records", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientRecords, {}) }) }), _jsx(Route, { path: "/patient/images", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientImages, {}) }) }), _jsx(Route, { path: "/patient/dental-score", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientDentalScore, {}) }) }), _jsx(Route, { path: "/patient/payments", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientPayments, {}) }) }), _jsx(Route, { path: "/patient/chat", element: _jsx(ProtectedRoute, { allowedRoles: ["patient"], children: _jsx(PatientChat, {}) }) }), _jsx(Route, { path: "/video-call", element: _jsx(ProtectedRoute, { children: _jsx(VideoCallPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }) }));
}
