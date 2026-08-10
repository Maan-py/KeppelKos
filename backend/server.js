import { authenticationToken, isAdmin } from "./middleware/auth.js";

import express, { json } from "express";
import cors from "cors";
import { hash, compare } from "bcrypt";
import "dotenv/config";

import jwt from "jsonwebtoken";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

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
        role: "Tenant",
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
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

app.post("/api/rooms", authenticationToken, isAdmin, async (req, res) => {
  try {
    const { roomNumber, floor, bathroomType, price, status } = req.body;

    if (!roomNumber || floor == undefined || !bathroomType || price == undefined || !status) {
      return res.status(400).json({
        status: "error",
        message: "Semua field wajib diisi",
      });
    }

    const validBathroomType = ["Dalam", "Luar"];

    if (bathroomType && !validBathroomType.includes(bathroomType)) {
      return res.status(400).json({
        status: "error",
        message: "Tipe kamar mandi tidak valid! Hanya boleh diisi 'Dalam' atau 'Luar'",
      });
    }

    const validStatuses = ["Available", "Occupied", "Maintenance"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status kamar tidak valid! Hanya boleh diisi 'Available', 'Occupied, atau 'Maintenance'",
      });
    }

    const newRoom = await prisma.rooms.create({
      data: {
        room_number: roomNumber,
        floor: parseInt(floor),
        bathroom_type: bathroomType,
        price: BigInt(price),
        ...(status && { status }),
      },
    });

    const serializedRoom = {
      ...newRoom,
      price: newRoom.price.toString(),
    };

    res.status(201).json({
      status: "success",
      message: `Kamar ${roomNumber} berhasil ditambahkan!`,
      data: serializedRoom,
    });
  } catch (error) {
    console.error("Error tambah kamar: ", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        status: "error",
        message: "Nomor kamar sudah terdaftar",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Gagal menambahkan kamar",
    });
  }
});

app.get("/api/rooms", authenticationToken, (req, res) => {
  console.log("User yang sedang login: ", req.user);

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
