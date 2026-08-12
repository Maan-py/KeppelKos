import { authenticationToken, isAdmin } from "./middleware/auth.js";
import { validate } from "./middleware/validate.js";
import { createRoomSchema, updateRoomSchema } from "./schema/room.schema.js";
import { registerSchema, loginSchema } from "./schema/auth.schema.js";

import express, { json } from "express";
import cors from "cors";
import { hash, compare } from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;
// const prisma = new PrismaClient();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Terlalu banyak request, coba lagi nanti!",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: "error", message: "Terlalu banyak percobaan login, coba lagi nanti." },
});

app.use(limiter);
app.use(cors(corsOptions));
app.use(json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "API successfully running",
  });
});

app.post("/api/auth/register", authenticationToken, isAdmin, validate(registerSchema), async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber, emergencyContact } = req.body;

    // if (!username || !email || !password || !fullName || !phoneNumber) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Semua field wajib diisi",
    //   });
    // }

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

app.post("/api/auth/login", loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // if (!identifier || !password) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Username/Email dan Password wajib diisi",
    //   });
    // }

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

app.post("/api/rooms", authenticationToken, isAdmin, validate(createRoomSchema), async (req, res) => {
  try {
    const { roomNumber, floor, bathroomType, price, status } = req.body;

    const newRoom = await prisma.rooms.create({
      data: {
        room_number: roomNumber,
        floor: parseInt(floor),
        bathroom_type: bathroomType,
        price: BigInt(price),
        status: status,
      },
    });

    const serializedRoom = {
      ...newRoom,
      price: Number(newRoom.price),
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

app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await prisma.rooms.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const serializedRooms = rooms.map((room) => {
      return {
        ...room,
        price: Number(room.price),
      };
    });

    res.status(200).json({
      data: serializedRooms,
    });
  } catch (error) {
    console.log("Error saat mengambil data kamar: ", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data kamar",
    });
  }
});

app.get("/api/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.rooms.findUnique({
      where: {
        id: id,
      },
    });

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Kamar tidak ditemukan",
      });
    }

    res.status(200).json({
      data: {
        ...room,
        price: Number(room.price),
      },
    });
  } catch (error) {
    {
      console.log("Error saat mengambil data kamar: ", error);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data kamar",
      });
    }
  }
});

app.put("/api/rooms/:id", authenticationToken, isAdmin, validate(updateRoomSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, floor, bathroomType, price, status } = req.body;

    const room = await prisma.rooms.findUnique({
      where: {
        id: id,
      },
    });

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Kamar tidak ditemukan",
      });
    }

    // const validBathroomType = ["Dalam", "Luar"];

    // if (bathroomType && !validBathroomType.includes(bathroomType)) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Tipe kamar mandi tidak valid! Hanya boleh diisi 'Dalam' atau 'Luar'",
    //   });
    // }

    // const validStatuses = ["Available", "Occupied", "Maintenance"];

    // if (status && !validStatuses.includes(status)) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Status kamar tidak valid! Hanya boleh diisi 'Available', 'Occupied, atau 'Maintenance'",
    //   });
    // }

    const updatedRoom = await prisma.rooms.update({
      where: {
        id: id,
      },
      data: {
        room_number: roomNumber || room.room_number,
        bathroom_type: bathroomType || room.bathroom_type,
        status: status || room.status,
        floor: floor !== undefined ? Number(floor) : room.floor,
        price: price !== undefined ? Number(price) : room.price,
      },
    });

    const serializedRoom = {
      ...updatedRoom,
      price: Number(updatedRoom.price),
    };

    res.status(200).json({
      status: "success",
      message: "Data kamar berhasil diperbarui",
      data: serializedRoom,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        status: "error",
        message: "Nomor kamar tersebut sudah terdaftar! Gunakan nomor lain.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui data kamar",
    });
  }
});

app.delete("/api/rooms/:id", authenticationToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.rooms.findUnique({
      where: {
        id: id,
      },
    });

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Kamar tidak ditemukan",
      });
    }

    await prisma.rooms.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Data kamar berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Kamar tidak ditemukan! Mungkin sudah dihapus sebelumnya.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Gagal menghapus data kamar",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});
