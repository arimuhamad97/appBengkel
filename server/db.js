import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

// The actual database connection instance
let realDb = new sqlite3.Database(dbPath);

// Wrapper method to forward calls to the real instance
const forward = (methodName, args) => realDb[methodName](...args);

// The proxy object that masks the real instance
const db = {
    run: (...args) => forward('run', args),
    get: (...args) => forward('get', args),
    all: (...args) => forward('all', args),
    each: (...args) => forward('each', args),
    exec: (...args) => forward('exec', args),
    prepare: (...args) => forward('prepare', args),
    serialize: (fn) => {
        // serialize is special, the callback executes in context - IF realDb changes during serialize, we might have issues, 
        // but for now we assume reload doesn't happen inside serialize block.
        realDb.serialize(() => fn());
    },
    parallelize: (fn) => {
        realDb.parallelize(() => fn());
    },
    close: (cb) => forward('close', [cb]),
    on: (...args) => forward('on', args)
};

export function getDb() {
    return db;
}

export function reloadDatabase() {
    return new Promise((resolve, reject) => {
        if (realDb) {
            // Close the CURRENT real connection
            realDb.close((err) => {
                if (err) console.error('Error closing database during reload:', err);

                // Create NEW connection
                const newDb = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // SWAP the reference!
                        realDb = newDb;
                        console.log('Database connection reloaded successfully!');
                        resolve(db); // Resolve with the wrapper
                    }
                });
            });
        } else {
            const newDb = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    realDb = newDb;
                    resolve(db);
                }
            });
        }
    });
}

export function initDb() {
    db.serialize(() => {
        // Queue Table
        db.run(`CREATE TABLE IF NOT EXISTS queue (
            id INTEGER PRIMARY KEY,
            queueNumber INTEGER,
            date TEXT,
            customerName TEXT,
            bikeModel TEXT,
            plateNumber TEXT,
            status TEXT,
            mechanicId TEXT,
            entryTime TEXT,
            serviceType TEXT,
            complaint TEXT,
            items TEXT,
            phoneNumber TEXT,
            address TEXT,
            frameNumber TEXT,
            engineNumber TEXT,
            kilometer TEXT
        )`);

        // Mechanics Table
        db.run(`CREATE TABLE IF NOT EXISTS mechanics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            role TEXT DEFAULT 'Mekanik',
            status TEXT DEFAULT 'Available'
        )`);

        // Add role column if it doesn't exist (migration for existing databases)
        db.run(`ALTER TABLE mechanics ADD COLUMN role TEXT DEFAULT 'Mekanik'`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Error adding role column:', err);
            }
        });

        // Attendance Table
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mechanic_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            check_in_time TEXT,
            check_out_time TEXT,
            status TEXT DEFAULT 'Hadir',
            notes TEXT,
            FOREIGN KEY (mechanic_id) REFERENCES mechanics (id)
        )`);

        // Services Table
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            group_type TEXT,
            price INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Inventory Table
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            name TEXT,
            price INTEGER,
            stock INTEGER,
            category TEXT
        )`);

        // Bike Types Table
        db.run(`CREATE TABLE IF NOT EXISTS bike_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            code TEXT,
            year_from TEXT,
            year_to TEXT,
            engine_serial TEXT,
            frame_serial TEXT,
            category TEXT
        )`);

        // Part Types Table
        db.run(`CREATE TABLE IF NOT EXISTS part_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT,
            name TEXT NOT NULL,
            group_type TEXT,
            unit TEXT,
            sell_price INTEGER,
            cost_price INTEGER
        )`);

        // Customers Table
        db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            bike_model TEXT,
            engine_number TEXT,
            frame_number TEXT,
            year TEXT,
            color TEXT,
            phone_number TEXT,
            address TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Stock In Table (Riwayat Stok Masuk)
        db.run(`CREATE TABLE IF NOT EXISTS stock_in (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            qty INTEGER NOT NULL,
            unit TEXT,
            price INTEGER NOT NULL,
            total INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Stock Out Table (Riwayat Stok Keluar)
        db.run(`CREATE TABLE IF NOT EXISTS stock_out (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            qty INTEGER NOT NULL,
            unit TEXT,
            price_sell INTEGER,
            total_price INTEGER,
            type TEXT, -- 'Service' or 'Direct'
            reference_id TEXT, -- Queue ID or Transaction ID
            date TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Sales Table (Riwayat Penjualan Langsung)
        db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer TEXT NOT NULL,
            items INTEGER NOT NULL,
            total INTEGER NOT NULL,
            date TEXT NOT NULL,
            items_detail TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table (Login System)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Seed Default Users
                const defaultUsers = [
                    { username: 'frontdesk', password: 'frontdesk123', role: 'frontdesk' },
                    { username: 'gudang', password: 'gudang123', role: 'gudang' }
                ];
                defaultUsers.forEach(u => {
                    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, [u.username, u.password, u.role]);
                });
            }
        });

        // Expenses Table (Laporan Pengeluaran)
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT,
            amount INTEGER NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('Database tables initialized');
    });
}

export default db;
