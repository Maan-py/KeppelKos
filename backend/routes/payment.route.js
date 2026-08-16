import express from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { uploadPaymentProof } from "../middlewares/upload.js";
import { uploadPaymentSchema, verifyPaymentSchema } from "../schemas/payment.schema.js";
import { getFileUrlFromNeon, uploadToNeon } from "../services/storage.service.js";
import { authenticationToken, isAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.post("/", authenticationToken, uploadPaymentProof.single("paymentProof"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Bukti pembayaran  wajib diunggah",
      });
    }

    const validatedData = uploadPaymentSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        status: "error",
        message: validatedData.error.issues[0].message,
      });
    }

    const { amount } = validatedData.data;
    const userId = req.user.userId;

    const uploadedFile = await uploadToNeon(req.file);

    const newPayment = await prisma.payments.create({
      data: {
        user_id: userId,
        amount: BigInt(amount),
        proof_url: uploadedFile.key,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Bukti pembayaran berhasil diunggah!",
      data: {
        id: newPayment.id,
        amount: newPayment.amount.toString(),
        proofUrl: newPayment.proof_url,
        status: newPayment.status,
      },
    });
  } catch (error) {
    console.error("Error upload payment: ", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server saat memproses pembayaran.",
    });
  }
});

router.get("/", authenticationToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    const payments = await prisma.payments.findMany({
      where: role === "Admin" ? {} : { user_id: userId },
      orderBy: {
        created_at: "desc",
      },

      include: {
        users: {
          select: { username: true, room_id: true },
        },
      },
    });

    const formattedPayments = await Promise.all(
      payments.map(async (payment) => {
        const presignedUrl = await getFileUrlFromNeon(payment.proof_url);
        return {
          id: payment.id,
          amount: payment.amount.toString(),
          status: payment.status,
          createdAt: payment.created_at,
          imageUrl: presignedUrl,
          tenantName: payment.users.name,
          roomId: payment.users.room_id,
        };
      }),
    );

    res.status(200).json({
      status: "success",
      message: "Daftar pembayaran berhasil diambil",
      data: formattedPayments,
    });
  } catch (error) {
    console.error("Error fetching payments: ", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server saat mengambil daftar pembayaran.",
    });
  }
});

router.patch("/:id/verify", authenticationToken, isAdmin, validate(verifyPaymentSchema), async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { status } = req.body;

    const payment = await prisma.payments.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        users: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Pembayaran tidak ditemukan",
      });
    }

    const transactionOperations = [];

    transactionOperations.push(
      prisma.payments.update({
        where: {
          id: paymentId,
        },
        data: {
          status: status,
        },
      }),
    );

    if (status === "Verified" && payment.users.room_id) {
      transactionOperations.push(
        prisma.rooms.update({
          where: {
            id: payment.users.room_id,
          },
          data: {
            status: "Occupied",
          },
        }),
      );
    }

    await prisma.$transaction(transactionOperations);
    res.status(200).json({
      status: "success",
      message: `Pembayaran berhasil di-set menjadi ${status}!`,
    });
  } catch (error) {
    console.error("Error verify payment: ", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memverifikasi pembayaran.",
    });
  }
});

export default router;
