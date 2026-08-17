import express from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

import { authenticationToken, isAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { assignUserRoomSchema } from "../schemas/user.schema.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.get("/", authenticationToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: { role: "Tenant" },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        created_at: true,
        rooms: {
          select: {
            room_number: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      status: "success",
      message: "Data user berhasil diambil",
      data: users,
    });
  } catch (error) {
    console.log("Error saat mengambil data user: ", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data user",
    });
  }
});

router.get("/me", authenticationToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const userProfile = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        full_name: true,
        role: true,
        emergency_contact: true,

        rooms: {
          select: {
            room_number: true,
            floor: true,
            price: true,
            status: true,
            bathroom_type: true,
          },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        status: "error",
        message: "Data user tidak ditemukan",
      });
    }

    if (userProfile.rooms) {
      userProfile.rooms.price = Number(userProfile.rooms.price);
    }

    res.status(200).json({
      status: "success",
      message: "Data profil user berhasil diambil",
      data: userProfile,
    });
  } catch (error) {
    console.log("Error saat mengambil data profil user: ", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data profil user",
    });
  }
});

router.patch("/:id/checkout", authenticationToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    const targetUser = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        status: "error",
        message: "Data penghuni tidak ditemukan.",
      });
    }

    if (!targetUser.room_id) {
      return res.status(400).json({
        status: "error",
        message: "Penghuni ini tidak sedang menempati kamar manapun.",
      });
    }

    const roomId = targetUser.room_id;

    const transactionOperations = [];

    transactionOperations.push(
      prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          room_id: null,
        },
      }),
    );

    transactionOperations.push(
      prisma.rooms.update({
        where: {
          id: roomId,
        },
        data: {
          status: "Available",
        },
      }),
    );

    await prisma.$transaction(transactionOperations);

    res.status(200).json({
      status: "success",
      message: `Penghuni ${targetUser.username} berhasil di-checkout dari kamar.`,
    });
  } catch (error) {
    console.error("Error checkout penghuni:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memproses checkout penghuni.",
    });
  }
});

router.patch("/:id/assign-room", authenticationToken, isAdmin, validate(assignUserRoomSchema), async (req, res) => {
  try {
    const userId = req.params.id;
    const roomId = req.body.room_id;

    const targetUser = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        status: "error",
        message: "Data user tidak ditemukan",
      });
    }

    if (targetUser.role === "Admin") {
      return res.status(400).json({
        status: "error",
        message: "Admin tidak perlu di-assign ke kamar!",
      });
    }

    const targetRoom = await prisma.rooms.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!targetRoom) {
      return res.status(404).json({
        status: "error",
        message: "Data kamar tidak ditemukan",
      });
    }

    if (targetRoom.status !== "Available") {
      return res.status(400).json({
        status: "error",
        message: `Kamar nomor ${targetRoom.room_number} tidak tersedia untuk di-assign`,
      });
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        room_id: roomId,
      },

      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        room_id: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: `Kamar ${targetRoom.room_number} berhasil dihubungkan dengan penghuni ${updatedUser.username}!`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error assign room:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghubungkan kamar.",
    });
  }
});

export default router;
