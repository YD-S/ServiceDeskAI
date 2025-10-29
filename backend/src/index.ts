import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { env } from "./utils/env";
import authRoutes from "./routes/auth";
import ticketRoutes from "./routes/tickets";
import uploadRoutes from "./routes/uploads";
import aiRoutes from "./routes/ai";
import dashboardRoutes from "./routes/dashboard";
import adminRoutes from "./routes/admin";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req , res) => res.send("ServiceDeskAI Backend is running 🚀"));
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/ai.ts", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDB();

app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
});
