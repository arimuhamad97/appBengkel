# ✅ Role-Based Landing Page

## 🎯 FITUR BARU

User dengan role berbeda akan diarahkan ke halaman yang sesuai saat login:

### **📊 Landing Page per Role:**

| Role | Landing Page | URL |
|------|--------------|-----|
| **Gudang** | 📦 Persediaan (Inventory) | `/inventory` |
| **Admin** | 🛠️ Service Queue | `/` (service) |
| **Kasir** | 🛠️ Service Queue | `/` (service) |
| **Owner** | 🛠️ Service Queue | `/` (service) |
| **Lainnya** | 🛠️ Service Queue | `/` (service) |

## ✨ CARA KERJA

### **Saat Login:**

```javascript
// LoginPage.jsx
if (user.role === 'gudang') {
    navigate('/inventory');  // → Menu Persediaan
} else {
    navigate('/');          // → Service Queue
}
```

### **Saat Refresh / Direct URL:**

```javascript
// App.jsx - Route "/"
if (user.role === 'gudang') {
    redirect to '/inventory';  // → Menu Persediaan
} else {
    show ServicePage;         // → Service Queue  
}

// Route "*" (404/any unknown URL)
if (user.role === 'gudang') {
    redirect to '/inventory';  // → Menu Persediaan
} else {
    redirect to '/';          // → Service Queue
}
```

---

## 📝 TESTING

### **Test Role Gudang:**

```
1. Logout (jika sedang login)
2. Login dengan user role "gudang"
   - Username: (username role gudang)
   - Password: (password)
3. Setelah login:
   ✅ Langsung ke halaman Persediaan
   ✅ Sidebar menu "Persediaan" aktif
   ✅ URL: /inventory

4. Refresh halaman (F5):
   ✅ Tetap di halaman Persediaan

5. Ketik URL "/" manual di address bar:
   ✅ Auto-redirect ke /inventory
```

### **Test Role Admin/Lainnya:**

```
1. Logout
2. Login dengan user role "admin" atau lainnya
   - Username: admin
   - Password: admin123
3. Setelah login:
   ✅ Langsung ke halaman Service Queue
   ✅ Sidebar menu "Antrian" aktif
   ✅ URL: /

4. Refresh halaman (F5):
   ✅ Tetap di Service Queue

5. Buka /inventory manual:
   ✅ Bisa akses (tetap allowed)
```

---

## 🔐 USER ROLES

### **Cara Membuat User Role Gudang:**

**Option 1 - Via Database (Manual):**

```sql
-- Buka database dengan SQLite browser
-- Update user existing
UPDATE users 
SET role = 'gudang' 
WHERE username = 'username_gudang';

-- Atau create user baru
INSERT INTO users (username, password, role, full_name)
VALUES ('gudang', 'hashed_password', 'gudang', 'Staff Gudang');
```

**Option 2 - Via Backend API:**

```javascript
// POST /api/users (jika endpoint ada)
{
    "username": "gudang",
    "password": "password123",
    "role": "gudang",
    "full_name": "Staff Gudang"
}
```

**Option 3 - Via Script (Recommended):**

Bisa buatkan script untuk create user:
```bash
cd server
node create-gudang-user.js
```

---

## 🎨 MENU ACCESS PER ROLE

### **Role: Gudang**
```
✅ Persediaan (Full Access)
   ├─ Total Item
   ├─ Stok Masuk
   ├─ Stok Keluar
   └─ Stok Opname

⚠️  Penjualan (Read-only recommended)
⚠️  Service (Biasanya tidak perlu)
⚠️  Reports (Terbatas sesuai kebutuhan)
✅ Pengaturan (Jenis Sparepart)
```

### **Role: Admin/Kasir**
```
✅ Antrian Service (Full Access)
✅ Penjualan (Full Access)
✅ Persediaan (Full Access)
✅ Reports (Full Access)
✅ Attendance (Full Access)
✅ Pengaturan (Full Access)
```

### **Role: Owner**
```
✅ All Menus (Full Access)
✅ Reports (Primary Focus)
✅ Database Backup
```

---

## 💡 BEST PRACTICES

### **Role Assignment:**

```
Gudang    → Fokus inventory management
Kasir     → Fokus penjualan & service
Mekanik   → Fokus service queue (jika ada role)
Admin     → Full access semua menu
Owner     → Reports & oversight
```

### **Default Landing:**

```
Gudang    → /inventory (langsung kerja stock)
Kasir     → /sales atau / (service queue)
Admin     → / (service queue/dashboard)
Owner     → /reports
```

---

## 🔄 CUSTOMIZATION

Untuk menambahkan role atau landing page custom:

### **1. Update LoginPage.jsx:**

```javascript
if (data.user.role === 'gudang') {
    navigate('/inventory');
} else if (data.user.role === 'owner') {
    navigate('/reports');  // Owner to Reports
} else if (data.user.role === 'kasir') {
    navigate('/sales');    // Kasir to Sales
} else {
    navigate('/');         // Default to Service
}
```

### **2. Update App.jsx:**

```javascript
<Route path="/" element={
    user?.role === 'gudang' ? <Navigate to="/inventory" /> :
    user?.role === 'owner' ? <Navigate to="/reports" /> :
    user?.role === 'kasir' ? <Navigate to="/sales" /> :
    <ServicePage user={user} />
} />
```

---

## 🆘 TROUBLESHOOTING

### **Role gudang tetap ke Service Queue:**

**Check 1: Role di database**
```sql
SELECT username, role FROM users WHERE username = 'gudang';
-- Pastikan role = 'gudang' (lowercase)
```

**Check 2: Data user di localStorage**
```javascript
// Di browser console (F12)
console.log(localStorage.getItem('bengkel_user'));
// Check field "role"
```

**Check 3: Logout dan login ulang**
```
Kadang data cached, logout dan login ulang
```

### **Redirect loop:**

Pastikan tidak ada conflict di routing logic.

### **404 Error:**

Check routes di App.jsx semua sudah benar.

---

## ✨ BENEFITS

- ✅ **User Experience lebih baik**
  - Gudang langsung ke inventory
  - Tidak perlu navigate manual

- ✅ **Efisiensi kerja**
  - Setiap role langsung ke tugas utama
  - Less clicks, faster workflow

- ✅ **Role Separation**
  - Clear responsibility per role
  - Better organization

- ✅ **Persistent**  
  - Redirect tetap work setelah refresh
  - URL direct access handled

---

## 📋 CHECKLIST

After implementation:

- ✅ LoginPage redirect logic updated
- ✅ App.jsx route "/" with role check
- ✅ App.jsx route "*" (fallback) with role check
- ✅ Test with gudang user
- ✅ Test with admin user
- ✅ Test refresh behavior
- ✅ Test direct URL access

---

**Sekarang user role gudang langsung ke menu Persediaan!** 🎉

Landing page disesuaikan dengan role user untuk UX yang lebih baik! ✅

Semoga membantu! 🚀
