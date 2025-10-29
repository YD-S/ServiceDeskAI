import fs from "fs";
import path from "path";
import axios from "axios";

const AI_URL = process.env.AI_URL;

export async function analyzeImage(fileUrl: string): Promise<string | null> {
    try {
        const localPath = path.join(process.cwd(), fileUrl);
        if (!fs.existsSync(localPath)) {
            console.warn("[AI] File not found:", localPath);
            return null;
        }

        const imageBase64 = fs.readFileSync(localPath, { encoding: "base64" });
        const payload = { image: `data:image/jpeg;base64,${imageBase64}` };

        console.log("[AI] Sending image for analysis:", fileUrl);

        const res = await axios.post(AI_URL!, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
        });

        if (!res || !res.data) {
            console.error("[AI] Empty response from service");
            return null;
        }

        const result =
            typeof res.data === "string" ? res.data : JSON.stringify(res.data);

        console.log("[AI] Analysis successful:", result);
        return result;
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
            console.error("[AI] Axios error:", err.response?.data || err.message);
        } else {
            console.error("[AI] Unexpected error:", err);
        }
        return null;
    }
}
