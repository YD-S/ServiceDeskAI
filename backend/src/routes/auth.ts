import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User";
import { signAccessToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";
import { AuthRequest } from "../types/AuthRequest";
import {deleteRefreshToken, generateRefreshToken, verifyRefreshToken} from "../utils/token";

const router = Router();

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address");

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

router.post("/register", async (req: Request, res: Response) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "admin" : "standard";

        const user = await User.create({ name, email, passwordHash, role });
        const token = signAccessToken(user.id, user.role as any);
        const refreshToken = await generateRefreshToken(user.id);

        return res.status(201).json({
            user: { id: user.id, name, email, role },
            token,
            refreshToken
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                error: "Invalid input",
                details: err.issues.map((i) => ({
                    path: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        res.status(400).json({ error: err.message || "Registration failed" });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = signAccessToken(user.id, user.role as any);
        const refreshToken = await generateRefreshToken(user.id);

        return res.json({
            user: { id: user.id, name: user.name, email, role: user.role },
            token,
            refreshToken,
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                error: "Invalid input",
                details: err.issues.map((i) => ({
                    path: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        res.status(400).json({ error: err.message || "Login failed" });
    }
});

router.post("/refresh", async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });

        const stored = await verifyRefreshToken(refreshToken);
        if (!stored) return res.status(401).json({ error: "Invalid or expired refresh token" });

        const user = await User.findById(stored.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        await deleteRefreshToken(refreshToken);
        const newRefreshToken = await generateRefreshToken(user.id);

        const newAccessToken = signAccessToken(user.id, user.role as any);

        return res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to refresh token" });
    }
});

router.post("/logout", async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });

    await deleteRefreshToken(refreshToken);
    res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, async (req, res) => {
    const { userId } = req as AuthRequest;
    const user = await User.findById(userId).select("name email role createdAt");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

export default router;
