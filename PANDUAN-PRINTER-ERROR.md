# 🖨️ Panduan Error Handling Printer

## Overview

Sistem sekarang dilengkapi dengan **deteksi status printer** dan **error handling** yang comprehensive untuk menangani kasus ketika printer offline, mati, atau tidak terhubung.

---

## ✅ Fitur Baru

### 1. **Notifikasi Real-time**
- ℹ️ **Info**: Saat print job sedang dikirim
- ✅ **Success**: Saat print berhasil terkirim
- ❌ **Error**: Saat terjadi kesalahan
- ⚠️ **Warning**: Untuk peringatan khusus

### 2. **Error Detection**
Sistem dapat mendeteksi berbagai jenis error:

#### **A. Server Tidak Terhubung**
```
Error: ECONNREFUSED atau Network error
```
**Penyebab:**
- Server backend tidak berjalan
- Koneksi jaringan terputus
- Firewall memblokir koneksi

**Solusi:**
- Pastikan server backend running
- Check koneksi jaringan
- Restart server

#### **B. Printer Tidak Tersedia**
```
Error: Printer not found atau PRINTER error
```
**Penyebab:**
- Printer dalam keadaan mati (power OFF)
- Kabel printer terlepas
- Driver printer bermasalah
- Printer tidak terdeteksi di sistem

**Solusi:**
- Nyalakan printer (power ON)
- Periksa kabel USB/Network
- Check printer di Device Manager
- Reinstall driver jika perlu
- Restart printer

#### **C. Printer Tidak Merespon**
```
Error: Timeout atau TIMEOUT
```
**Penyebab:**
- Printer offline
- Printer sedang digunakan aplikasi lain
- Paper jam atau error state
- Antrian print penuh

**Solusi:**
- Check status printer
- Clear print queue
- Restart printer
- Check paper dan toner

---

## 🎯 User Experience Flow

### **Normal Flow (Printer OK)**
```
1. User click "Cetak"
2. Preview muncul
3. User confirm "Cetak Sekarang"
4. 💬 Notifikasi: "Mengirim print job ke server..."
5. ✅ Notifikasi: "Print job berhasil dikirim ke printer EPSON!"
6. Preview close
7. ✅ Done!
```

### **Error Flow (Printer Offline)**
```
1. User click "Cetak"
2. Preview muncul
3. User confirm "Cetak Sekarang"
4. 💬 Notifikasi: "Mengirim print job ke server..."
5. ❌ Notifikasi: "Printer Tidak Tersedia: Printer not found"
6. ❌ Dialog muncul dengan detail error:
   
   ❌ Printer Tidak Tersedia
   
   Error: Printer not found
   
   Kemungkinan Penyebab:
   • Pastikan printer dalam keadaan menyala (power ON)
   • Periksa koneksi kabel printer ke server
   • Pastikan printer tidak sedang error atau paper jam
   • Cek apakah printer terdeteksi di sistem
   • Restart printer dan coba lagi
   
   Solusi:
   1. Periksa status printer di komputer server
   2. Pastikan printer menyala dan terhubung
   3. Restart printer jika diperlukan
   4. Hubungi IT support jika masalah berlanjut
   
   Apakah Anda ingin mencoba lagi?
   
   [Tidak] [Ya, Coba Lagi]

7. User pilih:
   - "Ya" → Retry print (kembali ke step 4)
   - "Tidak" → Close preview
```

---

## 📋 Error Messages Reference

### **1. Server Error**
```javascript
Error Title: "Server Tidak Terhubung"
Suggestions:
- Pastikan server backend berjalan
- Periksa koneksi jaringan
- Restart server jika diperlukan
```

### **2. Printer Error**
```javascript
Error Title: "Printer Tidak Tersedia"
Suggestions:
- Pastikan printer dalam keadaan menyala (power ON)
- Periksa koneksi kabel printer ke server
- Pastikan printer tidak sedang error atau paper jam
- Cek apakah printer terdeteksi di sistem
- Restart printer dan coba lagi
```

### **3. Timeout Error**
```javascript
Error Title: "Printer Tidak Merespon"
Suggestions:
- Printer mungkin sedang offline atau mati
- Periksa status printer di komputer server
- Pastikan printer tidak sedang digunakan aplikasi lain
- Coba restart printer
```

---

## 🛠️ Troubleshooting Guide

### **Problem: Print job terkirim tapi printer tidak print**

**Kemungkinan:**
1. **Printer mati** → Nyalakan printer
2. **Paper habis** → Isi kertas
3. **Paper jam** → Bersihkan paper jam
4. **Toner habis** → Ganti toner/ribbon
5. **Print queue stuck** → Clear queue di Windows

**Cara Check:**
```
1. Buka "Devices and Printers" di Windows
2. Cari printer yang digunakan (EPSON LX-310)
3. Right-click → "See what's printing"
4. Check status:
   - "Ready" = OK
   - "Offline" = Printer mati/disconnect
   - "Error" = Ada masalah hardware
   - "Paused" = Queue di-pause
```

**Cara Fix:**
```
1. Jika "Offline":
   - Check kabel printer
   - Nyalakan printer
   - Right-click printer → "Use Printer Online"

2. Jika "Error":
   - Check paper jam
   - Check toner/ribbon
   - Restart printer

3. Jika "Paused":
   - Right-click printer → "Resume Printing"

4. Jika queue stuck:
   - Cancel all documents
   - Restart Print Spooler service
```

---

## 💻 Technical Implementation

### **File Structure**
```
src/
├── utils/
│   └── printUtils.js          ← Print utility functions
└── pages/
    └── ServicePage.jsx        ← Updated with error handling
```

### **Key Functions**

#### **1. showPrintStatus()**
```javascript
showPrintStatus('success', 'Print berhasil!');
showPrintStatus('error', 'Printer offline');
showPrintStatus('warning', 'Kertas hampir habis');
showPrintStatus('info', 'Mengirim ke printer...');
```

#### **2. executePrint() - Enhanced**
```javascript
- Detects error types
- Shows appropriate messages
- Offers retry option
- Provides detailed solutions
```

---

## 📱 Notification System

### **Visual Design**
```
┌─────────────────────────────────────┐
│ 🎨 Notification Card                │
│                                     │
│ [Icon] Title                        │
│        Message                      │
│                                     │
│ Auto-dismiss: 5 seconds             │
│ Position: Top-right                 │
│ Animation: Slide-in                 │
└─────────────────────────────────────┘
```

### **Color Coding**
- ✅ **Success**: Green (#10b981)
- ❌ **Error**: Red (#ef4444)
- ⚠️ **Warning**: Orange (#f59e0b)
- ℹ️ **Info**: Blue (#3b82f6)

---

## 🔧 Configuration

### **Backend (server/index.js)**
Pastikan endpoint print sudah handle error dengan baik:

```javascript
app.post('/api/print', async (req, res) => {
    try {
        const { text } = req.body;
        
        // Check if printer exists
        if (!printerExists()) {
            return res.status(500).json({ 
                error: 'Printer not found. Pastikan printer menyala dan terhubung.' 
            });
        }
        
        // Send to printer
        await sendToPrinter(text);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ 
            error: error.message || 'Print failed' 
        });
    }
});
```

---

## ✅ Testing Checklist

### **Test Scenarios**

1. **✅ Normal Print (Printer ON)**
   - [ ] Preview muncul
   - [ ] Click "Cetak Sekarang"
   - [ ] Notifikasi "Mengirim..." muncul
   - [ ] Notifikasi "Berhasil!" muncul
   - [ ] Printer print dokumen
   - [ ] Preview close

2. **❌ Printer OFF**
   - [ ] Preview muncul
   - [ ] Click "Cetak Sekarang"
   - [ ] Notifikasi "Mengirim..." muncul
   - [ ] Notifikasi error muncul
   - [ ] Dialog error detail muncul
   - [ ] Suggestions ditampilkan
   - [ ] Retry option tersedia

3. **❌ Server Offline**
   - [ ] Preview muncul
   - [ ] Click "Cetak Sekarang"
   - [ ] Error "Server Tidak Terhubung"
   - [ ] Suggestions untuk server muncul

4. **❌ Network Error**
   - [ ] Preview muncul
   - [ ] Click "Cetak Sekarang"
   - [ ] Error network detected
   - [ ] Appropriate message shown

---

## 📞 Support Information

### **Untuk User**
```
Jika mengalami masalah print:

1. Check printer menyala
2. Check kabel terhubung
3. Restart printer
4. Coba print lagi

Jika masih error:
→ Hubungi IT Support
→ Screenshot error message
→ Catat waktu error terjadi
```

### **Untuk IT Support**
```
Diagnostic Steps:

1. Check printer status di server
2. Check print spooler service
3. Check printer driver
4. Check network connection
5. Check application logs
6. Test print dari Notepad

Common Fixes:
- Restart Print Spooler
- Reinstall printer driver
- Clear print queue
- Restart printer
```

---

## 🎓 Best Practices

### **For Users**
1. ✅ Selalu check printer sebelum print
2. ✅ Pastikan kertas tersedia
3. ✅ Jangan spam print button
4. ✅ Tunggu notifikasi selesai
5. ✅ Report error ke IT jika persisten

### **For Developers**
1. ✅ Always handle print errors
2. ✅ Provide clear error messages
3. ✅ Offer retry options
4. ✅ Log errors for debugging
5. ✅ Test with printer offline

---

## 📊 Error Statistics (Monitoring)

Untuk monitoring, track metrics berikut:

```javascript
{
  total_prints: 1000,
  successful: 950,
  failed: 50,
  error_types: {
    printer_offline: 30,
    server_error: 10,
    timeout: 5,
    other: 5
  },
  retry_success_rate: 0.8
}
```

---

## 🚀 Future Enhancements

### **Planned Features**
- [ ] Printer status indicator di UI
- [ ] Auto-retry dengan backoff
- [ ] Print queue management
- [ ] Multiple printer support
- [ ] Print history log
- [ ] Email notification untuk errors
- [ ] SMS alert untuk critical errors

---

## 📝 Summary

**Sekarang sistem memiliki:**
✅ Real-time notifications
✅ Detailed error messages
✅ Specific error detection
✅ User-friendly solutions
✅ Retry mechanism
✅ Professional UX

**User benefit:**
- Tahu kenapa print gagal
- Tahu cara fix masalah
- Bisa retry tanpa refresh
- Tidak bingung saat error

**IT benefit:**
- Less support tickets
- Clear error logs
- Easy troubleshooting
- Better user experience

---

**Dokumentasi ini akan diupdate seiring development!** 🚀
