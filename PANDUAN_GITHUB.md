# 📤 Panduan Push ke GitHub

## 🔧 Persiapan

### 1. Install Git (Jika Belum Ada)

Download dan install Git dari: https://git-scm.com/download/win

Setelah install, restart terminal/command prompt.

---

## 🚀 Langkah-Langkah Push ke GitHub

### 1. Buka Terminal/Command Prompt di Folder Aplikasi

```bash
cd c:\Users\mmc\.gemini\antigravity\scratch\bengkel-motor
```

### 2. Initialize Git Repository

```bash
git init
```

### 3. Configure Git (Jika Pertama Kali)

```bash
git config --global user.name "Ari Muhammad"
git config --global user.email "arimuhamad97@gmail.com"
```

### 4. Add Remote Repository

```bash
git remote add origin https://github.com/arimuhamad97/appBengkel.git
```

### 5. Add All Files

```bash
git add .
```

### 6. Commit Changes

```bash
git commit -m "Initial commit: Complete workshop management system"
```

### 7. Push ke GitHub

**Jika repository kosong (first push):**
```bash
git branch -M main
git push -u origin main
```

**Jika repository sudah ada:**
```bash
git push origin main
```

---

## 🔄 Update Aplikasi Saat Server Berjalan

### Cara 1: Update Tanpa Downtime (Recommended)

**Terminal 1 - Biarkan Server Tetap Jalan**
```bash
# Server berjalan di sini - JANGAN DITUTUP
cd server
node index.js
```

**Terminal 2 - Pull Updates**
```bash
# Terminal baru
cd c:\Users\mmc\.gemini\antigravity\scratch\bengkel-motor

# Fetch latest changes
git fetch origin

# Stash local changes (jika ada)
git stash

# Pull updates
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Apply stashed changes (jika tadi ada)
git stash pop
```

**Frontend akan auto-reload (Hot Module Replacement)**
- Vite otomatis reload saat ada perubahan
- Tidak perlu restart frontend

**Backend perlu restart hanya jika:**
- Ada perubahan di `server/` folder
- Ada dependency baru di `package.json`

Cara restart backend tanpa stop service:
```bash
# Ctrl+C di Terminal 1, lalu:
node index.js
```

---

### Cara 2: Update dengan Restart Cepat

```bash
# Stop server (Ctrl+C)

# Pull updates
git pull origin main

# Install dependencies
npm install

# Restart server
start-app.bat
```

Downtime: ~10-30 detik

---

## 📝 Workflow Development

### Setiap Kali Ada Perubahan:

```bash
# Check status
git status

# Add changes
git add .

# Commit dengan message yang jelas
git commit -m "feat: menambahkan fitur edit sparepart"

# Push ke GitHub
git push origin main
```

### Commit Message Guidelines:

- `feat:` - Fitur baru
- `fix:` - Bug fixes
- `docs:` - Update dokumentasi
- `style:` - Format/styling
- `refactor:` - Refactoring code
- `perf:` - Performance improvement
- `test:` - Menambah tests

**Contoh:**
```bash
git commit -m "feat: tambah pagination di stok opname"
git commit -m "fix: bug stok tidak bertambah di total item"
git commit -m "docs: update README dengan panduan instalasi"
```

---

## 🌿 Branching Strategy (Optional)

### Untuk Development Terorganisir:

**Main Branch** - Production ready code
```bash
git checkout main
```

**Development Branch** - Development code
```bash
git checkout -b development
# Work on features
git commit -m "feat: new feature"
git push origin development
```

**Feature Branch** - Specific features
```bash
git checkout -b feature/edit-sparepart
# Work on feature
git commit -m "feat: implement edit functionality"
git push origin feature/edit-sparepart
# Create Pull Request di GitHub
# Merge setelah review
```

---

## 🔐 Authentication

### Jika Diminta Login:

**Option 1: Personal Access Token**
1. Buka GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy token
5. Gunakan token sebagai password saat git push

**Option 2: GitHub CLI**
```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login
```

**Option 3: SSH Key**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "arimuhamad97@gmail.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub → Settings → SSH Keys
```

---

## 📦 File yang Di-ignore (.gitignore)

File-file ini TIDAK akan di-commit:
- ✅ `node_modules/` - Dependencies
- ✅ `*.db` - Database files
- ✅ `.env` - Environment variables
- ✅ `dist/` - Build output
- ✅ `*.log` - Log files

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/arimuhamad97/appBengkel.git
```

### Error: "failed to push some refs"
```bash
# Pull first
git pull origin main --rebase
git push origin main
```

### Undo Last Commit
```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Discard Local Changes
```bash
# Specific file
git checkout -- filename

# All files
git reset --hard HEAD
```

### View Commit History
```bash
git log --oneline
git log --graph --oneline --all
```

---

## 🎯 Best Practices

1. **Commit Sering** - Small, focused commits
2. **Pull Sebelum Push** - Hindari conflicts
3. **Descriptive Messages** - Jelas dan bermakna
4. **Test Before Commit** - Pastikan app jalan
5. **Backup Database** - Jangan commit database production
6. **Use .gitignore** - Jangan commit file tidak perlu
7. **Branch Protection** - Protect main branch di GitHub settings

---

## 📞 Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

✨ Happy Coding!
