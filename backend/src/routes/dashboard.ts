import { Router } from "express";
import Ticket from "../models/Ticket";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get("/stats", requireAuth, requireRole(["service_desk", "admin"]), async (_req, res) => {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "open" });
    const inProgress = await Ticket.countDocuments({ status: "in_progress" });
    const closed = await Ticket.countDocuments({ status: "closed" });

    res.json({
        total,
        open,
        inProgress,
        closed,
    });
});

router.get("/recent", requireAuth, requireRole(["service_desk", "admin"]), async (_req, res) => {
    const recent = await Ticket.find().sort({ createdAt: -1 }).limit(5);
    res.json(recent);
});

export default router;
