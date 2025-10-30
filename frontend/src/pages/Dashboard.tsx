import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6">
            <div className="bg-bg-light shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-4">
                    Welcome, <span className="text-primary">{user?.name}</span> 👋
                </h1>

                <p className="text-text-muted mb-6">
                    You’re logged in as <strong>{user?.role}</strong> ({user?.email})
                </p>

                <div className="flex flex-col space-y-3">
                    <button
                        onClick={() => navigate("/tickets")}
                        className="w-full p-3 bg-primary text-bg font-semibold rounded-xl hover:bg-secondary transition-all duration-300"
                    >
                        View My Tickets
                    </button>

                    <button
                        onClick={() => navigate("/tickets/new")}
                        className="w-full p-3 bg-secondary text-bg font-semibold rounded-xl hover:bg-primary transition-all duration-300"
                    >
                        Create New Ticket
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full p-3 bg-red-600 text-bg font-semibold rounded-xl hover:bg-red-700 transition-all duration-300"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
