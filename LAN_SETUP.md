# Panduan Setup Lokal / LAN (Tanpa Internet)

Agar aplikasi Bengkel Motor dapat berjalan lancar di jaringan lokal (LAN) tanpa koneksi internet, ikuti langkah-langkah berikut:

## 1. Menghapus Ketergantungan Font Online (Google Fonts)

Saat ini aplikasi mengambil font dari `fonts.googleapis.com`. Jika internet mati, aplikasi mungkin akan lambat saat dibuka pertama kali karena berusaha mencari server Google.

**Solusi:**
1. Buka file `index.html` di folder utama.
2. Hapus atau beri komentar pada baris ini:
   ```html
   <!-- <link href="https://fonts.googleapis.com/css2?..." rel="stylesheet"> -->
   ```
3. Font akan otomatis beralih ke font bawaan sistem (tetap terlihat rapi).

## 2. Pengaturan IP Address Static

Komputer yang menjadi "Server" (yang menjalankan aplikasi ini) sebaiknya memiliki IP Address tetap agar komputer lain tidak perlu mengganti alamat akses setiap kali router restart.

**Langkah:**
1. Buka **Control Panel** -> **Network and Sharing Center**.
2. Klik koneksi yang aktif (Ethernet/Wi-Fi) -> **Properties**.
3. Pilih **Internet Protocol Version 4 (TCP/IPv4)** -> **Properties**.
4. Pilih **Use the following IP address**:
   - IP address: `192.168.1.100` (Contoh, sesuaikan dengan jaringan Anda)
   - Subnet mask: `255.255.255.0`
   - Default gateway: `192.168.1.1` (IP Router Anda)

## 3. Pengaturan Firewall

Windows Firewall mungkin memblokir akses dari komputer lain. Pastikan port aplikasi terbuka.

**Port yang digunakan:**
- **3001** (Backend/Server Database)
- **5173** (Frontend/Tampilan Web)

**Langkah Cepat:**
1. Buka PowerShell sebagai Administrator.
2. Jalankan perintah berikut untuk membuka port:
   ```powershell
   New-NetFirewallRule -DisplayName "Bengkel Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -action Allow
   New-NetFirewallRule -DisplayName "Bengkel Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -action Allow
   ```

## 4. Cara Menjalankan Aplikasi

Gunakan file `start-app.bat` yang telah dibuatkan untuk menjalankan server dan frontend sekaligus dengan mudah.

## 5. Cara Akses dari Komputer Lain

Dari komputer kasir atau mekanik (klien):
1. Buka Browser (Chrome/Edge).
2. Ketik alamat: `http://192.168.1.100:5173`
   *(Ganti 192.168.1.100 dengan IP komputer server yang Anda atur di langkah 2)*

## 6. Cara Mudah Akses Aplikasi (Tanpa Ketik IP:Port)

Agar client tidak perlu mengetik `http://192.168.1.100:5173` setiap kali, ada beberapa solusi praktis:

### Solusi 1: Bookmark Browser (Paling Mudah)

**Untuk Chrome/Edge:**
1. Buka aplikasi dengan alamat lengkap: `http://192.168.1.100:5173`
2. Klik ikon **Bintang (★)** di sebelah kanan address bar
3. Beri nama: "Bengkel Motor" atau "Aplikasi Bengkel"
4. Simpan di **Bookmarks Bar** agar terlihat di atas browser
5. Klik bookmark tersebut untuk langsung membuka aplikasi

**Tips:** Aktifkan Bookmarks Bar dengan menekan `Ctrl+Shift+B`

### Solusi 2: Shortcut Desktop (Sangat Praktis)

**Cara Membuat:**
1. Klik kanan di Desktop → **New** → **Shortcut**
2. Masukkan lokasi: `http://192.168.1.100:5173`
3. Klik **Next**
4. Beri nama: "Bengkel Motor"
5. Klik **Finish**

**Cara Mengubah Icon (Opsional):**
1. Klik kanan shortcut → **Properties**
2. Klik **Change Icon**
3. Pilih icon yang diinginkan (atau gunakan file `.ico` custom)

**File Shortcut Otomatis:** Gunakan file `buat-shortcut-client.bat` yang sudah disediakan.

### Solusi 3: Custom Domain Lokal (Paling Profesional)

Dengan cara ini, client bisa akses dengan nama seperti `http://bengkel` atau `http://bengkel.local`

**Langkah di Komputer Server:**
1. Buka **Notepad** sebagai Administrator
2. Buka file: `C:\Windows\System32\drivers\etc\hosts`
3. Tambahkan baris berikut di akhir file:
   ```
   192.168.1.100  bengkel.local
   ```
4. Simpan file

**Langkah di Setiap Komputer Client:**
1. Ulangi langkah yang sama (edit file `hosts`)
2. Tambahkan baris yang sama: `192.168.1.100  bengkel.local`

**Akses Aplikasi:**
- Sekarang bisa diakses dengan: `http://bengkel.local:5173`
- Lebih mudah diingat daripada IP address!

**File Helper Otomatis:** Gunakan file `setup-domain-lokal.bat` untuk setup otomatis.

### Solusi 4: Set Homepage Browser

Agar aplikasi langsung terbuka saat browser dibuka:

**Chrome/Edge:**
1. Buka **Settings** (Ctrl+,)
2. Cari bagian **On startup**
3. Pilih **Open a specific page or set of pages**
4. Klik **Add a new page**
5. Masukkan: `http://192.168.1.100:5173`
6. Simpan

Sekarang setiap kali browser dibuka, aplikasi langsung muncul!

### Solusi 5: Kiosk Mode (Untuk Komputer Khusus)

Jika ada komputer yang hanya digunakan untuk aplikasi bengkel (misalnya komputer kasir):

**Buat file `buka-bengkel-fullscreen.bat`:**
```batch
@echo off
start chrome --kiosk http://192.168.1.100:5173
```

**Atau untuk Edge:**
```batch
@echo off
start msedge --kiosk http://192.168.1.100:5173
```

Mode kiosk akan membuka aplikasi fullscreen tanpa address bar, seperti aplikasi desktop!

**Tambahkan ke Startup Windows:**
1. Tekan `Win+R`, ketik `shell:startup`, Enter
2. Copy file `.bat` ke folder yang terbuka
3. Aplikasi akan otomatis buka saat komputer dinyalakan

---

## Rekomendasi Setup Berdasarkan Kebutuhan

| Tipe Pengguna | Solusi Terbaik |
|---------------|----------------|
| **Kasir** | Solusi 5 (Kiosk Mode) + Startup Otomatis |
| **Mekanik** | Solusi 2 (Shortcut Desktop) |
| **Admin/Owner** | Solusi 1 (Bookmark) atau Solusi 3 (Custom Domain) |
| **Semua Komputer** | Solusi 3 (Custom Domain) untuk kemudahan |
