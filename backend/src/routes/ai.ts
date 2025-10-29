import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/auth";

const router = Router();

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

        const response = await fetch("http://stable-diffusion.42malaga.com:7860/interrogator/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: `data:image/jpeg;base64,${imageBase64}` }),
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: "AI service error", details: errText });
        }

        const data = await response.json();
        res.json({ analysis: data });
    } catch (err: any) {
        console.error("AI analysis error:", err);
        res.status(500).json({ error: "Internal error", details: err.message });
    }
});

export default router;
