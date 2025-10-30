import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

export default function LoginPage() {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { login, register }= useAuth();

    const toggleRegister = () => setIsRegisterOpen(!isRegisterOpen);

    const handleLogin = async () => {

        console.log("Attempting login with:", loginData);
        setLoading(true);
        try {
            await login(loginData.email, loginData.password);
            toast.success("Welcome back!", { autoClose: 2500 });
            setTimeout(() => navigate("/"), 100);
        } catch (err) {
            if (err instanceof AxiosError) {
                const message = err.response?.data?.error || "Invalid credentials";
                toast.error(message, { autoClose: 4000 });
            } else {
                toast.error("Unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (registerData.password !== registerData.confirmPassword) {
            toast.warning("Passwords do not match", { autoClose: 3500 });
            return;
        }
        await register(
            registerData.username,
            registerData.email,
            registerData.password
        );
        toast.success("Account created! Please log in.", { autoClose: 3000 });
        navigate("/");
        setIsRegisterOpen(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-bg text-text p-4">
            <div className="rounded-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative overflow-hidden w-full max-w-[500px] bg-bg-light">

                {/* LOGIN SECTION */}
                <div
                    className={`overflow-hidden transition-all duration-700 ease-in-out ${
                        !isRegisterOpen
                            ? "max-h-[400px] opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 -translate-y-full"
                    }`}
                >
                    <div className="p-8 bg-bg-light transform transition-transform duration-700 ease-in-out">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-center mb-6 text-text">
                                Sign In
                            </h1>

                            <input
                                type="text"
                                placeholder="Email"
                                value={loginData.email}
                                onChange={(e) =>
                                    setLoginData({ ...loginData, email: e.target.value })
                                }
                                className="w-full p-4 rounded-[15px] bg-bg border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={loginData.password}
                                onChange={(e) =>
                                    setLoginData({ ...loginData, password: e.target.value })
                                }
                                className="w-full p-4 rounded-[15px] bg-bg border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                            />

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleLogin}
                                className={`w-full p-4 text-lg rounded-[15px] font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-primary text-bg hover:bg-secondary hover:shadow-lg"
                                }`}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TOGGLE BUTTON */}
                <div className="relative">
                    <button
                        onClick={toggleRegister}
                        className="w-full p-4 bg-border hover:bg-border-muted transition-all duration-500 flex items-center justify-center space-x-2 text-text font-medium"
                    >
                        <span>{isRegisterOpen ? "Back to Sign In" : "Create Account"}</span>
                        <div
                            className={`transform transition-transform duration-500 ${
                                isRegisterOpen ? "rotate-180" : ""
                            }`}
                        >
                            <ChevronDown size={20} />
                        </div>
                    </button>
                </div>

                {/* REGISTER SECTION */}
                <div
                    className={`overflow-hidden transition-all duration-700 ease-in-out ${
                        isRegisterOpen
                            ? "max-h-[600px] opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 translate-y-full"
                    }`}
                >
                    <div className="p-8 bg-bg-dark transform transition-transform duration-700 ease-in-out">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-center mb-6 text-text">
                                Sign Up
                            </h1>

                            <input
                                type="text"
                                placeholder="Username"
                                value={registerData.username}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        username: e.target.value,
                                    })
                                }
                                className="w-full p-4 rounded-[15px] bg-bg border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={registerData.email}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, email: e.target.value })
                                }
                                className="w-full p-4 rounded-[15px] bg-bg border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={registerData.password}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full p-4 rounded-[15px] bg-bg border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                            />

                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={registerData.confirmPassword}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className="w-full p-4 rounded-[15px] bg-bg border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                            />

                            <button
                                type="button"
                                onClick={handleRegister}
                                className="w-full p-4 text-lg bg-secondary text-bg rounded-[15px] font-semibold transition-all duration-300 hover:bg-primary hover:shadow-lg transform hover:-translate-y-1"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
