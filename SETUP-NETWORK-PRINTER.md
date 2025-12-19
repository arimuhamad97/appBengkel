# 🖨️ Panduan Setup Network Printer

## Overview

Panduan ini menjelaskan cara setup printer sharing dari server ke semua PC client di jaringan LAN, sehingga semua PC bisa print ke printer yang terhubung ke server.

---

## 🎯 Benefit

✅ Semua PC client bisa print ke printer server
✅ Tidak perlu printer di setiap PC
✅ Centralized printer management
✅ Native Windows feature (no extra software)
✅ Works dengan tombol "Print Lokal" di aplikasi

---

## 📋 Prerequisites

**Di Server (PC dengan printer):**
- ✅ Printer EPSON LX-310 terhubung dan terinstall
- ✅ Windows 10/11
- ✅ IP Address: `192.168.1.100` (sesuaikan dengan IP server Anda)
- ✅ Network sharing enabled

**Di Client (PC yang akan print):**
- ✅ Windows 10/11
- ✅ Terhubung ke LAN yang sama dengan server
- ✅ Bisa ping ke server (`ping 192.168.1.100`)

---

## 🛠️ Step 1: Share Printer di Server

### **1.1 Buka Printer Settings**
```
1. Tekan Windows + R
2. Ketik: control printers
3. Enter
```

### **1.2 Share Printer**
```
1. Cari printer "EPSON LX-310"
2. Right-click → Printer properties
3. Tab "Sharing"
4. ✅ Centang "Share this printer"
5. Share name: EPSON_LX310 (tanpa spasi)
6. Click "Apply"
7. Click "OK"
```

### **1.3 Enable Network Discovery (Jika belum)**
```
1. Control Panel → Network and Sharing Center
2. Change advanced sharing settings
3. Turn on network discovery
4. Turn on file and printer sharing
5. Turn off password protected sharing (untuk LAN internal)
6. Save changes
```

### **1.4 Check Firewall**
```
1. Windows Defender Firewall
2. Allow an app through firewall
3. Pastikan "File and Printer Sharing" ✅ checked
4. OK
```

### **1.5 Verify Share**
```
1. Buka File Explorer
2. Address bar ketik: \\localhost
3. Enter
4. Anda harus lihat printer "EPSON_LX310"
```

---

## 🖥️ Step 2: Add Network Printer di Client

### **2.1 Test Koneksi ke Server**
```
1. Tekan Windows + R
2. Ketik: cmd
3. Enter
4. Ketik: ping 192.168.1.100
5. Pastikan Reply (bukan Request timed out)
```

### **2.2 Browse Network Printer**
```
1. Tekan Windows + R
2. Ketik: \\192.168.1.100
3. Enter
4. Anda harus lihat printer "EPSON_LX310"
5. Double-click printer
6. Windows akan auto-install driver
7. Tunggu sampai selesai
```

### **2.3 Add Printer Manual (Alternatif)**

Jika cara 2.2 tidak berhasil:

```
1. Control Panel → Devices and Printers
2. Click "Add a printer"
3. Click "The printer that I want isn't listed"
4. Select "Select a shared printer by name"
5. Ketik: \\192.168.1.100\EPSON_LX310
6. Click "Next"
7. Install driver jika diminta
8. Click "Next" → "Finish"
```

### **2.4 Set as Default (Optional)**
```
1. Devices and Printers
2. Right-click "EPSON_LX310 on 192.168.1.100"
3. Set as default printer
```

### **2.5 Test Print**
```
1. Right-click printer
2. Printer properties
3. Print Test Page
4. Pastikan printer print!
```

---

## 🎯 Step 3: Gunakan di Aplikasi

### **3.1 Print SPK**
```
1. Buka aplikasi bengkel
2. Service → Pilih antrian
3. Click "Cetak"
4. Preview muncul
5. Click "Print Lokal" (tombol hijau)
6. Browser print dialog muncul
7. Pilih printer:
   - "EPSON_LX310 on 192.168.1.100" (network)
   - atau printer lokal lainnya
8. Click "Print"
9. ✅ Printer print!
```

### **3.2 Print Invoice**
```
1. Service → Tab "Sudah Bayar"
2. Click invoice
3. Click "Print Lokal" (tombol hijau)
4. Browser print dialog muncul
5. Pilih printer "EPSON_LX310 on 192.168.1.100"
6. Click "Print"
7. ✅ Printer print!
```

---

## 🔧 Troubleshooting

### **Problem 1: Tidak bisa lihat printer di \\192.168.1.100**

**Solusi:**
```
1. Check network discovery di server:
   - Control Panel → Network and Sharing
   - Advanced sharing settings
   - Turn on network discovery
   - Turn on file and printer sharing

2. Check firewall di server:
   - Windows Defender Firewall
   - Allow File and Printer Sharing

3. Restart server dan client

4. Coba ping server dari client:
   ping 192.168.1.100
```

### **Problem 2: Driver tidak terinstall**

**Solusi:**
```
1. Download driver EPSON LX-310 dari website Epson
2. Install di PC client
3. Coba add printer lagi
```

### **Problem 3: Access Denied**

**Solusi:**
```
Di Server:
1. Control Panel → Network and Sharing
2. Advanced sharing settings
3. Turn off password protected sharing
4. Save changes
5. Restart server
```

### **Problem 4: Printer offline di client**

**Solusi:**
```
1. Devices and Printers
2. Right-click printer
3. "See what's printing"
4. Printer menu → Use Printer Online
5. Atau restart Print Spooler:
   - Services.msc
   - Print Spooler
   - Restart
```

### **Problem 5: Print job stuck**

**Solusi:**
```
1. Devices and Printers
2. Right-click printer
3. "See what's printing"
4. Cancel all documents
5. Restart Print Spooler service
```

---

## 📊 Verification Checklist

### **Di Server:**
- [ ] Printer shared dengan nama "EPSON_LX310"
- [ ] Network discovery ON
- [ ] File and printer sharing ON
- [ ] Firewall allow printer sharing
- [ ] Bisa lihat printer di \\localhost

### **Di Client:**
- [ ] Bisa ping server (192.168.1.100)
- [ ] Bisa browse \\192.168.1.100
- [ ] Bisa lihat printer "EPSON_LX310"
- [ ] Printer terinstall di Devices and Printers
- [ ] Test page berhasil print
- [ ] Printer status "Ready" (not offline)

### **Di Aplikasi:**
- [ ] Tombol "Print Lokal" muncul (warna hijau)
- [ ] Click "Print Lokal" → Browser print dialog muncul
- [ ] Network printer muncul di list
- [ ] Bisa select network printer
- [ ] Print berhasil

---

## 🎯 Best Practices

### **1. Naming Convention**
```
Share name: EPSON_LX310
- Tanpa spasi
- Huruf besar untuk clarity
- Underscore untuk separator
```

### **2. Security**
```
Untuk LAN internal:
- Turn off password protected sharing
- Enable network discovery
- Allow printer sharing di firewall

Untuk network public:
- Keep password protected sharing ON
- Gunakan credentials untuk access
```

### **3. Maintenance**
```
Weekly:
- Check printer status di server
- Clear print queue jika stuck
- Restart Print Spooler jika perlu

Monthly:
- Update printer driver
- Check network connectivity
- Verify all clients bisa print
```

---

## 💡 Tips & Tricks

### **Tip 1: Quick Access**
```
Buat shortcut di desktop client:
1. Right-click desktop → New → Shortcut
2. Location: \\192.168.1.100\EPSON_LX310
3. Name: "Printer Server"
4. Finish

Double-click untuk quick access!
```

### **Tip 2: Batch Setup**
```
Untuk setup banyak client, buat batch file:

setup-printer.bat:
---
@echo off
echo Installing network printer...
rundll32 printui.dll,PrintUIEntry /in /n "\\192.168.1.100\EPSON_LX310"
echo Done!
pause
---

Run di setiap client untuk auto-install!
```

### **Tip 3: Monitor Print Queue**
```
Di server, buat shortcut untuk monitor queue:
1. Right-click printer
2. "See what's printing"
3. Pin to taskbar

Quick access untuk check queue!
```

---

## 📱 Mobile/Tablet Access

**Note:** Network printer hanya works untuk Windows PC. Untuk mobile/tablet:

**Option 1: Remote Desktop**
```
1. Install Microsoft Remote Desktop
2. Connect ke PC server/client
3. Print dari remote session
```

**Option 2: Print to PDF**
```
1. Di aplikasi, pilih "Print Lokal"
2. Pilih "Microsoft Print to PDF"
3. Save PDF
4. Transfer ke PC untuk print
```

---

## 🎓 Training Guide untuk Staff

### **Untuk Front Desk:**
```
1. Buka aplikasi bengkel
2. Buat SPK atau Invoice
3. Click "Print Lokal" (tombol hijau)
4. Pilih printer "EPSON_LX310 on 192.168.1.100"
5. Click Print
6. Ambil printout di printer server

Jika error:
- Check printer menyala
- Check kertas tersedia
- Hubungi IT support
```

### **Untuk IT Support:**
```
1. Verify network connectivity
2. Check printer status di server
3. Check Print Spooler service
4. Clear print queue jika stuck
5. Restart printer jika perlu
6. Reinstall driver jika persistent error
```

---

## 📞 Support Information

**Jika ada masalah:**

1. **Check basics:**
   - Printer menyala?
   - Kertas tersedia?
   - Network connected?

2. **Check server:**
   - Printer shared?
   - Network discovery ON?
   - Firewall allow sharing?

3. **Check client:**
   - Bisa ping server?
   - Printer terinstall?
   - Printer status "Ready"?

4. **Contact IT:**
   - Screenshot error message
   - Note waktu error terjadi
   - Coba dari PC lain

---

## ✅ Summary

**Setup sekali:**
1. ✅ Share printer di server (5 menit)
2. ✅ Add network printer di client (5 menit per PC)
3. ✅ Test print (1 menit)

**Gunakan selamanya:**
1. ✅ Click "Print Lokal"
2. ✅ Pilih network printer
3. ✅ Print!

**Benefits:**
- ✅ Semua PC bisa print
- ✅ Centralized printer
- ✅ No extra software
- ✅ Native Windows feature
- ✅ Easy maintenance

---

**Selamat! Network printer sudah ready!** 🎉

**Next step:** Test print dari semua PC client! 🖨️
