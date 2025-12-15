# Panduan Menjalankan Aplikasi dengan Database (1 Jaringan)

Aplikasi ini sekarang menggunakan Backend (Node.js) dan Database (SQLite) agar datanya tersimpan dan bisa diakses dari komputer lain dalam 1 jaringan/WiFi.

## 1. Menjalankan Server (Backend)
Server bertugas menyimpan data dan melayani permintaan dari aplikasi.
1.  Buka Terminal baru.
2.  Masuk ke folder server: `cd server`
3.  Jalankan server: `node index.js`
    -   Anda akan melihat pesan: `Server running on http://0.0.0.0:3001`
    -   Database akan dibuat otomatis di `server/bengkel.db`.

**Catatan:** Agar komputer lain bisa mengakses, pastikan Firewall di laptop ini mengizinkan koneksi ke port 3001 dan 5173 (Port aplikasi).

## 2. Menjalankan Aplikasi (Frontend)
1.  Buka Terminal lain (di folder utama `bengkel-motor`).
2.  Jalankan aplikasi seperti biasa: `npm run dev`
    -   Akan berjalan di `http://localhost:5173`

## 3. Akses dari Komputer Lain/HP
Untuk membuka aplikasi di HP atau laptop lain dalam WiFi yang sama:
1.  Pastikan `npm run dev` dijalankan dengan host network, yaitu: `npm run dev -- --host` (atau update package.json).
2.  Cek IP Address komputer server ini (misal: `192.168.1.10`).
    -   Di Command Prompt ketik: `ipconfig`
3.  Di HP/Laptop lain, buka browser dan ketik: `http://192.168.1.10:5173`

**Penting:**
Saat merestart komputer, data tidak akan hilang karena sudah tersimpan di file `server/bengkel.db`.
