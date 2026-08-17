import { z } from "zod";

const paymentStatusEnum = z.enum(["Verified", "Rejected", "Pending"], {
  required_error: "Status pembayaran wajib diisi!",
  invalid_type_error: "Status tidak valid! Pilih Verified, Rejected, atau Pending!",
});

export const uploadPaymentSchema = z.object({
  amount: z.coerce
    .bigint({
      invalid_type_error: "Amount harus berupa angka bulat",
    })
    .nonnegative("Amount tidak boleh negatif"),
});

export const verifyPaymentSchema = z.object({
  status: paymentStatusEnum,
});
