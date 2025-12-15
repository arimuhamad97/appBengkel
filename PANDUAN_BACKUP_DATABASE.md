# Panduan Backup & Restore Database

## Fitur Backup Database

Fitur backup database telah ditambahkan ke aplikasi Bengkel Motor untuk memastikan keamanan data Anda.

### Cara Mengakses

1. Login ke aplikasi
2. Klik menu **"Backup Database"** di sidebar (ikon database)
3. Anda akan melihat halaman dengan dua opsi utama:
   - **Backup Database** (Download)
   - **Restore Database** (Upload)

### Cara Melakukan Backup

1. Klik tombol **"Backup Sekarang"** pada card Backup Database
2. File database akan otomatis terunduh dengan nama format: `bengkel-backup-YYYY-MM-DD.db`
3. Simpan file ini di lokasi yang aman (disarankan di cloud storage atau hard drive eksternal)

### Cara Melakukan Restore

1. Klik tombol **"Pilih File Backup"** pada card Restore Database
2. Pilih file backup (.db) yang ingin di-restore
3. Konfirmasi peringatan yang muncul
4. Tunggu proses restore selesai
5. Halaman akan otomatis refresh untuk memuat data baru

### Keamanan

- **Backup Otomatis Sebelum Restore**: Sebelum melakukan restore, sistem akan otomatis membuat backup dari database saat ini
- **File Backup Aman**: File backup disimpan di folder server dengan nama `bengkel-backup-before-restore-[timestamp].db`
- **Validasi File**: Sistem memvalidasi file yang di-upload untuk memastikan format yang benar

### Rekomendasi

1. **Backup Rutin**: Lakukan backup secara rutin (harian atau mingguan)
2. **Sebelum Update**: Selalu backup sebelum melakukan update sistem
3. **Sebelum Input Besar**: Backup sebelum melakukan input data dalam jumlah besar
4. **Simpan Multiple Backup**: Simpan beberapa versi backup untuk berjaga-jaga
5. **Cloud Storage**: Upload backup ke Google Drive, Dropbox, atau cloud storage lainnya

### Lokasi File Database

- **Database Utama**: `server/bengkel.db`
- **Backup Manual**: File yang Anda download
- **Backup Otomatis**: `server/bengkel-backup-before-restore-[timestamp].db`

### API Endpoints

Untuk developer:

#### GET /api/database/backup
- **Deskripsi**: Download file database
- **Response**: File binary (.db)
- **Headers**: 
  - Content-Type: application/octet-stream
  - Content-Disposition: attachment; filename="bengkel-backup-YYYY-MM-DD.db"

#### POST /api/database/restore
- **Deskripsi**: Upload dan restore database dari file backup
- **Request Body**: 
  ```json
  {
    "fileData": "base64_encoded_database_file"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Database restored successfully. Please refresh the page."
  }
  ```

### Troubleshooting

**Q: Backup gagal diunduh**
A: Pastikan browser Anda mengizinkan download. Cek pengaturan popup blocker.

**Q: Restore gagal**
A: Pastikan file yang di-upload adalah file .db yang valid. Sistem akan otomatis restore database lama jika terjadi error.

**Q: Data hilang setelah restore**
A: Cek folder `server/` untuk file backup otomatis dengan nama `bengkel-backup-before-restore-[timestamp].db`. Anda bisa restore dari file ini.

**Q: Aplikasi error setelah restore**
A: Refresh halaman browser. Jika masih error, restart server dengan menjalankan `start-app.bat`.

### Catatan Penting

⚠️ **PERINGATAN**: 
- Restore database akan **mengganti semua data** yang ada dengan data dari file backup
- Pastikan Anda memilih file backup yang benar
- Backup otomatis akan dibuat sebelum restore untuk keamanan

✅ **Best Practices**:
- Backup sebelum tutup operasional harian
- Simpan backup di minimal 2 lokasi berbeda
- Test restore secara berkala untuk memastikan backup valid
- Beri nama file backup dengan informasi tambahan jika perlu (misal: `bengkel-backup-2025-12-13-sebelum-update.db`)

---

**Dibuat**: 13 Desember 2025
**Versi**: 1.0
