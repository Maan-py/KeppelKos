import { authenticationToken, isAdmin } from "./middlewares/auth.js";
import { validate } from "./middlewares/validate.js";
import { createRoomSchema, updateRoomSchema } from "./schemas/room.schema.js";
import { registerSchema, loginSchema } from "./schemas/auth.schema.js";

import express, { json } from "express";
import cors from "cors";
import { hash, compare } from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";
import { globalLimiter } from "./middlewares/rateLimit.js";

import authRoutes from "./routes/auth.route.js";
import roomRoutes from "./routes/room.route.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(globalLimiter);
app.use(cors(corsOptions));
app.use(json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "API successfully running",
  });
});

app.listen(PORT, () => {
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});
