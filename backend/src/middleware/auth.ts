import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing token" });
        return;
    }

    const token = header.substring(7);

    try {
        const payload = verifyToken(token);
        (req as any).userId = payload.sub;
        (req as any).userRole = payload.role;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
