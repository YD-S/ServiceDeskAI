import { useAuth } from "./context/AuthContext";
import { Link } from "react-router-dom";

function App() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <nav className="bg-white border-b border-gray-200 p-4 flex justify-between">
                <div className="flex gap-4">
                    <Link to="/">Home</Link>
                    {user?.role === "service_desk" && <Link to="/dashboard">Dashboard</Link>}
                    {user?.role === "admin" && <Link to="/admin">Admin</Link>}
                </div>
                <div>
                    {user ? (
                        <button onClick={logout} className="text-sm text-red-600">Logout</button>
                    ) : (
                        <Link to="/login" className="text-sm text-blue-600">Login</Link>
                    )}
                </div>
            </nav>
            <main className="p-6">
            </main>
        </div>
    );
}

export default App;
