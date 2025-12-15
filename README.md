# 🏍️ Aplikasi Bengkel Motor

Sistem manajemen bengkel motor lengkap berbasis web dengan fitur queue management, inventory, service tracking, dan reporting.

## 🚀 Fitur Utama

### 📋 Manajemen Antrian
- Queue management dengan nomor antrian otomatis
- Status tracking (Menunggu, Dikerjakan, Selesai, Diambil)
- Assignment mekanik
- Service entry form lengkap

### 📦 Manajemen Persediaan
- **Total Item** - Daftar complete inventory dengan pagination (20 item/page)
- **Stok Masuk** - Input stok barang dengan search autocomplete
- **Stok Keluar** - Tracking penggunaan sparepart
- **Stok Opname** - Stock taking & adjustment dengan pagination
- Search & filter functionality

### ⚙️ Pengaturan
- Master data jenis motor (Honda, Yamaha, dll)
- Master data sparepart dengan edit functionality
- Master data jasa service
- Manajemen mekanik
- Info bengkel

### 📊 Laporan
- Laporan penjualan jasa
- Laporan penjualan sparepart
- Laporan performa mekanik
- Laporan pengeluaran
- Filter berdasarkan tanggal

### 💼 Penjualan
- Counter penjualan sparepart
- Invoice generation
- Customer management
- Riwayat penjualan

### 👥 Customer & History
- Database pelanggan
- Service history tracking
- Kilometer tracking
- Frame & engine number management

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Lucide React (icons)
- Vanilla CSS dengan CSS Variables

**Backend:**
- Node.js
- Express
- SQLite3
- bcryptjs untuk authentication

**Database:**
- SQLite dengan 19,067+ spare parts Honda genuine

## 📦 Installation

### Prerequisites
- Node.js v16+ 
- npm atau yarn

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/arimuhamad97/appBengkel.git
cd appBengkel
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup database:**
Database akan otomatis dibuat saat pertama kali running server.

4. **Start aplikasi:**

**Opsi 1 - Development Mode:**
```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend  
npm run dev
```

**Opsi 2 - Production Mode (Mudah):**
```bash
# Windows
start-app.bat

# Atau double-click file start-app.bat
```

5. **Access aplikasi:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 👤 Default Login

```
Username: admin
Password: admin123
```

**⚠️ PENTING:** Ganti password default setelah login pertama kali!

## 📱 Fitur Responsive

Aplikasi fully responsive dan mobile-friendly:
- ✅ Desktop optimized
- ✅ Tablet support  
- ✅ Mobile responsive
- ✅ Touch-friendly controls
- ✅ Horizontal scroll tables pada mobile

## 🗂️ Structure

```
bengkel-motor/
├── server/               # Backend Express server
│   ├── index.js         # Main server file
│   ├── db.js            # Database connection & schema
│   ├── database.db      # SQLite database (auto-created)
│   └── ...scripts       # Seed & utility scripts
├── src/                 # Frontend React app
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── index.css       # Global styles
├── public/             # Public assets
└── start-app.bat       # Windows startup script
```

## 🔧 Configuration

### Network Access

Aplikasi sudah dikonfigurasi untuk:
- Local access: localhost
- Network access: IPv4 address
- Auto-detect network interface

Edit `vite.config.js` untuk custom host:
```javascript
server: {
  host: '0.0.0.0',  // Listen on all interfaces
  port: 5173
}
```

### Database Location

Default: `server/database.db`

Untuk production, backup database secara berkala:
```bash
cd server
node backup-database.js
```

## 📚 Dokumentasi API

### Authentication
- `POST /api/login` - User login
- `POST /api/change-password` - Change password

### Queue Management  
- `GET /api/queue` - Get all queues
- `POST /api/queue` - Create new queue
- `PUT /api/queue/:id` - Update queue
- `DELETE /api/queue/:id` - Delete queue

### Inventory
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory
- `GET /api/stock-in` - Get stock in history
- `POST /api/stock-in` - Create stock in
- `GET /api/stock-out` - Get stock out history
- `POST /api/stock-out` - Create stock out

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get sales history

### Master Data
- `GET /api/bike-types` - Get bike types
- `POST /api/bike-types` - Create bike type
- `GET /api/part-types` - Get part types (19K+ items)
- `POST /api/part-types` - Create part type
- `PUT /api/part-types/:id` - Update part type
- `GET /api/services` - Get services
- `POST /api/services` - Create service

## 🐛 Troubleshooting

### Port already in use
Jika port 3001 atau 5173 sudah digunakan:
1. Tutup aplikasi yang menggunakan port tersebut
2. Atau ubah port di `server/index.js` dan `vite.config.js`

### Database locked
Jika database terkunci:
1. Tutup semua koneksi database
2. Restart server
3. Hapus file `database.db-shm` dan `database.db-wal`

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Update Aplikasi

Untuk update aplikasi sambil server berjalan:

```bash
# Fetch updates
git fetch origin

# Stash changes jika ada
git stash

# Pull latest
git pull origin main

# Install new dependencies
npm install

# Restart hanya jika ada perubahan backend
# Frontend akan auto-reload (HMR)
```

## 📝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created by Ari Muhammad
- GitHub: [@arimuhamad97](https://github.com/arimuhamad97)

## 🙏 Acknowledgments

- Honda parts data dari scraping Honda Cengkareng official parts
- Icons dari Lucide React
- UI inspiration dari modern workshop management systems

---

⭐ Star repository ini jika bermanfaat!
