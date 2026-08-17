import { z } from "zod";

export const assignUserRoomSchema = z.object({
  room_id: z
    .string({
      required_error: "Parameter nomor kamar tidak valid",
      invalid_type_error: "Parameter nomor kamar tidak valid",
    })
    .trim()
    .min(3),
});
