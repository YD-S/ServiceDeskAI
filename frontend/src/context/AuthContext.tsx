import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";

type User = {
    id: string;
    name: string;
    email: string;
    role: "standard" | "service_desk" | "admin";
};

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    useEffect(() => {
        if (token) {
            api.get("/auth/me")
                .then(res => setUser(res.data))
                .catch(() => logout());
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        const refreshToken = localStorage.getItem("refreshToken")
        api.post("api/auth/logout", refreshToken)
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
