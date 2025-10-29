import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import axios from "axios";
import { requireAuth } from "../middleware/auth";

const router = Router();

const AI_URL =
    process.env.AI_URL;

router.post("/analyze", requireAuth, async (req: Request, res: Response) => {
    try {
        const { fileUrl } = req.body;
        if (!fileUrl) {
            return res.status(400).json({ error: "Missing fileUrl" });
        }

        const localPath = path.join(process.cwd(), fileUrl);
        if (!fs.existsSync(localPath)) {
            return res.status(404).json({ error: "File not found" });
        }

        const imageBase64 = fs.readFileSync(localPath, { encoding: "base64" });

        console.log("[AI] Sending image for analysis:", localPath);

        const { data } = await axios.post(
            AI_URL!,
            { image: `data:image/jpeg;base64,${imageBase64}` },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 15000,
            }
        );

        console.log("[AI] Analysis successful:", data);

        res.json({ analysis: data });
    } catch (err: any) {
        console.error("AI analysis error:", err);

        if (axios.isAxiosError(err)) {
            const status = err.response?.status || 500;
            const details = err.response?.data || err.message;
            return res.status(status).json({
                error: "AI service error",
                details,
            });
        }

        res.status(500).json({
            error: "Internal error",
            details: err?.message || "Unknown error",
        });
    }
});

export default router;
