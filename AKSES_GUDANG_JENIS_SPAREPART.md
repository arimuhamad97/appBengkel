# ✅ Akses Gudang ke Menu Pengaturan - Jenis Sparepart

## 🎯 FITUR BARU

Role **gudang** sekarang bisa akses menu **Pengaturan → Jenis Sparepart** untuk menambah, edit, dan hapus jenis sparepart.

---

## 📋 AKSES YANG DIBERIKAN

### **Role Gudang Bisa:**

✅ **Menu Persediaan** (Full Access)
- Total Item
- Stok Masuk
- Stok Keluar
- Stok Opname

✅ **Menu Pengaturan** (Limited Access)
- ✅ Jenis Sparepart (CRUD: Create, Read, Update, Delete)
- ❌ Profil Bengkel (Hidden)
- ❌ Daftar Jasa (Hidden)
- ❌ Karyawan (Hidden)
- ❌ Type Motor (Hidden)

---

## ✨ CARA KERJA

### **Sidebar Menu:**

```javascript
// Role Gudang melihat:
├─ 📦 Persediaan
└─ ⚙️ Pengaturan

// Role Admin/Lainnya melihat:
├─ 🛠️ Servis
├─ 💰 Penjualan
├─ 📦 Persediaan
├─ 📊 Laporan
├─ 🕐 Absensi
├─ 💾 Backup Database
└─ ⚙️ Pengaturan
```

### **Di Halaman Pengaturan:**

**Role Gudang:**
```
Tabs visible:
└─ 📝 Jenis Sparepart (only one tab)

Default active:
└─ Langsung ke tab Jenis Sparepart
```

**Role Admin/Lainnya:**
```
Tabs visible:
├─ 🏢 Profil Bengkel
├─ 🔧 Daftar Jasa (Harga)
├─ 👷 Karyawan
├─ 🏍️ Type Motor
└─ 📝 Jenis Sparepart

Default active:
└─ Profil Bengkel
```

---

## 📝 OPERASI YANG BISA DILAKUKAN

### **Role Gudang di Jenis Sparepart:**

#### **1. CREATE (Tambah)** ✅
```
1. Buka Pengaturan → Jenis Sparepart
2. Isi form "Tambah Jenis Sparepart Baru"
3. Klik "Tambah"
4. ✅ Item otomatis muncul di inventory (stok = 0)
```

#### **2. READ (Lihat)** ✅
```
- Lihat daftar semua jenis sparepart
- Search berdasarkan kode/nama
- Pagination 20 item per halaman
```

#### **3. UPDATE (Edit)** ✅
```
1. Klik tombol Edit (✏️) pada item
2. Form inline muncul
3. Edit data (nama, harga, dll)
4. Klik "Simpan"
5. ✅ Perubahan sync ke inventory
```

#### **4. DELETE (Hapus)** ✅
```
1. Klik tombol Hapus (🗑️)
2. Confirm delete
3. ✅ Terhapus dari part_types & inventory
```

---

## 🔄 FILES YANG DIUPDATE

### **1. `src/components/Sidebar.jsx`**
```javascript
// Before:
const displayMenu = (user?.role === 'gudang')
    ? menuItems.filter(item => item.to === '/inventory')
    : menuItems;

// After:
const displayMenu = (user?.role === 'gudang')
    ? menuItems.filter(item => ['/inventory', '/settings'].includes(item.to))
    : menuItems;
```

**Result:**
- Gudang sekarang bisa lihat menu "Pengaturan" ✅

---

### **2. `src/pages/SettingsPage.jsx`**

**A. Accept user prop & set default tab:**
```javascript
// Before:
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('workshop');

// After:
export default function SettingsPage({ user }) {
    const [activeTab, setActiveTab] = useState(
        user?.role === 'gudang' ? 'partTypes' : 'workshop'
    );
```

**Result:**
- Role gudang default ke tab "Jenis Sparepart" ✅
- Role lain default ke tab "Profil Bengkel" ✅

**B. Conditional tabs rendering:**
```javascript
{user?.role !== 'gudang' && (
    <>
        <button>Profil Bengkel</button>
        <button>Daftar Jasa</button>
        <button>Karyawan</button>
        <button>Type Motor</button>
    </>
)}
<button>Jenis Sparepart</button>  // Always visible
```

**Result:**
- Role gudang hanya lihat 1 tab ✅
- Role lain lihat semua tabs ✅

---

## 📝 TESTING

### **Test Role Gudang:**

```
1. Logout (jika sedang login)
2. Login dengan user role "gudang"

3. Check Sidebar:
   ✅ Melihat menu "Persediaan"
   ✅ Melihat menu "Pengaturan"
   ❌ TIDAK melihat menu lain (Servis, Penjualan, dll)

4. Klik menu "Pengaturan":
   ✅ Langsung ke tab "Jenis Sparepart"
   ✅ Hanya ada 1 tab (Jenis Sparepart)
   ❌ Tab lain hidden (Profil, Jasa, Karyawan, Motor)

5. Test CRUD:
   ✅ Tambah jenis sparepart baru
   ✅ Edit jenis sparepart
   ✅ Hapus jenis sparepart
   ✅ Search & pagination jalan normal

6. Check di Persediaan → Total Item:
   ✅ Item baru muncul dengan stok = 0
   ✅ Edit tersinkron
   ✅ Delete terhapus
```

### **Test Role Admin:**

```
1. Logout
2. Login dengan role "admin"

3. Check Sidebar:
   ✅ Melihat SEMUA menu

4. Klik menu "Pengaturan":
   ✅ Default ke tab "Profil Bengkel"
   ✅ Ada 5 tabs (Profil, Jasa, Karyawan, Motor, Sparepart)
   ✅ Bisa switch antar tabs
```

---

## 💡 USE CASE

### **Workflow Staff Gudang:**

```
SKENARIO: Ada part baru masuk

1. Login sebagai gudang
   └─ Langsung ke /inventory (Persediaan)

2. Check apakah part sudah ada di master data:
   ├─ Jika TIDAK ada:
   │  ├─ Klik menu "Pengaturan"
   │  ├─ Tab "Jenis Sparepart" sudah aktif
   │  ├─ Tambah jenis sparepart baru
   │  └─ Klik "Tambah"
   │
   └─ Jika SUDAH ada:
       └─ Lanjut Stok Masuk

3. Kembali ke "Persediaan":
   ├─ Klik "Stok Masuk"
   ├─ Cari part (otomatis ada di suggestions)
   ├─ Input qty
   └─ Simpan

4. Check "Total Item":
   └─ ✅ Stok bertambah
```

---

## 🔐 PERMISSION MATRIX

| Feature | Admin | Gudang | Kasir | Owner |
|---------|-------|--------|-------|-------|
| **Pengaturan:**
| Profil Bengkel | ✅ | ❌ | ⚠️ | ✅ |
| Daftar Jasa | ✅ | ❌ | ⚠️ | ✅ |
| Karyawan | ✅ | ❌ | ❌ | ✅ |
| Type Motor | ✅ | ❌ | ⚠️ | ✅ |
| **Jenis Sparepart** | **✅** | **✅** | **⚠️** | **✅** |
| **Persediaan:**
| Total Item | ✅ | ✅ | ⚠️ | ✅ |
| Stok Masuk | ✅ | ✅ | ❌ | ✅ |
| Stok Keluar | ✅ | ✅ | ❌ | ✅ |
| Stok Opname | ✅ | ✅ | ❌ | ✅ |

Legend:
- ✅ Full Access
- ⚠️ Read-only / Limited
- ❌ No Access

---

## 🆘 TROUBLESHOOTING

### **Role gudang tidak bisa lihat menu Pengaturan:**

**Check 1: Role di database**
```sql
SELECT username, role FROM users WHERE username = 'gudang';
-- Pastikan role = 'gudang' (lowercase)
```

**Check 2: Logout & login ulang**
```
Kadang data cached, logout dan login ulang
```

**Check 3: Hard refresh**
```
Ctrl+Shift+R (hard refresh browser)
```

### **Tab lain masih muncul untuk role gudang:**

**Check**: Frontend auto-reload dengan HMR, tapi kadang perlu manual refresh.

**Solution**:
```
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Atau restart dev server
```

---

## ✨ BENEFITS

- ✅ **Efisiensi** - Gudang bisa tambah part tanpa tunggu admin
- ✅ **Real-time** - Part baru langsung available untuk stok masuk
- ✅ **Role Separation** - Clear responsibility
- ✅ **Security** - Gudang tidak akses setting sensitif (profil, karyawan)
- ✅ **UX** - Interface simplified untuk role gudang
- ✅ **Productivity** - Less bottleneck, faster workflow

---

## 🎯 RINGKASAN

**YANG SUDAH DILAKUKAN:**

```
1. ✅ Update Sidebar.jsx
   - Gudang bisa lihat menu Pengaturan

2. ✅ Update SettingsPage.jsx
   - Default tab untuk gudang = partTypes
   - Hide tabs yang tidak perlu
   - Accept user prop

3. ✅ Frontend auto-reload (HMR)
   - Tidak perlu restart!

READY TO USE! ✅
```

**Waktu implementasi:** Instant (HMR auto-reload)

---

**Role gudang sekarang punya akses untuk manage master data sparepart!** 🎉

Self-service untuk tambah part baru = Workflow lebih efisien! ✅🚀

Semoga membantu! 📦✨
