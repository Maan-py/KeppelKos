# [📂] Requirements: KosKeppel v1.0

## 📝 SRS (Software Requirements Specification) & SKPL

### Deskripsi Produk

Sistem manajemen kos mandiri untuk 13 kamar kosongan.

- **Tipe A:** KM Dalam (550rb)
- **Tipe B:** KM Luar (450rb)

### Fitur Utama (Functional Requirements)

- [ ] **Public:** Denah visual interaktif (Map) untuk cek ketersediaan.
- [ ] **Admin:** Pendaftaran penghuni manual & Verifikasi pembayaran.
- [ ] **Tenant:** Digital Rules & Upload Bukti Bayar (Auto-Compress).

### Kebutuhan Non-Fungsional

- **Biaya:** Rp 0 (Free Tier).
- **Security:** Data isolation antar penghuni.

## 🔄 DFD (Data Flow Diagram) - Level 0

- **Guest:** Request Data Kamar -> Sistem -> Tampilkan Status Kamar (Visual).
- **Tenant:** Login -> Upload Struk -> Sistem -> Simpan ke Storage & Database.
- **Admin:** Login -> Cek Struk -> Approve/Reject -> Sistem -> Update Status Kamar & Log.

## ⚙️ Metodologi Pengembangan (SDLC)

Proyek ini menggunakan metode **Agile Iterative** dengan pembagian tugas sebagai berikut:

1. **Planning & Analysis:** Mendefinisikan SRS dan ERD (Sedang berjalan).
2. **Design:** Membuat Wireframe dan Schema Database.
3. **Implementation (Sprints):** Koding fitur per fitur (Denah -> Auth -> Payment).
4. **Testing:** Audit keamanan RLS dan validasi input.
5. **Deployment:** Go-live ke Vercel.
6. **Review:** Evaluasi fitur berdasarkan kebutuhan Owner Kos.
