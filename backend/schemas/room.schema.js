import { z } from "zod";

const statusEnum = z.enum(["Available", "Occupied", "Maintenance"], {
  required_error: "Status kamar wajib diisi!",
  invalid_type_error: "Status tidak valid! Pilih Available, Occupied, atau Maintenance.",
});

const bathroomTypeEnum = z.enum(["Dalam", "Luar"], {
  required_error: "Tipe kamar mandi wajib diisi!",
  invalid_type_error: "Status tidak valid! Pilih Dalam atau Luar!",
});

export const createRoomSchema = z.object({
  roomNumber: z.string().trim().min(3, "Nomor kamar wajib diisi"),
  floor: z.coerce.number().int("Lantai harus berupa angka bulat"),
  bathroomType: bathroomTypeEnum,
  price: z.coerce.number().nonnegative("Harga kamar tidak boleh minus"),
  status: statusEnum.optional(),
});

export const updateRoomSchema = z.object({
  roomNumber: z.string().trim().min(3, "Nomor kamar wajib diisi").optional(),
  floor: z.coerce.number().int("Lantai harus berupa angka bulat").optional(),
  bathroomType: bathroomTypeEnum,
  price: z.coerce.number().nonnegative("Harga kamar tidak boleh minus").optional(),
  status: statusEnum.optional(),
});

export const roomParamsSchema = z.object({
  id: z.string().min(3, "Parameter nomor kamar tidak valid"),
});
