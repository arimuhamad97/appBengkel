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
