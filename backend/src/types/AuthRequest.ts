import { Request } from "express";
import { Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    userId: string;
    userRole: "standard" | "service_desk" | "admin";
}

export type AuthenticatedHandler = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => Promise<void> | void;
