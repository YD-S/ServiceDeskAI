import { Router } from "express";
import User from "../models/User";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get("/users", requireAuth, requireRole(["admin"]), async (_req, res) => {
    const users = await User.find().select("name email role createdAt");
    res.json(users);
});

router.patch("/users/:id/role", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

export default router;
