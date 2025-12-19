# 🖨️ Panduan Print Lokal - Hasil Maksimal

## 🎯 Problem: Print Lokal Kurang Bagus?

Jika hasil print lokal tidak sebagus print server, ini karena **browser print settings** yang perlu disesuaikan.

---

## ✅ Solution: Optimasi Print Settings

### **Step 1: Pilih Ukuran Kertas yang Benar**

Saat browser print dialog muncul:

```
1. Pilih printer
2. Click "More settings" atau "Preferences"
3. Paper size: Pilih salah satu:
   - "K2" (jika tersedia)
   - "Custom" → 9.5" x 5.5"
   - "Half Letter" (terdekat)
4. Orientation: Portrait (bukan Landscape)
5. Margins: None atau Minimum
6. Scale: 100% (jangan auto-scale)
```

---

## 📋 Settings per Browser

### **Google Chrome / Edge**

```
Saat print dialog muncul:

1. Destination: Pilih printer Anda
2. Pages: All
3. Layout: Portrait
4. Color: Black and white
5. More settings ▼
   - Paper size: Custom (9.5 x 5.5 inches)
   - Margins: None
   - Scale: 100
   - Options:
     ✅ Background graphics (OFF)
     ✅ Headers and footers (OFF)
6. Print
```

### **Firefox**

```
1. Printer: Pilih printer Anda
2. Orientation: Portrait
3. Page Setup... (button)
   - Format & Options:
     - Paper Size: Custom
     - Width: 9.5 inches
     - Height: 5.5 inches
   - Margins:
     - Top: 0.2"
     - Bottom: 0.2"
     - Left: 0.3"
     - Right: 0.3"
4. OK
5. Print
```

---

## 🎯 Custom Paper Size Setup

### **Windows Printer Settings**

Untuk hasil terbaik, buat custom paper size di printer settings:

```
1. Control Panel → Devices and Printers
2. Right-click printer → Printing preferences
3. Tab "Paper/Quality" atau "Advanced"
4. Paper Size → Custom
5. Name: K2_Half
6. Width: 9.5 inches
7. Height: 5.5 inches
8. Save
9. Set as default
```

Sekarang "K2_Half" akan muncul di browser print dialog!

---

## 🔧 Printer-Specific Settings

### **EPSON LX-310 (Dot Matrix)**

```
Printing Preferences:
1. Paper Size: User Defined (9.5" x 5.5")
2. Orientation: Portrait
3. Quality: Draft (untuk speed) atau Letter Quality (untuk kualitas)
4. Font: Courier New 10pt
5. Margins: 0.2" all sides
```

### **Laser/Inkjet Printer**

```
Printing Preferences:
1. Paper Size: Custom (9.5" x 5.5")
2. Quality: Normal atau Best
3. Color: Black & White
4. Duplex: Off
```

---

## 📊 Comparison: Server vs Lokal

| Aspect | Server Print | Print Lokal (Optimized) |
|--------|--------------|-------------------------|
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (sama!) |
| **Setup** | No setup | One-time paper size setup |
| **Speed** | Fast | Medium |
| **Flexibility** | Fixed printer | Any printer |
| **Paper Size** | Auto K2 | Manual select K2 |

---

## ✅ Optimasi yang Sudah Dilakukan

Sistem sudah dioptimasi dengan:

### **1. CSS Print Optimized**
```css
@page {
    size: 9.5in 5.5in;  /* K2 exact size */
    margin: 0.2in 0.3in; /* Minimal margins */
}

body {
    font-size: 10pt;     /* Dot matrix optimal */
    line-height: 1.1;    /* Tight spacing */
    font-family: "Courier New"; /* Monospace */
}
```

### **2. Force Exact Rendering**
```css
* {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}
```

### **3. Remove Browser Defaults**
```css
html, body {
    margin: 0 !important;
    padding: 0 !important;
}
```

---

## 🎯 Quick Setup Guide

### **One-Time Setup (5 menit):**

```
1. Buat custom paper size "K2_Half" (9.5" x 5.5")
2. Set as default di printer preferences
3. Done!
```

### **Every Print (10 detik):**

```
1. Click "Print Lokal"
2. Browser dialog muncul
3. Paper size: K2_Half (sudah default!)
4. Click Print
5. ✅ Perfect!
```

---

## 🔍 Troubleshooting

### **Problem 1: Text terpotong**

**Cause:** Margins terlalu besar
**Solution:**
```
Print dialog → More settings → Margins: None
```

### **Problem 2: Font terlalu kecil/besar**

**Cause:** Browser scaling
**Solution:**
```
Print dialog → More settings → Scale: 100%
```

### **Problem 3: Spacing tidak rapi**

**Cause:** Line height browser default
**Solution:**
```
Sudah di-fix di code!
Pastikan pilih paper size K2 (9.5" x 5.5")
```

### **Problem 4: Warna tidak keluar**

**Cause:** Background graphics OFF
**Solution:**
```
Print dialog → More settings → Background graphics: ON
(Tapi untuk dot matrix, tetap OFF lebih baik)
```

---

## 💡 Pro Tips

### **Tip 1: Save Print Settings**

Chrome/Edge:
```
1. Print dialog → More settings
2. Atur semua settings
3. ✅ Save as PDF dulu
4. Settings akan tersimpan untuk next print
```

### **Tip 2: Print Preview**

Sebelum print:
```
1. Click "Print Lokal"
2. Window preview muncul
3. Check layout di screen
4. Jika OK, lanjut print
5. Jika tidak OK, close dan adjust
```

### **Tip 3: Batch Print**

Untuk print banyak:
```
1. Setup custom paper size sekali
2. Set as default
3. Semua print selanjutnya auto-perfect!
```

---

## 📱 Mobile/Tablet

**Note:** Browser print dari mobile/tablet limited.

**Recommended:**
```
1. Gunakan "Cetak ke Server" (jika tersedia)
2. Atau Remote Desktop ke PC
3. Atau Print to PDF → Transfer ke PC
```

---

## 🎓 Best Practices

### **For Best Quality:**

1. ✅ Setup custom paper size "K2_Half" (9.5" x 5.5")
2. ✅ Set margins to None atau Minimum
3. ✅ Scale: 100% (no auto-scale)
4. ✅ Orientation: Portrait
5. ✅ Quality: Letter Quality (dot matrix)

### **For Speed:**

1. ✅ Use "Cetak ke Server" (faster)
2. ✅ Or setup default settings sekali
3. ✅ Draft quality (dot matrix)

### **For Flexibility:**

1. ✅ Use "Print Lokal"
2. ✅ Can choose any printer
3. ✅ Can print to PDF
4. ✅ Can adjust settings per print

---

## 📊 Quality Checklist

**Hasil print bagus jika:**

- [ ] Text alignment rapi (tidak miring)
- [ ] Spacing konsisten
- [ ] Tidak ada text terpotong
- [ ] Font size sesuai (tidak terlalu kecil/besar)
- [ ] Margins pas (tidak terlalu besar)
- [ ] Semua content muat di 1 halaman K2

**Jika ada yang tidak OK:**

1. Check paper size: Harus K2 (9.5" x 5.5")
2. Check margins: Harus None atau Minimum
3. Check scale: Harus 100%
4. Check orientation: Harus Portrait

---

## ✅ Summary

**Untuk hasil print lokal yang sama bagusnya dengan server:**

### **One-Time Setup:**
```
1. Buat custom paper size "K2_Half"
   - Width: 9.5 inches
   - Height: 5.5 inches
2. Set as default
3. Done!
```

### **Every Print:**
```
1. Click "Print Lokal"
2. Paper size: K2_Half (auto)
3. Margins: None
4. Scale: 100%
5. Print!
```

### **Result:**
```
✅ Quality sama dengan server print
✅ Alignment perfect
✅ Spacing rapi
✅ No text terpotong
✅ Professional output!
```

---

## 🎯 Quick Reference

| Setting | Value |
|---------|-------|
| **Paper Size** | 9.5" x 5.5" (K2) |
| **Orientation** | Portrait |
| **Margins** | 0.2" (top/bottom), 0.3" (left/right) |
| **Scale** | 100% |
| **Font** | Courier New 10pt |
| **Line Height** | 1.1 |
| **Color** | Black & White |

---

**Dengan settings yang benar, print lokal akan sama bagusnya dengan server print!** 🎉

**Selamat mencetak!** 🖨️✨
