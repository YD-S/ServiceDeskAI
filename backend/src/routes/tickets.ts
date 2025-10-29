import { Router, Request, Response } from "express";
import { z } from "zod";
import Ticket from "../models/Ticket";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { AuthRequest } from "../types/AuthRequest";
import {analyzeImage} from "../utils/ai";

const router = Router();

const createTicketSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    media: z.array(z.string()).optional(),
    location: z
        .object({
            lat: z.number().optional(),
            lng: z.number().optional(),
        })
        .optional(),
});

const updateStatusSchema = z.object({
    status: z.enum(["open", "assigned", "in_progress", "closed"]),
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
    try {
        const { title, description, media, location } = createTicketSchema.parse(req.body);
        const { userId } = req as AuthRequest;

        const ticket = await Ticket.create({
            title,
            description,
            media,
            location,
            createdBy: userId,
        });

        if (media && media.length > 0) {
            const results = await Promise.allSettled(media.map(analyzeImage));

            const analyses = results
                .filter(r => r.status === "fulfilled" && r.value)
                .map(r => (r as PromiseFulfilledResult<string>).value);

            if (analyses.length > 0) {
                ticket.aiAnalysis = analyses.join("; ");
                await ticket.save();
            }
        }

        res.status(201).json(ticket);
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
        console.error("[Ticket] Creation failed:", err);
        res.status(500).json({ error: "Failed to create ticket" });
    }
});

router.get("/", requireAuth, async (req, res) => {
    const { userId, userRole } = req as AuthRequest;

    let query = {};
    if (userRole === "standard") {
        query = { createdBy: userId };
    }

    const tickets = await Ticket.find(query)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email");

    res.json(tickets);
});

router.get("/:id", requireAuth, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email");

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
});

router.patch("/:id/status", requireAuth, requireRole(["service_desk", "admin"]), async (req, res) => {
    try {
        const { status } = updateStatusSchema.parse(req.body);
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        res.json(ticket);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                error: "Invalid input",
                details: err.issues.map(i => ({
                    path: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        res.status(500).json({ error: "Failed to update ticket" });
    }
});

router.patch("/:id/assign", requireAuth, requireRole(["service_desk", "admin"]), async (req, res) => {
    const { userId } = req as AuthRequest;
    const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { assignedTo: userId, status: "in_progress" },
        { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
});

router.patch("/:id/close", requireAuth, requireRole(["service_desk", "admin"]), async (req, res) => {
    const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { status: "closed" },
        { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
});

router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json({ message: "Ticket deleted successfully" });
});

export default router;
