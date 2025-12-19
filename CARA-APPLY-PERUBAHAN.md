# 🔄 Cara Apply Perubahan Printer Error Handling

## ⚠️ Issue: Perubahan Tidak Terlihat

Jika setelah update code, perubahan tidak terlihat (masih muncul alert lama), ikuti langkah berikut:

---

## ✅ Solution 1: Hard Refresh Browser (Tercepat)

### **Windows/Linux:**
```
Ctrl + Shift + R
atau
Ctrl + F5
```

### **Mac:**
```
Cmd + Shift + R
```

### **Atau Manual:**
```
1. Buka DevTools (F12)
2. Right-click tombol refresh
3. Pilih "Empty Cache and Hard Reload"
```

---

## ✅ Solution 2: Restart Dev Server

### **Step 1: Stop Server**
```
Di terminal yang running npm run dev:
Tekan: Ctrl + C
```

### **Step 2: Start Server Lagi**
```powershell
npm run dev
```

### **Step 3: Refresh Browser**
```
Tekan F5 atau Ctrl + R
```

---

## ✅ Solution 3: Clear Browser Cache

### **Chrome/Edge:**
```
1. Tekan Ctrl + Shift + Delete
2. Pilih "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. Refresh page (F5)
```

---

## 🧪 Cara Test Perubahan Berhasil

### **Test 1: Print SPK (Service Page)**

1. Buka halaman Service
2. Pilih antrian
3. Click "Cetak"
4. Preview muncul
5. Click "Cetak Sekarang"
6. **Expected:**
   - ℹ️ Notifikasi muncul: "Mengirim print job ke server..."
   - Jika sukses: ✅ "Print job berhasil dikirim ke printer EPSON!"
   - Jika error: ❌ Dialog detail error muncul

### **Test 2: Print Invoice**

1. Buka halaman Service
2. Tab "Sudah Bayar"
3. Click salah satu invoice
4. Click "Cetak (LX-310)"
5. Confirm "Cetak Invoice ke Printer Server?"
6. **Expected:**
   - ℹ️ Notifikasi: "Mengirim invoice ke server..."
   - Jika sukses: ✅ "Invoice berhasil dikirim ke printer EPSON!"
   - Jika error: ❌ Dialog detail error muncul

---

## 🎯 Indikator Perubahan Berhasil

### **✅ Perubahan BERHASIL jika:**
- Muncul notifikasi slide-in di kanan atas
- Notifikasi warna biru saat loading
- Notifikasi warna hijau saat sukses
- Notifikasi warna merah saat error
- Dialog error detail muncul (bukan alert biasa)
- Ada opsi "Coba Lagi?" di dialog error

### **❌ Perubahan BELUM APPLY jika:**
- Masih muncul alert() biasa
- Alert text: "✅ Print Job Terkirim ke Server!"
- Alert text: "✅ Invoice Terkirim ke Server!"
- Tidak ada notifikasi slide-in
- Tidak ada dialog error detail

---

## 🔧 Troubleshooting

### **Problem: Masih muncul alert lama**

**Solusi:**
```
1. Hard refresh (Ctrl + Shift + R)
2. Jika masih sama:
   - Stop dev server (Ctrl + C)
   - Clear browser cache
   - Start server lagi (npm run dev)
   - Hard refresh browser
```

### **Problem: Error "showPrintStatus is not defined"**

**Solusi:**
```
1. Check import di file:
   - ServicePage.jsx harus ada:
     import { showPrintStatus } from '../utils/printUtils';
   
   - ServiceInvoice.jsx harus ada:
     import { showPrintStatus } from '../../utils/printUtils';

2. Restart dev server
```

### **Problem: Notifikasi tidak muncul**

**Solusi:**
```
1. Check file printUtils.js ada di:
   src/utils/printUtils.js

2. Check browser console (F12) untuk error

3. Restart dev server
```

---

## 📋 Checklist Verification

Sebelum test, pastikan:

- [ ] File `src/utils/printUtils.js` exists
- [ ] File `src/pages/ServicePage.jsx` updated (import showPrintStatus)
- [ ] File `src/components/service/ServiceInvoice.jsx` updated (import showPrintStatus)
- [ ] Dev server running (`npm run dev`)
- [ ] Browser cache cleared
- [ ] Hard refresh done (Ctrl + Shift + R)

---

## 🎬 Demo Test Flow

### **Scenario 1: Printer ON (Success)**
```
1. Click "Cetak"
2. Preview muncul
3. Click "Cetak Sekarang"
4. Notifikasi biru: "Mengirim print job ke server..."
5. Notifikasi hijau: "Print job berhasil dikirim!"
6. Preview close
7. Printer print dokumen
```

### **Scenario 2: Printer OFF (Error)**
```
1. Matikan printer
2. Click "Cetak"
3. Preview muncul
4. Click "Cetak Sekarang"
5. Notifikasi biru: "Mengirim print job ke server..."
6. Notifikasi merah: "Printer Tidak Tersedia: ..."
7. Dialog error muncul dengan detail:
   - Error message
   - Kemungkinan penyebab
   - Solusi
   - Opsi "Coba Lagi?"
8. Nyalakan printer
9. Click "Ya, Coba Lagi"
10. Notifikasi hijau: "Print job berhasil dikirim!"
```

---

## 📸 Screenshot Reference

### **Old (Before):**
```
┌─────────────────────────────┐
│ ✅ Print Job Terkirim ke    │
│    Server!                  │
│                             │
│         [OK]                │
└─────────────────────────────┘
  ↑ Alert biasa (old)
```

### **New (After):**
```
┌─────────────────────────────┐
│ ✅ Berhasil                 │
│ Print job berhasil dikirim  │
│ ke printer EPSON!           │
└─────────────────────────────┘
  ↑ Notifikasi slide-in (new)
  ↑ Auto-dismiss 5 detik
```

---

## 🚀 Quick Start

**Untuk apply perubahan sekarang:**

```powershell
# 1. Stop server
Ctrl + C

# 2. Start server
npm run dev

# 3. Di browser
Ctrl + Shift + R (Hard refresh)

# 4. Test print
Coba print SPK atau Invoice
```

---

## ✅ Verification Complete

**Jika sudah berhasil, Anda akan lihat:**
- ✅ Notifikasi slide-in (bukan alert)
- ✅ Warna berbeda untuk status berbeda
- ✅ Dialog error detail (bukan alert sederhana)
- ✅ Opsi retry saat error
- ✅ Auto-dismiss notifikasi setelah 5 detik

**Selamat! Perubahan berhasil di-apply!** 🎉

---

**Jika masih ada masalah, check:**
1. Browser console (F12) untuk error
2. Terminal dev server untuk error
3. File imports sudah benar
4. Cache sudah di-clear

**Need help? Screenshot error dan share!** 📸
