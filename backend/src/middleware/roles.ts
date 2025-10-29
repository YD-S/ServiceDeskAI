import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthRequest } from "../types/AuthRequest";

export function requireRole(roles: ("admin" | "service_desk" | "standard")[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { userRole } = req as AuthRequest;

        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ error: "Forbidden: insufficient role" });
            return;
        }

        next();
    };
}
