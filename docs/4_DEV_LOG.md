# 📅 [KANBAN & LEARNING LOG] KosKeppel Master Plan

**Metodologi:** Agile Iterative (Sprint-based)
**Legend:** `[ ]` (Backlog), `[/]` (In Progress), `[x]` (Done)

---

## 🟦 FASE 1: Architect & System Design (Bulan 1)

> **Tujuan:** Membangun "Cetak Biru" (Blueprint) teknis agar koding tidak asal-asalan dan database aman dari kebocoran data.
> **Role:** _System Analyst_ & _Database Architect_.
> **Pre-Req:** Logika dasar (If/Else) & Konsep Tabel (Excel-like).

- [X] **ST-01:** Finalisasi Branding & Konsep Bisnis (**KosKeppel**).
- [X] **ST-02:** Penentuan Metodologi SDLC (**Agile Iterative**).
- [X] **ST-03:** Pembuatan Dokumen **SRS & SKPL** (Daftar Fitur & Janji Sistem).
- [ ] **ST-04:** Perancangan **ERD / RAT** (Relasi Antar Tabel Database).
- [ ] **ST-05:** Perancangan **DFD Level 0 & 1** (Alur Data User & Admin).
- [ ] **ST-06:** Desain **Wireframe Low-Fi** (Sketsa Kasar Tata Letak Halaman).

**📚 Apa yang Dipelajari?**

1. **Relational Database:** Cara menghubungkan data antar tabel (Foreign Keys).
2. **SDLC Management:** Cara membagi proyek besar menjadi tugas kecil yang terukur.
3. **Data Security Design:** Belajar konsep **UUID** vs **Serial ID** untuk mencegah serangan IDOR.

**🔗 Sumber Belajar:**

- YouTube: _Programmer Zaman Now_ (Basis Data Dasar).
- [Supabase Documentation: Database Design](https://supabase.com/docs/guides/database).

---

## 🟨 FASE 2: Frontend Cook (Bulan 2-3)

> **Tujuan:** Mengubah sketsa Wireframe menjadi tampilan web yang interaktif, responsif, dan nyaman dipandang.
> **Role:** _Frontend Developer_ & _UI/UX Designer_.
> **Pre-Req:** Dasar HTML & CSS.

- [ ] **FE-01:** Setup Project **Next.js 15** + TypeScript + Tailwind CSS.
- [ ] **FE-02:** Integrasi **Shadcn/UI** (Komponen standar industri: Button, Input, Modal).
- [ ] **FE-03:** Slicing **Landing Page Hero Section** (Branding & Info Harga).
- [ ] **FE-04:** Pembuatan **Interactive Room Map** (Grid 13 Kamar dengan status warna).
- [ ] **FE-05:** Slicing **Dashboard Tenant** & **Admin** (Tampilan Statis).

**📚 Apa yang Dipelajari?**

1. **Next.js App Router:** Konsep Routing modern (`layout.tsx`, `page.tsx`).
2. **Tailwind CSS:** _Utility-first styling_ agar desain cepat dan konsisten.
3. **TypeScript:** Belajar mendefinisikan tipe data agar koding tidak banyak error (Type Safety).

**🔗 Sumber Belajar:**

- [Next.js Official Learn Course](https://nextjs.org/learn).
- YouTube: _Sandhika Galih (WPU)_ - Playlist Tailwind CSS.

---

## 🟧 FASE 3: Fullstack Mechanic (Bulan 4-5)

> **Tujuan:** Menghidupkan aplikasi dengan menghubungkan Tampilan ke Database (Koneksi API & Logika Bisnis).
> **Role:** _Backend Developer_ & _Fullstack Engineer_.
> **Pre-Req:** JavaScript Modern (Async/Await & Fetch).

- [ ] **FS-01:** Setup **Supabase Client SDK** di Next.js.
- [ ] **FS-02:** Implementasi **Supabase Auth** (Login/Logout Multi-role).
- [ ] **FS-03:** CRUD Logic (Menarik data kamar real-time & simpan bukti bayar).
- [ ] **FS-04:** Logic **Image Compression** di Browser (Hemat Storage).
- [ ] **FS-05:** Pembuatan **PostgreSQL Triggers** (Automasi status kamar di database).

**📚 Apa yang Dipelajari?**

1. **BaaS (Backend as a Service):** Cara pakai Supabase tanpa harus buat server dari nol.
2. **Server Actions:** Mengirim data dari form ke database dengan aman.
3. **Trigger & Functions:** Belajar bahasa **PL/pgSQL** untuk automasi internal database.

**🔗 Sumber Belajar:**

- YouTube: _The Net Ninja_ (Next.js & Supabase Series).
- [NPM: browser-image-compression](https://www.npmjs.com/package/browser-image-compression).

---

## 🟥 FASE 4: Guardian & Deployment (Bulan 6)

> **Tujuan:** Mengunci keamanan sistem agar tidak bisa dibobol dan menampilkannya ke internet (Go Live).
> **Role:** _Cybersecurity Engineer_ & _DevOps_.
> **Pre-Req:** Paham risiko dasar Web (OWASP Top 10).

- [ ] **SEC-01:** Implementasi **Row Level Security (RLS)** yang ketat di Supabase.
- [ ] **SEC-02:** Skema Validasi Form dengan **Zod** (Anti-Injection).
- [ ] **SEC-03:** Audit Keamanan internal (Simulasi serangan IDOR).
- [ ] **DEP-01:** Deployment Production ke **Vercel**.
- [ ] **DEP-02:** Konfigurasi Domain & SSL.

**📚 Apa yang Dipelajari?**

1. **RLS Policies:** Cara membuat "Satpam" di level database agar data penghuni tidak bocor.
2. **Web Security Audit:** Cara mencari celah keamanan di aplikasi sendiri.
3. **CI/CD Dasar:** Otomatisasi update web setiap kali kamu _push_ kode ke GitHub.

**🔗 Sumber Belajar:**

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security).
- [Zod Documentation](https://zod.dev/).

---

### 💡 Tips Pro-Developer:

- **Log Harian:** Setiap kali kamu selesai belajar materi baru (misal: Tailwind), tulis 1 kalimat kesimpulan di bawah Fase terkait. Ini "mahal" harganya saat kamu ditanya saat _interview_ kerja.
- **GitHub Commits:** Selalu sertakan ID tugas. Contoh: `git commit -m "feat(FE-04): create interactive grid for room map"`.
