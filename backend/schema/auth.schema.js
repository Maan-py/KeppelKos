import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(4, "Username minimal 4 karakter").max(15, "Username maksimal 15 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  fullName: z.string().trim().min(5, "Nama lengkap minimal 5 karakter"),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Nomor HP minimal 10 digit")
    .regex(/^[0-9]+$/, "Nomor HP hanya boleh berisi angka"),
  emergencyContact: z
    .string()
    .trim()
    .min(10, "Nomor HP darurat minimal 10 digit")
    .regex(/^[0-9]+$/, "Nomor HP darurat hanya boleh berisi angka").optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Username/Email minimal 3 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
