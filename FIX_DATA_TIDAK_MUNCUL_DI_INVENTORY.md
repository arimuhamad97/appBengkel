# 🔧 Fix: Data Jenis Sparepart Tidak Muncul di Total Item

## 🔍 MASALAH

Setelah menambahkan jenis sparepart baru di menu **Pengaturan → Jenis Sparepart**, data tidak muncul di menu **Persediaan → Total Item**.

---

## ✅ SOLUSI - 2 LANGKAH

### **LANGKAH 1: Restart Backend Server**

Backend sudah diupdate dengan fitur auto-sync, tapi perlu restart agar aktif.

**Cara Restart:**

1. **Stop server yang sedang jalan:**
   - Buka terminal yang menjalankan server
   - Tekan **Ctrl+C**

2. **Start ulang server:**
   ```bash
   cd server
   node index.js
   ```

3. **Atau restart full aplikasi:**
   - Tutup semua (Ctrl+C di semua terminal)
   - Double-click: **start-app.bat**

---

### **LANGKAH 2: Sync Data Lama (Jika Ada)**

Untuk data yang ditambahkan SEBELUM restart server (data lama):

**Opsi A - Menggunakan Script:**

```bash
cd server
node sync-part-types-to-inventory.js
```

**Opsi B - Manual via SQL (Advanced):**

Jalankan di SQLite browser atau command:

```sql
INSERT OR IGNORE INTO inventory (id, name, price, stock, category)
SELECT 
    CASE WHEN code IS NOT NULL AND code != '' THEN code ELSE 'PT' || id END as id,
    name,
    sell_price as price,
    0 as stock,
    group_type as category
FROM part_types;
```

---

## 🎯 CARA KERJA FIX

### **Sekarang (Setelah Restart):**

Saat tambah jenis sparepart baru di Pengaturan:

```
User klik "Tambah" →
├─ 1. Insert ke part_types ✅
└─ 2. Auto-create ke inventory (STOCK = 0) ✅ BARU!

Result:
└─ Langsung muncul di Total Item ✅
```

### **Untuk Data Lama:**

Data yang ditambahkan sebelum fix diaktifkan:

```
Jalankan sync script →
└─ Scan semua part_types
    └─ Create inventory record (stock = 0)

Result:
└─ Data lama juga muncul di Total Item ✅
```

---

## 📝 TESTING

### **Test 1: Data Baru (Setelah Restart)**

```
1. Menu Pengaturan → Jenis Sparepart
2. Tambah sparepart baru:
   - Kode: TEST001
   - Nama: Test Sparepart
   - Group: HGP
   - Harga: 100000
3. Klik "Tambah"

4. Menu Persediaan → Total Item
5. Cari "TEST001" atau "Test Sparepart"

Expected Result:
✅ Muncul dengan stok = 0
```

### **Test 2: Data Lama (Setelah Sync)**

```
1. Jalankan: node sync-part-types-to-inventory.js
2. Menu Persediaan → Total Item
3. Refresh halaman (F5)

Expected Result:
✅ Semua data jenis sparepart muncul
✅ Stok = 0 untuk item baru
✅ Stok tetap sama untuk item yang sudah ada
```

---

## 🔄 WORKFLOW NORMAL SETELAH FIX

### **Tambah Jenis Sparepart Baru:**

```
1. Menu Pengaturan → Jenis Sparepart
2. Isi form & klik "Tambah"
3. ✅ Otomatis muncul di Total Item (stok = 0)
4. Jika perlu stok, gunakan "Stok Masuk"
```

### **Edit Jenis Sparepart:**

```
1. Klik tombol Edit (✏️)
2. Ubah data (nama, harga, dll)
3. Klik "Simpan"
4. ✅ Otomatis sinkron ke inventory
```

### **Stok Masuk:**

```
1. Menu Persediaan → Stok Masuk
2. Cari sparepart (search autocomplete)
3. Input qty
4. Simpan
5. ✅ Stok bertambah di Total Item
```

---

## 🆘 TROUBLESHOOTING

### **Data masih tidak muncul setelah restart:**

**Check 1: Apakah server sudah di-restart?**
```bash
# Lihat log saat server start
# Harus muncul: Server running on port 3001
```

**Check 2: Jalankan sync script**
```bash
cd server
node sync-part-types-to-inventory.js
```

**Check 3: Cek database manual**
```bash
# Di server folder
sqlite3 database.db

# Check part_types
SELECT COUNT(*) FROM part_types;

# Check inventory
SELECT COUNT(*) FROM inventory;

# Exit
.exit
```

### **Sync script error:**

**Error: "Cannot find module 'sqlite3'"**
```bash
# Install dependencies
npm install
```

**Error: "Database locked"**
```bash
# Stop server dulu (Ctrl+C)
# Lalu jalankan sync script
node sync-part-types-to-inventory.js

# Start server lagi
node index.js
```

---

## 💡 PENJELASAN TEKNIS

### **Kenapa Terjadi?**

Aplikasi menggunakan 2 tabel:

1. **`part_types`** - Master data jenis sparepart (Pengaturan)
2. **`inventory`** - Data stok aktual (Persediaan)

Sebelumnya, create `part_types` **TIDAK** otomatis create `inventory`.

### **Apa Yang Sudah Diperbaiki?**

**Backend (`server/index.js` line 489-525):**

```javascript
// POST /api/part-types
app.post('/api/part-types', (req, res) => {
    // 1. Insert ke part_types
    db.run(insertPartTypeSql, params, function(err) {
        
        // 2. Auto-create inventory ✅ BARU!
        const inventoryId = code || `PT${partTypeId}`;
        db.run(insertInventorySql, [inventoryId, name, price, 0, category]);
        
        // Response
        res.json({ id, code, name, ... });
    });
});
```

**PUT /api/part-types (Update juga sync):**

```javascript
// Saat update part type
// Auto-sync ke inventory (nama, harga, category)
```

---

## 📋 CHECKLIST

Setelah fix:

- ✅ Backend server di-restart
- ✅ Sync script dijalankan (untuk data lama)
- ✅ Test tambah sparepart baru
- ✅ Check di Total Item (harus muncul)
- ✅ Test edit sparepart
- ✅ Check perubahan ter-sync

---

## 🎯 RINGKASAN CEPAT

**YANG HARUS DILAKUKAN SEKARANG:**

```
1. ✅ RESTART SERVER:
   Ctrl+C di terminal server
   Lalu: node index.js

2. ✅ SYNC DATA LAMA:
   cd server
   node sync-part-types-to-inventory.js

3. ✅ REFRESH HALAMAN:
   Menu Persediaan → Total Item
   Tekan F5

4. ✅ TEST:
   Tambah sparepart baru
   Check di Total Item

DONE! ✅
```

**Waktu:** 2-5 menit

---

## ✨ BENEFIT SETELAH FIX

- ✅ Tambah sparepart → Langsung muncul di Total Item
- ✅ Edit sparepart → Auto-sync ke inventory
- ✅ Data selalu konsisten
- ✅ Tidak perlu "Stok Masuk" dulu agar muncul
- ✅ UX lebih baik & logical

---

Semoga membantu! 🚀
