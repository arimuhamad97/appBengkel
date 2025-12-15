
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

const spareparts = [
    // OLI
    { id: 'OLI001', name: 'Oli Mesin MPX1 1L', price: 55000, stock: 24, category: 'Oli', unit: 'Botol' },
    { id: 'OLI002', name: 'Oli Mesin MPX2 0.8L', price: 48000, stock: 36, category: 'Oli', unit: 'Botol' },
    { id: 'OLI003', name: 'Oli Gardan AHM 120ml', price: 15000, stock: 50, category: 'Oli', unit: 'Botol' },
    { id: 'OLI004', name: 'Oli Shell Advance AX7', price: 60000, stock: 12, category: 'Oli', unit: 'Botol' },
    { id: 'OLI005', name: 'Yamalube Matic 0.8L', price: 45000, stock: 20, category: 'Oli', unit: 'Botol' },

    // KAMPAS REM
    { id: 'REM001', name: 'Kampas Rem Depan Vario/Beat (Disc)', price: 45000, stock: 15, category: 'Pengereman', unit: 'Set' },
    { id: 'REM002', name: 'Kampas Rem Belakang Vario/Beat (Tromol)', price: 35000, stock: 20, category: 'Pengereman', unit: 'Set' },
    { id: 'REM003', name: 'Kampas Rem Depan NMAX', price: 55000, stock: 10, category: 'Pengereman', unit: 'Set' },
    { id: 'REM004', name: 'Kampas Rem Belakang NMAX', price: 55000, stock: 10, category: 'Pengereman', unit: 'Set' },

    // BAN
    { id: 'BAN001', name: 'Ban Luar IRC 80/90-14 Tubeless', price: 180000, stock: 8, category: 'Ban', unit: 'Pcs' },
    { id: 'BAN002', name: 'Ban Luar IRC 90/90-14 Tubeless', price: 210000, stock: 8, category: 'Ban', unit: 'Pcs' },
    { id: 'BAN003', name: 'Ban Dalam Swallow 2.75-17', price: 25000, stock: 15, category: 'Ban', unit: 'Pcs' },

    // CVT
    { id: 'CVT001', name: 'V-Belt Kit Beat FI', price: 125000, stock: 5, category: 'CVT & Penggerak', unit: 'Set' },
    { id: 'CVT002', name: 'V-Belt Kit Vario 125/150', price: 150000, stock: 5, category: 'CVT & Penggerak', unit: 'Set' },
    { id: 'CVT003', name: 'Roller Beat FI 11gr', price: 45000, stock: 10, category: 'CVT & Penggerak', unit: 'Set' },
    { id: 'CVT004', name: 'Rumah Roller Vario', price: 85000, stock: 3, category: 'CVT & Penggerak', unit: 'Pcs' },

    // KELISTRIKAN
    { id: 'LIS001', name: 'Busi NGK CPR9EA', price: 15000, stock: 30, category: 'Busi & Kelistrikan', unit: 'Pcs' },
    { id: 'LIS002', name: 'Aki GS Astra GTZ5S', price: 220000, stock: 5, category: 'Busi & Kelistrikan', unit: 'Pcs' },
    { id: 'LIS003', name: 'Lampu Depan H6 LED', price: 35000, stock: 20, category: 'Busi & Kelistrikan', unit: 'Pcs' },

    // FILTER
    { id: 'FIL001', name: 'Filter Udara Beat FI', price: 45000, stock: 10, category: 'Filter', unit: 'Pcs' },
    { id: 'FIL002', name: 'Filter Udara Vario 125/150', price: 55000, stock: 10, category: 'Filter', unit: 'Pcs' }
];

const bikeTypes = [
    { type: 'Honda Beat FI', code: 'Beat', category: 'Matic' },
    { type: 'Honda Vario 125', code: 'Vario125', category: 'Matic' },
    { type: 'Honda Vario 150', code: 'Vario150', category: 'Matic' },
    { type: 'Honda Scoopy', code: 'Scoopy', category: 'Matic' },
    { type: 'Honda PCX 150', code: 'PCX150', category: 'Matic' },
    { type: 'Yamaha NMAX 155', code: 'NMAX', category: 'Matic' },
    { type: 'Yamaha Aerox 155', code: 'Aerox', category: 'Matic' },
    { type: 'Yamaha Mio M3', code: 'MioM3', category: 'Matic' },
    { type: 'Honda Supra X 125', code: 'Supra125', category: 'Bebek' },
    { type: 'Honda Revo FI', code: 'Revo', category: 'Bebek' },
    { type: 'Yamaha Jupiter Z1', code: 'JupZ1', category: 'Bebek' },
    { type: 'Honda CB150R', code: 'CB150R', category: 'Sport' },
    { type: 'Yamaha Vixion', code: 'Vixion', category: 'Sport' }
];

db.serialize(() => {
    // 1. Insert Spareparts
    console.log("Seeding Spareparts...");
    const stmtPart = db.prepare("INSERT OR REPLACE INTO inventory (id, name, price, stock, category, unit) VALUES (?, ?, ?, ?, ?, ?)");
    spareparts.forEach(part => {
        stmtPart.run(part.id, part.name, part.price, part.stock, part.category, part.unit);
    });
    stmtPart.finalize();

    // 2. Insert Bike Types
    console.log("Seeding Bike Types...");
    // Check if table exists just in case
    db.run(`CREATE TABLE IF NOT EXISTS bike_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT UNIQUE, 
        code TEXT, 
        year_from INTEGER, 
        year_to INTEGER, 
        engine_serial TEXT, 
        frame_serial TEXT, 
        category TEXT
    )`);

    const stmtBike = db.prepare("INSERT OR IGNORE INTO bike_types (type, code, category) VALUES (?, ?, ?)");
    bikeTypes.forEach(bike => {
        stmtBike.run(bike.type, bike.code, bike.category);
    });
    stmtBike.finalize();

    console.log("Seeding completed!");
});

setTimeout(() => {
    db.close();
}, 2000);
