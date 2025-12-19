# 📱 Panduan Akses via QR Code

## 🎯 Apa itu QR Code Akses?

QR Code adalah cara tercepat dan termudah untuk mengakses aplikasi bengkel dari smartphone atau tablet. Cukup scan QR Code, dan aplikasi langsung terbuka di browser mobile Anda!

---

## 🚀 Cara Menggunakan

### Metode 1: Scan Langsung dari Layar Komputer

**Langkah:**
1. Di komputer server, double-click file: `buka-qr-code.bat`
2. Halaman QR Code akan terbuka di browser
3. Dari smartphone/tablet:
   - Buka aplikasi **Kamera**
   - Arahkan ke QR Code di layar komputer
   - Tap notifikasi yang muncul
   - Aplikasi akan terbuka di browser mobile

**Keuntungan:**
- ✅ Tidak perlu cetak
- ✅ Selalu update (jika IP berubah, tinggal refresh)
- ✅ Hemat kertas

---

### Metode 2: Cetak dan Tempel

**Langkah:**
1. Buka `qr-code-akses.html` di browser
2. Klik tombol **"Cetak QR Code"**
3. Cetak halaman tersebut
4. Gunting dan tempel di lokasi strategis:
   - Area kasir
   - Ruang mekanik
   - Ruang tunggu
   - Pintu masuk bengkel

**Keuntungan:**
- ✅ Selalu tersedia (tidak perlu komputer)
- ✅ Mudah diakses siapa saja
- ✅ Terlihat profesional

---

### Metode 3: Download dan Share

**Langkah:**
1. Buka `qr-code-akses.html` di browser
2. Klik tombol **"Download QR Code"**
3. Gambar QR Code akan tersimpan sebagai PNG
4. Share via:
   - WhatsApp ke staff
   - Email ke customer
   - Print di brosur/kartu nama
   - Upload ke website bengkel

**Keuntungan:**
- ✅ Mudah dibagikan
- ✅ Bisa digunakan di berbagai media
- ✅ Fleksibel

---

## ⚙️ Konfigurasi IP Server

Jika IP server Anda **BUKAN** `192.168.1.100`:

### Di Halaman QR Code:
1. Buka `qr-code-akses.html`
2. Di bagian **"Konfigurasi URL"**:
   - Masukkan IP server yang benar
   - Masukkan port (default: 5173)
3. Klik **"Generate QR Code"**
4. QR Code baru akan muncul dengan URL yang benar

### Auto Detect IP:
1. Klik tombol **"Auto Detect IP"**
2. Sistem akan mencoba mendeteksi IP lokal komputer
3. Jika berhasil, IP akan otomatis terisi
4. Klik **"Generate QR Code"**

---

## 📋 Ukuran QR Code

Tersedia 3 ukuran QR Code:

| Ukuran | Dimensi | Untuk Apa |
|--------|---------|-----------|
| **Kecil** | 128x128 px | Email, WhatsApp, kartu nama |
| **Sedang** | 200x200 px | Cetak A4, display layar |
| **Besar** | 300x300 px | Banner, poster, jarak jauh |

**Cara Ganti Ukuran:**
- Di halaman QR Code, pilih radio button ukuran yang diinginkan
- QR Code akan otomatis regenerate

---

## 💡 Tips & Trik

### 1. Bookmark di Mobile
Setelah scan QR Code dan aplikasi terbuka:
1. Tap menu browser (⋮)
2. Pilih **"Add to Home Screen"** atau **"Bookmark"**
3. Aplikasi bisa diakses seperti aplikasi native!

### 2. QR Code di Ruang Tunggu
Tempel QR Code di ruang tunggu dengan tulisan:
> **"Scan untuk cek status servis motor Anda"**

Customer bisa self-service tanpa perlu tanya-tanya!

### 3. QR Code di Kartu Servis
Cetak QR Code kecil di kartu servis customer:
- Customer bisa cek riwayat servis dari rumah
- Meningkatkan kepercayaan customer
- Terlihat modern dan profesional

### 4. Multiple QR Code
Buat beberapa QR Code untuk fungsi berbeda:
- QR Code untuk halaman utama
- QR Code untuk halaman antrian
- QR Code untuk halaman invoice
- QR Code untuk halaman laporan

### 5. Update Otomatis
Halaman QR Code menyimpan konfigurasi IP di browser:
- Tidak perlu input ulang setiap kali
- Otomatis load IP terakhir yang digunakan

---

## 📍 Lokasi Ideal untuk QR Code

### Area Kasir
**Tujuan:** Customer cek status servis  
**Ukuran:** Sedang (200px)  
**Text:** "Scan untuk cek status motor Anda"

### Ruang Mekanik
**Tujuan:** Mekanik akses dari tablet  
**Ukuran:** Sedang (200px)  
**Text:** "Scan untuk akses sistem"

### Ruang Tunggu
**Tujuan:** Customer self-service  
**Ukuran:** Besar (300px)  
**Text:** "Scan untuk informasi servis"

### Pintu Masuk
**Tujuan:** Informasi umum  
**Ukuran:** Besar (300px)  
**Text:** "Scan untuk info bengkel"

### Kartu Servis
**Tujuan:** Customer tracking  
**Ukuran:** Kecil (128px)  
**Text:** "Scan untuk riwayat servis"

---

## 🔧 Troubleshooting

### ❌ QR Code tidak bisa di-scan?

**Solusi:**
1. Pastikan QR Code tidak blur atau terlalu kecil
2. Gunakan ukuran **Sedang** atau **Besar** untuk cetak
3. Pastikan pencahayaan cukup saat scan
4. Coba dari jarak yang berbeda (10-30 cm)

### ❌ Setelah scan, aplikasi tidak terbuka?

**Solusi:**
1. Pastikan smartphone/tablet terhubung ke **WiFi yang sama** dengan server
2. Cek IP server sudah benar di QR Code
3. Pastikan server aplikasi sudah running
4. Cek firewall tidak memblokir akses

### ❌ IP server berubah setelah cetak QR Code?

**Solusi:**
1. Setup IP static di komputer server (lihat `LAN_SETUP.md`)
2. Atau generate QR Code baru dengan IP yang baru
3. Atau gunakan domain lokal (`bengkel.local`) yang tidak berubah

### ❌ QR Code tidak muncul di halaman?

**Solusi:**
1. Pastikan terhubung internet (untuk load library QRCode.js)
2. Atau download library offline (lihat section Advanced)
3. Refresh halaman (F5)
4. Clear cache browser

---

## 🎨 Kustomisasi QR Code

### Tambah Logo di Tengah QR Code
Anda bisa edit file `qr-code-akses.html` untuk menambahkan logo bengkel di tengah QR Code:

```javascript
// Di bagian generateQR(), tambahkan:
qrCodeInstance = new QRCode(qrContainer, {
    text: url,
    width: parseInt(selectedSize),
    height: parseInt(selectedSize),
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H, // Level H untuk logo
    // Tambahkan logo di sini (advanced)
});
```

### Ubah Warna QR Code
Edit di file `qr-code-akses.html`:
```javascript
colorDark: "#667eea",  // Warna ungu (sesuai tema)
colorLight: "#ffffff", // Background putih
```

---

## 📊 Perbandingan dengan Metode Lain

| Metode | Kecepatan | Mobile-Friendly | Akurasi | Kemudahan |
|--------|-----------|-----------------|---------|-----------|
| **QR Code** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ketik Manual | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| Bookmark | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Shortcut | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Kesimpulan:** QR Code adalah metode **TERBAIK** untuk akses dari mobile!

---

## 🌟 Best Practices

### 1. Kombinasi dengan Metode Lain
- QR Code untuk mobile
- Shortcut desktop untuk PC
- Domain lokal untuk semua

### 2. Edukasi Staff
- Ajarkan cara scan QR Code
- Tunjukkan cara bookmark setelah scan
- Latih cara troubleshooting dasar

### 3. Monitoring
- Cek berkala apakah QR Code masih valid
- Update jika IP server berubah
- Ganti QR Code yang rusak/pudar

### 4. Branding
- Tambahkan logo bengkel di sekitar QR Code
- Gunakan warna tema bengkel
- Tambahkan tagline atau slogan

---

## 📱 Kompatibilitas

QR Code Scanner built-in tersedia di:

| Device | OS | Cara Scan |
|--------|----|-----------| 
| **iPhone** | iOS 11+ | Buka Kamera, arahkan ke QR Code |
| **Android** | Android 9+ | Buka Kamera atau Google Lens |
| **Samsung** | One UI | Buka Kamera, mode QR Scanner |
| **Xiaomi** | MIUI | Buka Scanner app |
| **Oppo/Vivo** | ColorOS/FuntouchOS | Buka Kamera atau Scanner |

Jika tidak ada built-in scanner, download app:
- **Android:** Google Lens, QR Code Reader
- **iOS:** QR Reader, Quick Scan

---

## 🎁 Bonus: Template Poster QR Code

Anda bisa membuat poster dengan format:

```
╔═══════════════════════════════════╗
║                                   ║
║    🔧 BENGKEL MOTOR [NAMA] 🔧     ║
║                                   ║
║     Akses Sistem Informasi        ║
║                                   ║
║      [QR CODE DI SINI]            ║
║                                   ║
║   📱 Scan dengan smartphone       ║
║   ✓ Cek status servis             ║
║   ✓ Lihat riwayat                 ║
║   ✓ Informasi bengkel             ║
║                                   ║
╚═══════════════════════════════════╝
```

---

## 📞 File Terkait

- **`qr-code-akses.html`** - Halaman generator QR Code
- **`buka-qr-code.bat`** - Shortcut untuk buka halaman QR
- **`menu-akses-mudah.bat`** - Menu utama (opsi 5)
- **`config-ip-server.bat`** - Update IP di semua file

---

## ✅ Checklist Setup QR Code

- [ ] Buka `qr-code-akses.html` di browser
- [ ] Konfigurasi IP server yang benar
- [ ] Generate QR Code
- [ ] Test scan dari smartphone
- [ ] Bookmark aplikasi di mobile browser
- [ ] Cetak QR Code
- [ ] Tempel di lokasi strategis
- [ ] Edukasi staff cara menggunakan
- [ ] Monitor dan update jika perlu

---

**Dibuat untuk:** Aplikasi Bengkel Motor  
**Versi:** 1.0  
**Terakhir Update:** 19 Desember 2024  
**Fitur:** QR Code Generator dengan Auto-Detect IP
