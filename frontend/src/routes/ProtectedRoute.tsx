import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: ("standard" | "service_desk" | "admin")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoggedIn, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Checking session...
            </div>
        );
    }

    if (!isLoggedIn && location.pathname !== "/login") {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
        return <Navigate to="/" replace />;
    }

    return children;
}
