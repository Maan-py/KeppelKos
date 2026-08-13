import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { loginLimiter } from "../middlewares/rateLimit.js";
import { authenticationToken, isAdmin } from "../middlewares/auth.js";

import express from "express";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.post("/register", authenticationToken, isAdmin, validate(registerSchema), async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber, emergencyContact } = req.body;

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Username atau email sudah digunakan",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        full_name: fullName,
        phone: phoneNumber,
        role: "Tenant",
        emergency_contact: emergencyContact,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Registrasi berhasil",
      data: {
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        phoneNumber: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error saat registrasi: ", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi error saat registrasi",
    });
  }
});

router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.users.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Email/Username atau Password salah",
      });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Email/Username atau Password salah",
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error saat login: ", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi error saat login",
    });
  }
});

export default router;
