import { randomBytes } from "crypto";
import RefreshToken from "../models/RefreshToken";

const REFRESH_EXPIRY_DAYS = 7;

export async function generateRefreshToken(userId: string) {
    const token = randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await RefreshToken.create({ userId, token, expiresAt });
    return token;
}

export async function verifyRefreshToken(token: string) {
    const existing = await RefreshToken.findOne({ token });
    if (!existing || existing.expiresAt < new Date()) {
        return null;
    }
    return existing;
}

export async function deleteRefreshToken(token: string) {
    await RefreshToken.deleteOne({ token });
}
