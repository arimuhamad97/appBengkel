# 📤 Cara Upload ke GitHub (Tanpa Git/Manual)

## ⚠️ MASALAH: Git Belum Terinstall

Jika muncul error "git is not recognized", berarti Git belum terinstall.

---

## 🚀 SOLUSI 1: Upload Manual via GitHub Web (PALING MUDAH)

### Langkah-Langkah:

#### **1. Buat Repository di GitHub** ✅

1. Buka browser, login ke GitHub: https://github.com/arimuhamad97
2. Klik tombol hijau **"New"** atau **"+"** → **"New repository"**
3. Isi form:
   - **Repository name:** `appBengkel`
   - **Description:** "Sistem Manajemen Bengkel Motor"
   - **Public** atau **Private** (pilih sesuai kebutuhan)
   - ❌ **JANGAN** centang "Add README" (kita sudah punya)
4. Klik **"Create repository"**

#### **2. Compress Folder Aplikasi** 📦

1. Buka folder: `c:\Users\mmc\.gemini\antigravity\scratch\bengkel-motor`
2. **HAPUS FOLDER INI DULU** (jangan di-upload):
   - ❌ `node_modules/` (terlalu besar, akan di-install ulang)
   - ❌ `*.db` (database pribadi, jangan di-upload)
   - ❌ `.env` (jika ada - file konfigurasi pribadi)
3. Select semua file & folder yang tersisa
4. Klik kanan → **"Send to"** → **"Compressed (zipped) folder"**
5. Beri nama: `bengkel-motor.zip`

#### **3. Upload ke GitHub** ⬆️

**OPSI A - Via Web Upload (File-file Kecil):**

> ⚠️ **CATATAN:** GitHub web upload ada limit ~100 files sekaligus.
> Jika terlalu banyak, gunakan Opsi B atau C.

1. Di halaman repository GitHub yang baru dibuat
2. Klik **"uploading an existing file"**
3. Drag & drop files atau klik "choose your files"
4. Tunggu upload selesai
5. Di bawah, tulis commit message: "Initial commit"
6. Klik **"Commit changes"**

**OPSI B - Via GitHub Desktop (Recommended):**

1. Download **GitHub Desktop**: https://desktop.github.com/
2. Install dan login dengan akun GitHub
3. Klik **"File"** → **"Add Local Repository"**
4. Pilih folder: `c:\Users\mmc\.gemini\antigravity\scratch\bengkel-motor`
5. Klik **"Create a repository"** (jika diminta)
6. Klik **"Publish repository"**
7. Pilih nama: `appBengkel`
8. Klik **"Publish repository"**

✅ **DONE!** Aplikasi sudah di GitHub!

**OPSI C - Via VS Code (Jika Pakai VS Code):**

1. Buka folder di VS Code
2. Klik icon Git (sidebar kiri)
3. Klik **"Initialize Repository"**
4. Klik **"..."** → **"Remote"** → **"Add Remote"**
5. Masukkan URL: `https://github.com/arimuhamad97/appBengkel.git`
6. Ketik commit message: "Initial commit"
7. Klik **"✓"** (commit)
8. Klik **"..."** → **"Push"**

---

## 🚀 SOLUSI 2: Install Git (Untuk Future Updates)

### **Download & Install Git:**

1. **Download Git:**
   ```
   https://git-scm.com/download/win
   ```

2. **Install dengan setting default:**
   - Next → Next → Next
   - Pilih **"Git from the command line and also from 3rd-party software"**
   - Next sampai selesai

3. **Restart Command Prompt/Terminal**

4. **Verify Instalasi:**
   ```bash
   git --version
   # Harus muncul: git version 2.xx.x
   ```

### **Setelah Git Terinstall:**

Jalankan lagi `git-push.bat`:
```
1. Double-click git-push.bat
2. Pilih opsi 1 (Initialize Git)
3. Follow petunjuk
```

---

## 🔄 Update Aplikasi di Masa Depan

### **Jika Pakai GitHub Desktop:**

1. Buka GitHub Desktop
2. Pastikan repository "appBengkel" terpilih
3. Lihat changes di sidebar kiri
4. Isi commit message
5. Klik **"Commit to main"**
6. Klik **"Push origin"**

✅ Done! Updates sudah di GitHub.

### **Jika Pakai VS Code:**

1. Buka folder di VS Code
2. Klik icon Git (sidebar)
3. Lihat changes
4. Ketik commit message
5. Klik **"✓"** (commit)
6. Klik **"..."** → **"Push"**

### **Jika Sudah Install Git:**

Double-click `git-push.bat` → Pilih opsi 2

---

## 📝 Checklist Sebelum Upload

Pastikan folder TIDAK mengandung:
- ❌ `node_modules/` (akan di-install ulang)
- ❌ `*.db` (database lokal)
- ❌ `.env` (environment variables)
- ❌ `package-lock.json` (optional, tapi better di-commit)
- ✅ Sudah ada `.gitignore` (untuk exclude file-file di atas)

File yang HARUS ada:
- ✅ `package.json`
- ✅ `README.md`
- ✅ `.gitignore`
- ✅ Source code (`src/`, `server/`)
- ✅ `start-app.bat`

---

## 🎯 Setelah Repository di GitHub

### **Clone di Komputer Lain:**

**Dengan GitHub Desktop:**
```
1. Buka GitHub Desktop
2. File → Clone Repository
3. Pilih: arimuhamad97/appBengkel
4. Choose lokasi
5. Klik Clone
```

**Dengan Git (Command line):**
```bash
git clone https://github.com/arimuhamad97/appBengkel.git
cd appBengkel
npm install
```

### **Setup Aplikasi:**

```bash
# Install dependencies
npm install

# Jalankan aplikasi
start-app.bat
```

---

## 🆘 Troubleshooting

### **Error: File too large (>100MB)**

GitHub ada limit 100MB per file. File besar yang common:
- `node_modules/` → Sudah di-exclude di `.gitignore` ✅
- `database.db` → Sudah di-exclude di `.gitignore` ✅

Jika masih error:
```
1. Check file size
2. Exclude file besar di .gitignore
3. Upload ulang
```

### **Error: Repository not found**

Repository belum dibuat atau typo di nama:
```
1. Check nama repository di GitHub
2. Harus: https://github.com/arimuhamad97/appBengkel
3. Case-sensitive!
```

### **Error: Permission denied**

1. Check apakah login dengan akun yang benar
2. Jika pakai Git command line, perlu Personal Access Token
3. Atau gunakan GitHub Desktop (lebih mudah)

---

## 📌 Rekomendasi

**Untuk Kemudahan:**
1. ✅ **GitHub Desktop** - Paling mudah untuk pemula
2. ✅ **VS Code** - Jika sudah pakai VS Code
3. ⚠️ **Git Command Line** - Perlu install & setup

**Workflow Terbaik:**
```
Development:
├── Edit code di VS Code/text editor
├── Test aplikasi (start-app.bat)
└── Commit & Push via GitHub Desktop

Production:
└── Pull dari GitHub di server production
```

---

## ✨ Kesimpulan

**CARA TERCEPAT SEKARANG:**

1. **Hapus `node_modules/` dan `*.db`**
2. **Download & Install GitHub Desktop**
3. **Add repository → Publish**
4. **DONE!** ✅

**Link:**
- GitHub Desktop: https://desktop.github.com/
- Repository URL: https://github.com/arimuhamad97/appBengkel

---

Semoga membantu! 🚀
