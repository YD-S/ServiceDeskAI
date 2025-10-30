import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {AxiosError} from "axios";

export default function TicketCreate() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "medium",
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let fileUrl = null;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const { data } = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                fileUrl = data.url;
            }

            await api.post("/tickets", {
                ...form,
                fileUrl,
            });

            setSuccess(true);
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            if (err instanceof AxiosError){
                console.error("Ticket creation failed:", err);
                setError(err.response?.data?.error || "Failed to create ticket");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Ticket</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                    Ticket created successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Priority</label>
                    <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Attach Image (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-secondary"
                    }`}
                >
                    {loading ? "Creating..." : "Create Ticket"}
                </button>
            </form>
        </div>
    );
}
