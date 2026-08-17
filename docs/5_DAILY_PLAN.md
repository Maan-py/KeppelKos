# 📅 Daily Plan: KeppelKos Backend → Frontend → Integrasi Fullstack

**Alokasi:** 1-2 jam/hari · **Estimasi total:** ~10 minggu
**Stack:** Backend Express + Prisma + PostgreSQL (Neon) · Frontend Vue 3 + Vite + TS + Tailwind + Pinia + Router
**Storage:** Neon Object Storage (bucket `bukti-bayar`, public_read)
**Legend:** `[ ]` Backlog · `[/]` In Progress · `[x]` Done

---

## 🟩 MINGGU 1 — Setup Neon Object Storage + Payment (Bukti Bayar)

- [x] **D1 — Setup Neon Object Storage + migrasi DB**
  - **Tetap pakai Neon** (batal pindah ke Supabase) — `DATABASE_URL` tidak berubah.
  - Aktifkan **Neon Object Storage** (beta, gratis; project sudah di region `us-east-2`).
  - Buat bucket `bukti-bayar` (**public_read** — baca publik, tulis pakai credential).
  - Buat credential `storage:write` via Neon API/Console → isi `AWS_ENDPOINT_URL_S3` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_REGION` di `.env`.
  - `prisma db push` + seed admin (DB tetap di Neon; tanpa keep-alive wajib, Neon auto-resume saat ada koneksi).
  - Buat `.env.example`.
  - Install `multer` + `@aws-sdk/client-s3` di `backend`.
- [x] **D2 — Upload helper**
  - Module upload ke Neon Object Storage (S3 client) + middleware multer (filter jpg/png/webp, limit 5MB, nama file acak + uuid).
- [x] **D3 — `POST /api/payments`**
  - Auth Tenant, upload bukti bayar → simpan `amount` + `proof_url` + status `Pending` ke tabel `payments`.
- [x] **D4 — `GET /api/payments` (tenant)**
  - Riwayat bayar user sendiri — **anti-IDOR**: paksa `user_id` dari token, bukan dari body/param.
- [x] **D5 — Admin: list + verifikasi**
  - `GET /api/payments` semua pembayaran + info user.
  - `PATCH /api/payments/:id` approve/reject (Verified → set kamar user `Occupied`) pakai `$transaction`.
- [x] **D6 — Uji e2e + docs**
  - Tes lengkap via Postman (upload → list → approve/reject), update collection + `docs/4_DEV_LOG.md`.

## 🟩 MINGGU 2 — Google OAuth (khusus Tenant)

- [ ] **D7 — Setup Google Cloud**
  - Buat OAuth Client ID, redirect URI `http://localhost:5000/api/auth/google/callback`, isi `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` di `.env`.
- [ ] **D8 — Schema + migrasi**
  - Tambah `google_id String? @unique` di model `users`, `prisma db push`.
- [ ] **D9 — `GET /api/auth/google`**
  - Redirect ke consent screen Google (manual OAuth flow, tanpa Passport).
- [ ] **D10 — `GET /api/auth/google/callback`**
  - Tukar code → token → userinfo, **upsert** user role `Tenant`, terbitkan JWT.
- [ ] **D11 — Edge cases**
  - Email sudah terdaftar → langsung login; gagal connect; redirect ke `FRONTEND_URL/?token=...`.
- [ ] **D12 — Uji e2e + docs**
  - Tes login via browser, update docs.

## 🟩 MINGGU 3 — Sanitasi Payload & Hardening

- [ ] **D13 — Middleware `sanitizePayload`**
  - Install `xss`, middleware rekursif strip HTML/script dari semua string `req.body`, pasang global di `server.js`.
- [ ] **D14 — Uji XSS**
  - Payload `<script>`, `<img onerror=...>` di semua endpoint.
- [ ] **D15 — `helmet` + limit body**
  - Pasang `helmet` + `express.json({ limit: "100kb" })`.
- [ ] **D16 — Fix bug `:id`**
  - Validasi format UUID di param, response `400` rapi, handler error Prisma konsisten (P2007/P2025).
- [ ] **D17 — Update `docs/3_SECURITY_JOURNAL.md`**
  - Dokumentasi perlindungan yang ditambah.

## 🟩 MINGGU 4 — Audit Log, Stats & Refactor Backend

- [ ] **D18 — Tabel `system_logs` + logging aksi admin**
  - Model + `prisma db push`, catat aksi admin (ubah kamar, verifikasi bayar).
- [ ] **D19 — `GET /api/logs` (admin)**
  - Endpoint lihat audit log.
- [/] **D20 — `GET /api/stats` (admin)**
  - Kamar terisi/kosong ✅, Lunas vs Nunggak per bulan ❌ (belum ada aggregate query).
- [ ] **D21 — Seed resmi + demo data**
  - `prisma/seed.js` + script `prisma db seed`: admin + 13 kamar + user contoh.
- [ ] **D22 — Refactor controller/service layer + `$transaction`**
  - Pisah logika dari route, `$transaction` untuk operasi multi-tabel.

## 🟦 MINGGU 5 — Setup Frontend + Landing Page

> Catatan: **UI component styling kamu tentukan sendiri nanti** (hindari AI slop) — plan ini fokus struktur & fungsionalitas.

- [ ] **D23 — Setup project**
  - Vue 3 + Vite + TS + Tailwind + Pinia + Router, folder structure (`views`, `components`, `stores`, `services`), `.env` (`VITE_API_URL`), Vite proxy ke backend.
- [ ] **D24 — API client + base layout**
  - `axios` instance (interceptor token + 401 auto-logout), layout navbar/footer.
- [ ] **D25 — Landing page**
  - Hero section + info harga tipe kamar.
- [ ] **D26 — Room map**
  - Grid 13 kamar, fetch `GET /api/rooms/rooms`, warna status (Hijau/Kuning/Merah).
- [ ] **D27 — Detail kamar**
  - Modal/kartu info kamar + CTA login.

## 🟦 MINGGU 6 — Auth Frontend

- [ ] **D28 — Login page**
  - Form identifier + password, hubungkan ke `POST /api/auth/login`.
- [ ] **D29 — Pinia auth store**
  - Login/logout, token di localStorage, `isAdmin`.
- [ ] **D30 — Route guards**
  - guest / tenant / admin.
- [ ] **D31 — Tombol "Login dengan Google"**
  - Link ke `GET /api/auth/google`, handle redirect `?token=...` di route `/`.
- [ ] **D32 — Register tenant (form admin) + halaman 404**

## 🟦 MINGGU 7 — Dashboard Tenant

- [ ] **D33 — Layout dashboard + sidebar tenant**
- [ ] **D34 — Upload bukti bayar**
  - Form (jumlah, pilih file, preview) + **kompresi `browser-image-compression`** → `POST /api/payments`.
- [ ] **D35 — Riwayat pembayaran**
  - `GET /api/payments` + badge status (Pending/Verified/Rejected).
- [ ] **D36 — Perapian UI tenant**
  - Loading state, toast sukses/gagal, validasi form.

## 🟦 MINGGU 8 — Dashboard Admin

- [ ] **D37 — Overview stats**
  - `GET /api/stats` (kamar terisi/kosong, lunas vs nunggak).
- [ ] **D38 — Manajemen kamar**
  - CRUD lengkap ke `/api/rooms/rooms`.
- [ ] **D39 — Verifikasi pembayaran**
  - Antrian list + approve/reject.
- [ ] **D40 — Audit log viewer + register tenant**
  - `GET /api/logs`, form register tenant (admin only).
- [ ] **D41 — Perapian UI admin + permission guard**

## 🟨 MINGGU 9 — Integrasi Fullstack & Polish

- [ ] **D42 — Uji alur end-to-end**
  - Admin daftarkan tenant → tenant login (manual & Google) → upload bayar → admin verifikasi → kamar `Occupied`.
- [ ] **D43 — Penanganan error terpusat**
  - Toast, retry, auto-logout saat token expired.
- [ ] **D44 — Responsif + aksesibilitas**
  - Mobile untuk penghuni, cek performa.
- [ ] **D45 — Update Postman collection + seed demo data lengkap**
- [ ] **D46 — Review keamanan akhir + update semua docs**
  - `PROJECT_PLAN.md`, `DEV_LOG.md`, `SECURITY_JOURNAL.md`.

## 🟨 MINGGU 10 — Buffer / Cadangan

- [ ] **D47–D50 — Slot cadangan**
  - Deployment (Vercel frontend + hosting backend), polish UI dengan components pilihan, dsb.

---

## 🔗 Catatan Integrasi Fullstack

1. **CORS:** Backend sudah siap — isi `FRONTEND_URL=http://localhost:5173` di `.env` backend saat frontend jalan.
2. **Vite proxy:** Arahkan `/api` → backend di dev agar tidak kena masalah CORS.
3. **Google OAuth:** callback redirect ke `FRONTEND_URL/?token=...`, frontend tangkap di route `/`.
4. **Anti-IDOR:** semua query tenant wajib mengambil `user_id` dari JWT token, bukan dari input user.

## 🛡️ Keep-Alive (Neon Free Tier)

Compute Neon **auto-suspend saat idle** dan **auto-resume saat ada koneksi** (berbeda dengan Supabase yang bisa pause 7 hari). Untuk menghindari cold start (request pertama lambat), bisa ping tiap 6-12 jam via **GitHub Actions cron** (`.github/workflows/keep-alive.yml`) ke database/endpoint backend. Alternatif: UptimeRobot free monitor.
