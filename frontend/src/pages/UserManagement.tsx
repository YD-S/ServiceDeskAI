import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {AxiosError} from "axios";

type User = {
    _id: string;
    name: string;
    email: string;
    role: "standard" | "service_desk" | "admin";
    createdAt: string;
};

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const { data } = await api.get("/admin/users");
                setUsers(data);
            } catch (err) {
                if (err instanceof AxiosError) {
                    console.error("Failed to load users:", err);
                    setError("Failed to load users");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const handleRoleChange = async (id: string, newRole: User["role"]) => {
        try {
            setUpdating(true);
            await api.patch(`/admin/users/${id}`, { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Failed to update role:", err);
                alert("Failed to update user role");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        if (user?.id === id) {
            alert("You cannot delete your own account.");
            return;
        }

        try {
            await api.delete(`/admin/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Failed to delete user:", err);
                alert("Failed to delete user");
            }
        }
    };

    if (loading)
        return <div className="text-center py-10 text-gray-600">Loading users...</div>;
    if (error)
        return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-500 text-sm">
                    Total users: {users.length}
                </p>
            </div>

            {users.length === 0 ? (
                <p className="text-gray-500 text-center">No users found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Role</th>
                            <th className="py-3 px-6 text-left">Created</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-700">
                        {users.map((u) => (
                            <tr key={u._id} className="border-b hover:bg-gray-50 transition">
                                <td className="py-3 px-6 font-medium">{u.name}</td>
                                <td className="py-3 px-6">{u.email}</td>
                                <td className="py-3 px-6">
                                    <select
                                        value={u.role}
                                        disabled={updating}
                                        onChange={(e) =>
                                            handleRoleChange(u._id, e.target.value as User["role"])
                                        }
                                        className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="service_desk">Service Desk</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 px-6 text-sm">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button
                                        onClick={() => handleDelete(u._id)}
                                        disabled={user?.id === u._id}
                                        className={`px-3 py-1 text-sm rounded-lg transition-all ${
                                            user?.id === u._id
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-red-500 text-white hover:bg-red-600"
                                        }`}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
