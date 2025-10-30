import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {AxiosError} from "axios";

type Ticket = {
    _id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    aiAnalysis?: string;
};

export default function TicketList() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTickets() {
            try {
                const { data } = await api.get("/tickets");
                setTickets(data);
            } catch (err) {
                if (err instanceof AxiosError) {
                    console.error("Error fetching tickets:", err);
                    setError("Failed to load tickets");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchTickets();
    }, []);

    if (loading)
        return (
            <div className="text-center py-10 text-gray-600">Loading tickets...</div>
        );
    if (error)
        return (
            <div className="text-center py-10 text-red-500">{error}</div>
        );

    return (
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Tickets</h1>
                <button
                    onClick={() => navigate("/tickets/create")}
                    className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-secondary transition-all"
                >
                    + Create Ticket
                </button>
            </div>

            {tickets.length === 0 ? (
                <p className="text-gray-500 text-center">No tickets yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Title</th>
                            <th className="py-3 px-6 text-left">Status</th>
                            <th className="py-3 px-6 text-left">Priority</th>
                            <th className="py-3 px-6 text-left">Created</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-700">
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket._id}
                                onClick={() => navigate(`/tickets/${ticket._id}`)}
                                className="border-b hover:bg-gray-50 transition cursor-pointer"
                            >
                                <td className="py-3 px-6 font-medium text-primary hover:underline">
                                    {ticket.title}
                                </td>
                                <td className="py-3 px-6 capitalize">{ticket.status}</td>
                                <td className="py-3 px-6 capitalize">{ticket.priority}</td>
                                <td className="py-3 px-6 text-sm">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {user?.role === "admin" && (
                <p className="text-sm text-gray-400 mt-4 text-center">
                    Admin view – full access to all tickets
                </p>
            )}
        </div>
    );
}
