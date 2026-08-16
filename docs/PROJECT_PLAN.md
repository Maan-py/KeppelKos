# 🏠 KosKeppel v1.0 - Project Documentation

> **Konsep:** Sistem Manajemen Kos Mandiri (Kosongan)  
> **Target:** 13 Kamar (Lt.1: 12, Lt.2: 1)  
> **Status:** Fase 1 - Perancangan Sistem

---

## 📋 1. SKPL / SRS (Software Requirements Specification)

### Kebutuhan Fungsional (FR)

- **FR-01:** Denah kamar visual (Interaktif) untuk cek ketersediaan.
- **FR-02:** Admin mendaftarkan penghuni secara manual (No Public Register).
- **FR-03:** Penghuni upload bukti bayar via web.
- **FR-04:** Fitur **Auto-Compression** untuk setiap gambar yang diupload.
- **FR-05:** Dashboard monitoring "Lunas vs Nunggak" per bulan.
- **FR-06:** Audit Log untuk mencatat setiap aktivitas Admin.

### Kebutuhan Non-Fungsional (NFR)

- **NFR-01:** Keamanan data menggunakan **JWT**, middleware authorization, dan validasi akses per resource.
- **NFR-02:** Biaya operasional rendah (free tier / low-cost hosting untuk frontend, backend, dan database).
- **NFR-03:** Responsif (Bisa dibuka lancar di HP penghuni).

---

## 🏗️ 2. Arsitektur & Desain Sistem

### Data Flow Diagram (DFD) - Level 0

1. **Guest** --> Request Data Kamar --> **Sistem** --> Tampilkan Denah Visual.
2. **Tenant** --> Kirim Bukti Bayar --> **Sistem** --> Simpan di Storage & DB.
3. **Admin** --> Verifikasi Bayar --> **Sistem** --> Update Status Kamar & Log.

### Entity Relationship Diagram (ERD) / RAT

```mermaid
erDiagram
    ROOMS ||--o| PROFILES : "occupied_by"
    PROFILES ||--o{ PAYMENTS : "makes"
    PROFILES ||--o{ SYSTEM_LOGS : "action_by"

    ROOMS {
        uuid id PK
        string room_number
        string bathroom_type "dalam/luar"
        bigint price
        enum status "available/occupied"
    }
    PROFILES {
        uuid id PK "FK to Users"
        string full_name
        uuid room_id FK
        int due_date
        enum role "admin/tenant"
    }
```

---

## 🛠️ 3. Tech Stack Lengkap

- **Front-End:** Vue 3 (Composition API) + Vite + TypeScript.
- **State Management:** Pinia.
- **Routing:** Vue Router.
- **Back-End:** Node.js + Express.js.
- **Database:** PostgreSQL (dihost di Neon) + Neon Object Storage (bukti bayar).
- **Auth:** JWT di backend.
- **UI:** Tailwind CSS + Lucide Icons.
- **Security:** UUID, JWT, middleware authorization, Zod (Validation), Browser-Image-Compression.

---

## 🛡️ 4. Security Journal (Cybersecurity Focus)

- **Anti-IDOR:** Menggunakan UUID agar user tidak bisa menebak ID transaksi orang lain.
- **Database Hardening:** Konsistensi data dijaga di service layer/backend dan transaksi SQL, bukan triggers otomatis.
- **Privacy:** Data penghuni tidak akan di-_fetch_ ke halaman Landing Page (Guest).

---

## 📅 5. Roadmap 6 Bulan

| Bulan   | Fokus         | Output                                                                     |
| :------ | :------------ | :------------------------------------------------------------------------- |
| **1**   | **Architect** | SRS, SKPL, DFD, ERD, Wireframe, Setup DB.                                  |
| **2-3** | **Frontend**  | Slicing Landing Page & Room Map (Static) dengan Vue 3.                     |
| **4-5** | **Fullstack** | Auth, REST API, Payment Upload, Admin Dashboard, validasi, dan middleware. |
| **6**   | **Guardian**  | Security Audit, PenTesting, Deployment frontend/backend.                   |

---

## 🎨 6. Wireframe Concept (Simple)

### Landing Page

```text
[ Logo KosKeppel ]          [ Login ]
-------------------------------------
"Kamar Mandi Dalam: 550rb | Luar: 450rb"

[ 101 ] [ 102 ] [ 103 ] [ 104 ]  <-- Hijau/Merah
[ 105 ] [ 106 ] [ 107 ] [ 108 ]
...
```

---
