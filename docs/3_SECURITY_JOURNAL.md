# [🛡️] Security Journal

### 🔑 UUID (Universally Unique Identifier)
**Alasan:** Menghindari serangan **IDOR**. Jika ID berupa angka (1, 2, 3), hacker bisa menebak URL data orang lain. Dengan UUID, ID menjadi string acak yang tidak bisa ditebak.

### 💂 RLS (Row Level Security)
**Alasan:** Satpam di level database. Memastikan Tenant A tidak bisa melihat nominal atau bukti bayar Tenant B melalui API, meskipun mereka tahu URL-nya.

### 🖼️ Image Sanitization & Compression
**Alasan:** Menghapus metadata (EXIF) foto yang mungkin berisi lokasi GPS penghuni dan mengecilkan ukuran file agar tidak membebani storage gratisan Supabase.