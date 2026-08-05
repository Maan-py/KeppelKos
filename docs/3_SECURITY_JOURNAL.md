# [🛡️] Security Journal

### 🔑 UUID (Universally Unique Identifier)

**Alasan:** Menghindari serangan **IDOR**. Jika ID berupa angka (1, 2, 3), hacker bisa menebak URL data orang lain. Dengan UUID, ID menjadi string acak yang tidak bisa ditebak.

### 🔐 JWT + Authorization Middleware

**Alasan:** Backend Express wajib memverifikasi token dan memeriksa kepemilikan resource sebelum mengirim data. Dengan cara ini, Tenant A tetap tidak bisa melihat nominal atau bukti bayar Tenant B walaupun tahu URL endpoint-nya.

### 🖼️ Image Sanitization & Compression

**Alasan:** Menghapus metadata (EXIF) foto yang mungkin berisi lokasi GPS penghuni dan mengecilkan ukuran file agar tidak membebani storage gratisan Supabase.
