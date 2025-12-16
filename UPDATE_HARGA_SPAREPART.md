# 🔧 Update Harga Sparepart yang Salah

## 🎯 MASALAH

Harga sparepart di database banyak yang tidak akurat karena saat import menggunakan estimasi random.

**Contoh:**
- Part: `28300K0JN00`
- Di aplikasi: Rp 25,000 (SALAH ❌)
- Di website Honda: Rp 82,000 (BENAR ✅)

## ✅ SOLUSI

Script untuk update harga **TANPA mengubah stok** yang sudah ada.

---

## 📝 CARA MENGGUNAKAN

### **Step 1: Siapkan Data Harga Yang Benar**

Edit file: `server/update-part-prices.js`

Tambahkan data di array `priceUpdates`:

```javascript
const priceUpdates = [
    {
        code: '28300K0JN00',
        cost_price: 82000,      // Harga pokok/beli
        sell_price: 106600,     // Harga jual (markup 30%)
        note: 'Harga dari website Honda'
    },
    {
        code: 'KODE_PART_LAIN',
        cost_price: 50000,
        sell_price: 65000,
        note: 'Harga dari supplier'
    },
    // Tambahkan sebanyak yang diperlukan
];
```

### **Step 2: Jalankan Script**

```bash
cd server
node update-part-prices.js
```

### **Step 3: Cek Hasil**

Script akan menampilkan:
- ✅ Part yang berhasil diupdate
- ❌ Part yang tidak ditemukan
- 📊 Before/After comparison

---

## 💡 PENJELASAN HARGA

### **Cost Price (Harga Pokok):**
- Harga beli dari supplier/website
- Contoh: Rp 82,000

### **Sell Price (Harga Jual):**
- Harga jual ke customer
- Formula: `cost_price + markup`
- Markup umum: 20-30%
- Contoh: Rp 82,000 + 30% = Rp 106,600

### **Rumus Markup:**

```javascript
// Markup 20%
sell_price = cost_price * 1.20

// Markup 25%
sell_price = cost_price * 1.25

// Markup 30%
sell_price = cost_price * 1.30
```

---

## 🔍 CARA MENDAPATKAN HARGA YANG BENAR

### **1. Website Honda Official:**
- https://hondacengkareng.co.id/
- Cari part berdasarkan kode
- Ambil harga yang tertera

### **2. Dari Supplier:**
- Hubungi supplier Honda
- Minta price list terbaru
- Update berdasarkan invoice

### **3. Dari Nota Pembelian:**
- Cek nota pembelian terakhir
- Gunakan harga aktual dari nota
- Update sesuai harga real

---

## 📋 CONTOH PENGGUNAAN

### **Scenario: Update 5 Part**

```javascript
const priceUpdates = [
    {
        code: '28300K0JN00',
        cost_price: 82000,
        sell_price: 106600,
        note: 'Harga dari Honda Cengkareng'
    },
    {
        code: '08200M99S1C',
        cost_price: 35000,
        sell_price: 45500,
        note: 'Oli MPX1 0.8L - dari supplier'
    },
    {
        code: '06455KVBA01',
        cost_price: 120000,
        sell_price: 156000,
        note: 'Kampas rem depan - nota Dec 2024'
    },
    {
        code: '44830K59N01',
        cost_price: 95000,
        sell_price: 123500,
        note: 'Master rem - website resmi'
    },
    {
        code: '12209GB4682',
        cost_price: 5000,
        sell_price: 6500,
        note: 'Seal klep - bulk price'
    }
];
```

### **Output:**

```
===========================================
  Update Harga Sparepart
===========================================

📦 Total 5 part akan diupdate

📝 Kopling Komplit Set
   Kode: 28300K0JN00
   BEFORE:
   - Harga Pokok: Rp 25,000
   - Harga Jual:  Rp 32,500
   AFTER:
   - Harga Pokok: Rp 82,000
   - Harga Jual:  Rp 106,600
   📌 Harga dari Honda Cengkareng
   ✅ Updated!

[...]

===========================================
  UPDATE COMPLETE!
===========================================

✅ Updated: 5 items
❌ Not found: 0 items

📌 CATATAN:
   - Harga sudah diupdate di part_types & inventory
   - Stok TIDAK berubah (tetap aman)
   - Refresh halaman untuk lihat perubahan
```

---

## ⚠️ PENTING - YANG TIDAK BERUBAH

Script ini **HANYA** update harga, **TIDAK** mengubah:

- ✅ Stok tetap sama
- ✅ Kode part tetap sama
- ✅ Nama part tetap sama
- ✅ Group tetap sama
- ✅ Satuan tetap sama

**Yang diupdate:**
- ✅ Harga Pokok (cost_price)
- ✅ Harga Jual (sell_price)

---

## 🔄 UPDATE INVENTORY

Script otomatis update:
1. **Table `part_types`** (master data) ✅
2. **Table `inventory`** (stock data) ✅

Jadi harga tersinkron di semua tempat!

---

## 📊 BULK UPDATE DARI FILE

Jika punya banyak data (ratusan), buat file CSV:

### **prices.csv:**
```csv
code,cost_price,sell_price,note
28300K0JN00,82000,106600,Website Honda
08200M99S1C,35000,45500,Supplier
06455KVBA01,120000,156000,Nota Dec 2024
```

### **Script untuk read CSV:**

```javascript
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Read CSV
const csvData = fs.readFileSync('prices.csv', 'utf-8');
const priceUpdates = parse(csvData, {
    columns: true,
    skip_empty_lines: true
});

// Convert string to number
priceUpdates.forEach(item => {
    item.cost_price = parseInt(item.cost_price);
    item.sell_price = parseInt(item.sell_price);
});

// Lalu jalankan update logic yang sama
```

---

## 🆘 TROUBLESHOOTING

### **Error: "Part tidak ditemukan"**

Kemungkinan:
1. Kode part salah (typo)
2. Part belum ada di database
3. Case sensitive issue

**Solution:**
```sql
-- Check di database
SELECT code, name FROM part_types WHERE code LIKE '%28300%';
```

### **Warning: "Inventory belum ada"**

Ini normal jika:
- Part baru ditambahkan
- Belum pernah sync inventory

**Solution:**
- Jalankan `sync-part-types-to-inventory.js`
- Atau akan auto-created saat create part baru

### **Harga tidak berubah setelah update**

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear cache
3. Restart server (jika perlu)

---

## 📋 CHECKLIST

Before running:
- [ ] Dapat harga yang benar (website/supplier/nota)
- [ ] Edit `priceUpdates` array
- [ ] Set cost_price & sell_price
- [ ] Calculate markup dengan benar

After running:
- [ ] Check output script (success/errors)
- [ ] Refresh aplikasi
- [ ] Verify harga sudah berubah
- [ ] Test di menu Persediaan
- [ ] Test create sales/transaksi

---

## 💰 MARKUP RECOMMENDATIONS

| Category | Markup | Example |
|----------|--------|---------|
| **HGP (Genuine)** | 25-30% | Cost 100k → Sell 125-130k |
| **Oli** | 15-20% | Cost 50k → Sell 57.5-60k |
| **Non HGP** | 30-40% | Cost 80k → Sell 104-112k |
| **Fast Moving** | 20-25% | High volume, lower margin |
| **Slow Moving** | 35-45% | Low volume, higher margin |

---

## ✨ TIPS

1. **Update Berkala:**
   - Update harga setiap 3-6 bulan
   - Sesuaikan dengan harga supplier

2. **Track Changes:**
   - Simpan file backup `priceUpdates` lama
   - Catat tanggal update

3. **Verify Before Sell:**
   - Cek harga sebelum transaksi
   - Adjust jika ada promo/diskon

4. **Bulk Update:**
   - Jika > 50 items, gunakan CSV
   - Lebih efisien & traceable

---

**Update harga dengan aman & mudah!** 💰✅

Stok tetap utuh, hanya harga yang diperbaiki! 🎯

Semoga membantu! 🚀
