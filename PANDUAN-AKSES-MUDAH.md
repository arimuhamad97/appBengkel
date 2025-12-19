# 🚀 Panduan Cepat Akses Aplikasi Bengkel

File-file helper ini dibuat untuk mempermudah akses aplikasi tanpa harus mengetik `http://192.168.1.100:5173` setiap kali.

## 📁 File-File Helper yang Tersedia

### 1. `buat-shortcut-client.bat`
**Fungsi:** Membuat shortcut di Desktop untuk akses cepat aplikasi

**Cara Pakai:**
1. Double-click file ini
2. Shortcut "Bengkel Motor" akan muncul di Desktop
3. Klik shortcut tersebut untuk membuka aplikasi

**Untuk Siapa:** Semua pengguna (kasir, mekanik, admin)

---

### 2. `setup-domain-lokal.bat`
**Fungsi:** Setup custom domain lokal agar bisa akses dengan `http://bengkel.local:5173`

**Cara Pakai:**
1. **Klik kanan** file ini
2. Pilih **"Run as administrator"** (PENTING!)
3. Ikuti instruksi di layar
4. Setelah selesai, aplikasi bisa diakses dengan `http://bengkel.local:5173`

**Catatan:** 
- Harus dijalankan di SETIAP komputer (server dan client)
- Memerlukan akses Administrator
- Hanya perlu dijalankan sekali per komputer

**Untuk Siapa:** Admin yang ingin setup domain lokal untuk semua komputer

---

### 3. `buka-bengkel-fullscreen.bat`
**Fungsi:** Membuka aplikasi dalam mode fullscreen (kiosk mode)

**Cara Pakai:**
1. Double-click file ini
2. Aplikasi akan terbuka fullscreen tanpa address bar
3. Tekan `F11` atau `Alt+F4` untuk keluar

**Tips Tambahan - Auto Start saat Windows Booting:**
1. Tekan `Win+R`, ketik `shell:startup`, tekan Enter
2. Copy file `buka-bengkel-fullscreen.bat` ke folder yang terbuka
3. Aplikasi akan otomatis buka fullscreen saat komputer dinyalakan

**Untuk Siapa:** Komputer kasir atau komputer yang khusus untuk aplikasi bengkel

---

### 4. `buka-bengkel-chrome.bat`
**Fungsi:** Membuka aplikasi dengan Google Chrome

**Cara Pakai:**
1. Double-click file ini
2. Aplikasi akan terbuka di Chrome

**Untuk Siapa:** Pengguna yang prefer Chrome

---

### 5. `buka-bengkel-edge.bat`
**Fungsi:** Membuka aplikasi dengan Microsoft Edge

**Cara Pakai:**
1. Double-click file ini
2. Aplikasi akan terbuka di Edge

**Untuk Siapa:** Pengguna yang prefer Edge

---

## ⚙️ Konfigurasi IP Server

**PENTING:** Sebelum menggunakan file-file di atas, pastikan IP server sudah benar!

Semua file di atas menggunakan IP default: `192.168.1.100`

Jika IP server Anda berbeda, edit file-file tersebut:
1. Klik kanan file `.bat` → **Edit**
2. Cari baris: `set IP_SERVER=192.168.1.100`
3. Ganti dengan IP server Anda, misalnya: `set IP_SERVER=192.168.1.50`
4. Simpan file (Ctrl+S)

---

## 🎯 Rekomendasi Setup Berdasarkan Kebutuhan

| Tipe Komputer | File yang Digunakan | Langkah Setup |
|---------------|---------------------|---------------|
| **Komputer Kasir** | `buka-bengkel-fullscreen.bat` | 1. Copy file ke folder Startup<br>2. Aplikasi auto-buka saat booting |
| **Komputer Mekanik** | `buat-shortcut-client.bat` | 1. Jalankan sekali<br>2. Gunakan shortcut di Desktop |
| **Komputer Admin** | `setup-domain-lokal.bat` + Bookmark | 1. Setup domain lokal<br>2. Buat bookmark di browser |
| **Semua Komputer** | `setup-domain-lokal.bat` | Setup domain lokal untuk kemudahan |

---

## 🔧 Troubleshooting

### Shortcut tidak berfungsi?
- Pastikan server sudah running (`start-app.bat` di komputer server)
- Cek IP server sudah benar
- Pastikan firewall tidak memblokir port 5173

### Domain lokal tidak bisa diakses?
- Pastikan file `setup-domain-lokal.bat` dijalankan sebagai Administrator
- Pastikan IP server benar
- Coba restart browser atau komputer

### Kiosk mode tidak fullscreen?
- Pastikan Chrome atau Edge sudah terinstall
- Coba jalankan ulang file `.bat`

---

## 📚 Dokumentasi Lengkap

Untuk panduan lengkap setup LAN dan konfigurasi lainnya, baca file:
- **`LAN_SETUP.md`** - Panduan lengkap setup jaringan lokal

---

## 💡 Tips Tambahan

1. **Bookmark Browser** - Cara paling mudah tanpa perlu file tambahan:
   - Buka aplikasi di browser
   - Klik ikon bintang (★) di address bar
   - Simpan di Bookmarks Bar

2. **Set as Homepage** - Agar aplikasi langsung terbuka saat buka browser:
   - Chrome/Edge: Settings → On startup → Open specific page
   - Masukkan URL aplikasi

3. **Pin to Taskbar** - Untuk akses super cepat:
   - Buka aplikasi di browser
   - Klik menu (⋮) → More tools → Create shortcut
   - Centang "Open as window"
   - Pin shortcut ke taskbar

---

**Dibuat untuk:** Aplikasi Bengkel Motor  
**Versi:** 1.0  
**Terakhir Update:** 19 Desember 2024
