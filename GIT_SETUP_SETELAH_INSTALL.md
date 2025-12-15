# ✅ Git Sudah Terinstall - Setup Cepat

## ⚠️ PENTING: Restart Terminal Dulu!

Setelah install Git, Anda **HARUS restart terminal/command prompt** agar Git terdeteksi.

---

## 🚀 LANGKAH CEPAT - Push ke GitHub

### **Step 1: Restart Terminal** ⚡ WAJIB!

```
1. Tutup semua terminal/command prompt yang sedang buka
2. Buka terminal/command prompt BARU
3. Lanjut ke Step 2
```

### **Step 2: Verify Git Terinstall**

Buka **Command Prompt BARU** dan jalankan:

```bash
git --version
```

Harus muncul output seperti:
```
git version 2.43.0
```

Jika masih error "not recognized":
- ❌ Terminal belum di-restart
- ❌ Git not in PATH
- ✅ Restart PC (jika masih belum bisa)

---

### **Step 3: Configure Git (Sekali Saja)**

Di terminal baru, jalankan:

```bash
git config --global user.name "Ari Muhammad"
git config --global user.email "arimuhamad97@gmail.com"
```

Verify:
```bash
git config --global user.name
git config --global user.email
```

---

### **Step 4: Cleanup Folder (Opsional tapi Recommended)**

Double-click file ini terlebih dahulu:
```
cleanup-before-upload.bat
```

Ini akan menghapus:
- node_modules (terlalu besar, akan di-install ulang)
- *.db (database lokal)
- *.log (file log)

---

### **Step 5: Initialize Git & Push ke GitHub**

**OPSI A - Menggunakan Script (MUDAH):**

1. Double-click file: **`git-push.bat`**
2. Pilih opsi: **1** (Initialize Git)
3. Tekan Enter untuk commit message default
4. Tunggu proses selesai

**OPSI B - Manual Command Line:**

Buka Command Prompt di folder ini, lalu jalankan:

```bash
# 1. Initialize Git
git init

# 2. Add remote repository
git remote add origin https://github.com/arimuhamad97/appBengkel.git

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit: Complete workshop management system"

# 5. Set main branch
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

---

## 🔐 Authentication

Saat push, akan muncul dialog login GitHub:

**Windows Credential Manager akan muncul:**
- Pilih "Sign in with your browser"
- ATAU
- Username: `arimuhamad97`
- Password: Gunakan **Personal Access Token** (bukan password GitHub biasa)

### **Cara Buat Personal Access Token:**

1. Login GitHub di browser
2. Settings → Developer settings
3. Personal access tokens → Tokens (classic)
4. Generate new token (classic)
5. Name: "Bengkel App PC"
6. Select scopes:
   - ✅ repo (full control)
   - ✅ workflow
7. Generate token
8. **COPY TOKEN** (hanya muncul sekali!)
9. Gunakan token sebagai password saat git push

---

## ✅ Setelah Berhasil Push

Repository akan tersedia di:
```
https://github.com/arimuhamad97/appBengkel
```

Untuk update selanjutnya:

```bash
# Edit code
# Lalu jalankan:

git add .
git commit -m "deskripsi perubahan"
git push origin main
```

Atau gunakan:
```
git-push.bat → Pilih opsi 2 (Commit dan Push)
```

---

## 🆘 Troubleshooting

### **Error: Permission denied (publickey)**
→ Gunakan HTTPS bukan SSH
→ URL: `https://github.com/arimuhamad97/appBengkel.git`

### **Error: Repository not found**
→ Buat repository di GitHub dulu
→ Atau check typo di nama repository

### **Error: Failed to push**
→ Pull dulu: `git pull origin main --rebase`
→ Lalu push: `git push origin main`

### **Git masih "not recognized" setelah restart**
→ Check Git terinstall di: `C:\Program Files\Git`
→ Atau coba restart PC
→ Atau gunakan **Git Bash** (installed dengan Git)

---

## 🎯 Quick Commands

```bash
# Check status
git status

# View history
git log --oneline

# Pull updates
git pull origin main

# Push updates
git push origin main

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

---

## ✨ RINGKASAN

**YANG HARUS DILAKUKAN:**

1. ✅ **Tutup & buka terminal BARU** (restart terminal)
2. ✅ **Verify:** `git --version`
3. ✅ **Configure:** git config user.name & user.email
4. ✅ **Cleanup:** Jalankan cleanup-before-upload.bat
5. ✅ **Push:** Double-click git-push.bat → Pilih 1

**Total waktu:** 5-10 menit

---

Good luck! 🚀
