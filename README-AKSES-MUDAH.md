# 🚀 Cara Mudah Akses Aplikasi Bengkel Motor

## 📋 Ringkasan

Agar client tidak perlu mengetik `http://192.168.1.100:5173` setiap kali membuka aplikasi, tersedia beberapa solusi praktis yang bisa dipilih sesuai kebutuhan.

---

## ⚡ Cara Tercepat - Gunakan Menu Interaktif

**Double-click file:** `menu-akses-mudah.bat`

Menu ini menyediakan semua opsi dalam satu tempat:
- Buka aplikasi (normal atau fullscreen)
- Buat shortcut desktop
- Setup domain lokal
- Lihat panduan lengkap
- Cek informasi koneksi

---

## 🎯 Solusi Berdasarkan Kebutuhan

### 1️⃣ Untuk Komputer Kasir (Dedicated)
**Rekomendasi:** Mode Kiosk + Auto Start

**Langkah:**
1. Double-click `buka-bengkel-fullscreen.bat` untuk test
2. Jika sudah OK, copy file tersebut ke folder Startup:
   - Tekan `Win+R`, ketik `shell:startup`, Enter
   - Copy file `buka-bengkel-fullscreen.bat` ke folder yang terbuka
3. Aplikasi akan otomatis buka fullscreen saat komputer dinyalakan

**Keuntungan:**
- ✅ Otomatis buka saat booting
- ✅ Fullscreen seperti aplikasi desktop
- ✅ Tidak ada distraksi (no address bar)

---

### 2️⃣ Untuk Komputer Mekanik/Staff
**Rekomendasi:** Shortcut Desktop

**Langkah:**
1. Double-click `buat-shortcut-client.bat`
2. Shortcut "Bengkel Motor" akan muncul di Desktop
3. Klik shortcut untuk membuka aplikasi

**Keuntungan:**
- ✅ Mudah diakses dari Desktop
- ✅ Satu klik langsung buka
- ✅ Tidak perlu hafal IP

---

### 3️⃣ Untuk Admin/Owner
**Rekomendasi:** Custom Domain Lokal + Bookmark

**Langkah:**
1. Klik kanan `setup-domain-lokal.bat` → **Run as administrator**
2. Ikuti instruksi di layar
3. Buka browser, akses `http://bengkel.local:5173`
4. Tekan `Ctrl+D` untuk bookmark

**Keuntungan:**
- ✅ URL mudah diingat (bengkel.local)
- ✅ Lebih profesional
- ✅ Bisa diakses dari bookmark

---

### 4️⃣ Untuk Semua Komputer (Setup Sekali)
**Rekomendasi:** Setup Domain Lokal di Semua PC

**Langkah:**
1. Di SETIAP komputer (server & client):
   - Klik kanan `setup-domain-lokal.bat`
   - Pilih **Run as administrator**
   - Tunggu sampai selesai
2. Sekarang semua komputer bisa akses dengan `http://bengkel.local:5173`

**Keuntungan:**
- ✅ URL sama untuk semua komputer
- ✅ Tidak perlu hafal IP
- ✅ Mudah dikomunikasikan ke staff

---

### 5️⃣ Untuk Smartphone/Tablet (Mobile Access)
**Rekomendasi:** QR Code

**Langkah:**
1. Double-click `buka-qr-code.bat` di komputer
2. Halaman QR Code akan terbuka
3. Scan QR Code dari smartphone/tablet
4. Aplikasi langsung terbuka di browser mobile
5. Bookmark halaman untuk akses berikutnya

**Keuntungan:**
- ✅ Tercepat untuk mobile
- ✅ Tidak perlu ketik URL panjang
- ✅ Akurat (no typo)
- ✅ Bisa dicetak dan ditempel
- ✅ Profesional dan modern

**Bonus:**
- Cetak QR Code dan tempel di area kasir
- Customer bisa scan untuk cek status servis
- Staff bisa akses dari tablet di area mekanik

---

## 📁 File-File yang Tersedia

| File | Fungsi | Cara Pakai |
|------|--------|------------|
| `menu-akses-mudah.bat` | Menu interaktif semua opsi | Double-click |
| `buat-shortcut-client.bat` | Buat shortcut desktop | Double-click |
| `setup-domain-lokal.bat` | Setup custom domain | Run as Administrator |
| `buka-bengkel-fullscreen.bat` | Buka mode fullscreen | Double-click |
| `buka-bengkel-chrome.bat` | Buka dengan Chrome | Double-click |
| `buka-bengkel-edge.bat` | Buka dengan Edge | Double-click |
| `buka-qr-code.bat` | Generate QR Code | Double-click |
| `qr-code-akses.html` | Halaman QR Code generator | Buka di browser |
| `akses-aplikasi.html` | Halaman panduan web | Buka di browser |
| `config-ip-server.bat` | Update IP di semua file | Double-click |

---

## ⚙️ Konfigurasi IP Server

**PENTING!** Semua file menggunakan IP default: `192.168.1.100`

Jika IP server Anda berbeda:

### Cara 1: Edit Manual
1. Klik kanan file `.bat` → **Edit**
2. Cari baris: `set IP_SERVER=192.168.1.100`
3. Ganti dengan IP server Anda
4. Simpan (Ctrl+S)

### Cara 2: Edit File HTML
1. Klik kanan `akses-aplikasi.html` → **Edit with Notepad**
2. Cari baris: `const SERVER_IP = '192.168.1.100';`
3. Ganti dengan IP server Anda
4. Simpan (Ctrl+S)

---

## 🔍 Cara Cek IP Server

Di komputer server:
1. Buka Command Prompt
2. Ketik: `ipconfig`
3. Lihat **IPv4 Address** di bagian Ethernet atau Wi-Fi
4. Contoh: `192.168.1.100`

---

## 📖 Dokumentasi Lengkap

Untuk informasi lebih detail, baca file-file berikut:

- **`PANDUAN-AKSES-MUDAH.md`** - Panduan lengkap semua metode akses
- **`PANDUAN-QR-CODE.md`** - Panduan khusus QR Code untuk mobile access
- **`LAN_SETUP.md`** - Panduan setup jaringan lokal lengkap
- **`qr-code-akses.html`** - Generator QR Code interaktif (buka di browser)
- **`akses-aplikasi.html`** - Halaman panduan interaktif (buka di browser)

---

## 🆘 Troubleshooting

### ❌ Aplikasi tidak bisa dibuka?
**Solusi:**
1. Pastikan server sudah running (jalankan `start-app.bat` di komputer server)
2. Cek IP server sudah benar
3. Pastikan firewall tidak memblokir port 5173 dan 3001

### ❌ Domain lokal tidak berfungsi?
**Solusi:**
1. Pastikan `setup-domain-lokal.bat` dijalankan sebagai **Administrator**
2. Restart browser atau komputer
3. Cek file `C:\Windows\System32\drivers\etc\hosts` apakah entry sudah ada

### ❌ Shortcut tidak berfungsi?
**Solusi:**
1. Cek IP di dalam file `.bat` sudah benar
2. Pastikan server sudah running
3. Test buka manual di browser dulu

---

## 💡 Tips Tambahan

### Bookmark Browser (Tanpa File Tambahan)
1. Buka aplikasi di browser
2. Klik ikon bintang (★) di address bar
3. Simpan di Bookmarks Bar
4. Tekan `Ctrl+Shift+B` untuk tampilkan Bookmarks Bar

### Set as Homepage
1. Buka Settings browser (Ctrl+,)
2. Cari **On startup**
3. Pilih **Open a specific page**
4. Masukkan URL aplikasi
5. Aplikasi akan otomatis buka saat browser dibuka

### Pin to Taskbar
1. Buka aplikasi di browser
2. Klik menu (⋮) → More tools → Create shortcut
3. Centang "Open as window"
4. Klik kanan shortcut → Pin to taskbar

---

## 📊 Perbandingan Solusi

| Solusi | Kemudahan | Kecepatan | Profesional | Rekomendasi |
|--------|-----------|-----------|-------------|-------------|
| QR Code | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Mobile/Tablet |
| Bookmark | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Semua user |
| Shortcut Desktop | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Mekanik/Staff |
| Domain Lokal | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Admin/Semua |
| Kiosk Mode | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Kasir |
| Homepage | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Power user |

---

## 🎯 Rekomendasi Final

**Setup Ideal untuk Bengkel:**

1. **Komputer Server:**
   - Setup domain lokal (run `setup-domain-lokal.bat` as admin)
   - Jalankan `start-app.bat` saat booting

2. **Komputer Kasir:**
   - Setup domain lokal
   - Copy `buka-bengkel-fullscreen.bat` ke Startup folder
   - Aplikasi auto-buka fullscreen saat booting
   - Cetak QR Code dan tempel untuk customer

3. **Komputer Mekanik/Staff:**
   - Setup domain lokal
   - Buat shortcut desktop (`buat-shortcut-client.bat`)
   - Atau gunakan bookmark browser

4. **Komputer Admin/Owner:**
   - Setup domain lokal
   - Gunakan bookmark browser
   - Akses dari mana saja dengan mudah

5. **Smartphone/Tablet:**
   - Scan QR Code yang ditempel
   - Bookmark halaman aplikasi
   - Akses cepat dari mobile browser

---

**Dibuat untuk:** Aplikasi Bengkel Motor  
**Versi:** 1.1 (dengan QR Code)  
**Terakhir Update:** 19 Desember 2024  
**Support:** Baca dokumentasi atau hubungi admin sistem
