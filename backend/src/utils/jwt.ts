import jwt from "jsonwebtoken";
import { env } from "./env";

export type UserRole = "standard" | "service_desk" | "admin";

export interface JwtPayload {
    sub: string;
    role: UserRole;
}

export const signAccessToken = (userId: string, role: UserRole) =>
    jwt.sign({ role }, env.JWT_SECRET!, {
        subject: userId,
        expiresIn: "1d",
    });

export const verifyToken = (token: string): JwtPayload =>
    jwt.verify(token, env.JWT_SECRET!) as JwtPayload;
