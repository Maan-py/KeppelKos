import express from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

import { authenticationToken, isAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.get("/", authenticationToken, isAdmin, async (req, res) => {
  try {
    const [totalRooms, availableRooms, occupiedRooms, maintenanceRooms, totalTenants] = await Promise.all([
      prisma.rooms.count(),
      prisma.rooms.count({ where: { status: "Available" } }),
      prisma.rooms.count({ where: { status: "Occupied" } }),
      prisma.rooms.count({ where: { status: "Maintenance" } }),
      prisma.users.count({ where: { role: "Tenant" } }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Data dashboard berhasil diambil",
      data: {
        rooms: {
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
        },
        tenants: {
          totalTenants,
        },
      },
    });
  } catch (error) {
    console.error("Gagal mengambil data dashboard: ", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data dashboard",
    });
  }
});

export default router;
