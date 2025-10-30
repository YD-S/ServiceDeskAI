import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {AxiosError} from "axios";

type Ticket = {
    _id: string;
    title: string;
    description: string;
    status: "open" | "in_progress" | "resolved";
    priority: "low" | "medium" | "high";
    createdAt: string;
    fileUrl?: string;
    aiAnalysis?: string;
    createdBy?: { name: string; email: string };
};

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchTicket() {
            try {
                const { data } = await api.get(`/tickets/${id}`);
                setTicket(data);
            } catch (err) {
                if (err instanceof AxiosError) {
                console.error("Error loading ticket:", err);
                setError("Failed to load ticket details.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchTicket();
    }, [id]);

    const handleResolve = async () => {
        if (!ticket) return;
        setUpdating(true);
        try {
            await api.patch(`/tickets/${ticket._id}`, { status: "resolved" });
            setTicket({ ...ticket, status: "resolved" });
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Failed to update status:", err);
                setError("Could not update ticket status.");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!ticket) return;
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        try {
            await api.delete(`/tickets/${ticket._id}`);
            navigate("/");
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Failed to delete ticket:", err);
                setError("Could not delete ticket.");
            }
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!ticket) return <div className="text-center text-gray-500 py-10">Ticket not found.</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{ticket.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                        Created on:{" "}
                        <span className="font-medium">
              {new Date(ticket.createdAt).toLocaleString()}
            </span>
                    </p>
                    {ticket.createdBy && (
                        <p className="text-sm text-gray-600">
                            By: <span className="font-medium">{ticket.createdBy.name}</span>
                        </p>
                    )}
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
          <span
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                  ticket.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
              }`}
          >
            {ticket.priority}
          </span>
                    <span
                        className={`px-3 py-1 rounded-full text-sm capitalize ${
                            ticket.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : ticket.status === "in_progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                        }`}
                    >
            {ticket.status}
          </span>
                </div>
            </div>

            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{ticket.description}</p>

            {ticket.fileUrl && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Attached Image:</h2>
                    <img
                        src={ticket.fileUrl}
                        alt="Ticket Attachment"
                        className="rounded-lg border border-gray-200 max-h-96 object-contain"
                    />
                </div>
            )}

            {ticket.aiAnalysis && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">AI Analysis:</h2>
                    <pre className="bg-gray-50 text-gray-700 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
            {ticket.aiAnalysis}
          </pre>
                </div>
            )}

            <div className="flex gap-3 justify-end mt-8">
                {user?.role !== "standard" && ticket.status !== "resolved" && (
                    <button
                        onClick={handleResolve}
                        disabled={updating}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {updating ? "Updating..." : "Mark as Resolved"}
                    </button>
                )}

                {user?.role === "admin" && (
                    <button
                        onClick={handleDelete}
                        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                )}

                <button
                    onClick={() => navigate("/")}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
