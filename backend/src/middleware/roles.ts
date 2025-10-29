import { Response, NextFunction } from "express";
import { UserRole } from "../utils/jwt";
import {AuthRequest} from "../types/AuthRequest";

export function requireRole(...allowed: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole) return res.status(401).json({ error: "Unauthorized" });
        if (!allowed.includes(req.userRole))
            return res.status(403).json({ error: "Forbidden" });
        next();
    };
}
