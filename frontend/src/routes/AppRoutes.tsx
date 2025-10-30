import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import TicketList from "../pages/TicketList";
import TicketCreate from "../pages/TicketCreate";
import DashboardPage from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import ProtectedRoute from "./ProtectedRoute";
import TicketDetails from "../pages/TicketDetails.tsx";
import {useAuth} from "../context/AuthContext.tsx";

export default function AppRoutes() {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Checking session...
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <TicketList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tickets/create"
                element={
                    <ProtectedRoute>
                        <TicketCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tickets/:id"
                element={
                    <ProtectedRoute>
                        <TicketDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["service_desk", "admin"]}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <UserManagement />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
