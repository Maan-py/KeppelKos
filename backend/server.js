import express, { json } from "express";
import cors from "cors";
import { hash, compare } from "bcrypt";
import "dotenv/config";

import jwt from "jsonwebtoken";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;
// const prisma = new PrismaClient();

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "API successfully running",
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;

    if (!username || !email || !password || !fullName || !phoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "Semua field wajib diisi",
      });
    }

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
        role: "tenant",
      },
    });

    res.status(201).json({
      status: "success",
      message: "Registrasi berhasil",
      data: {
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        phoneNumber: newUser.phone_number,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error saat registrasi: ", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi error saat registrasi",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        status: "error",
        message: "Username/Email dan Password wajib diisi",
      });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      res.status(401).json({
        status: "error",
        message: "Email/Username atau Password salah",
      });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
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
    res.status(500).json({
      status: "error",
      message: "Terjadi error saat login",
    });
  }
});

app.get("/api/rooms", (req, res) => {
  res.json([
    {
      id: "uuid-1",
      roomNumber: "101",
      status: "available",
      price: 400000,
    },
    {
      id: "uuid-2",
      roomNumber: "102",
      status: "occupied",
      price: 500000,
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});
