import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { env } from "./utils/env";
import authRoutes from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req , res) => res.send("ServiceDeskAI Backend is running 🚀"));
app.use("/api/auth", authRoutes);

connectDB();

app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
});
