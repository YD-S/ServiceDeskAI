import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {toast} from "react-toastify";

interface User {
    id: string;
    email: string;
    role: "standard" | "service_desk" | "admin";
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoggedIn(false);
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await api.get("/auth/me");
                setUser(data);
                setIsLoggedIn(true);
            } catch {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const login = async (email: string, password: string) => {
        try{
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            setUser(data.user);
            setIsLoggedIn(true);
        }catch (err) {
            throw err;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try{
            const { data } = await api.post("/auth/register", { name, email, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            setUser(data.user);
            setIsLoggedIn(true);
        }catch {
            toast.error("Registration failed. Please try again.");
            throw new Error("Registration failed");
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
