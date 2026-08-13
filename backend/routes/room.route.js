import { validate } from "../middlewares/validate.js";
import { loginLimiter } from "../middlewares/rateLimit.js";
import { authenticationToken, isAdmin } from "../middlewares/auth.js";

import express from "express";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { createRoomSchema, updateRoomSchema } from "../schemas/room.schema.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.post("/rooms", authenticationToken, isAdmin, validate(createRoomSchema), async (req, res) => {
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

router.get("/rooms", async (req, res) => {
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

router.get("/rooms/:id", async (req, res) => {
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

router.put("/rooms/:id", authenticationToken, isAdmin, validate(updateRoomSchema), async (req, res) => {
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

router.delete("/rooms/:id", authenticationToken, isAdmin, async (req, res) => {
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

export default router;
