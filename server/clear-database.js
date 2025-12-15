import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

console.log('🗑️  Mulai mengosongkan database...');

db.serialize(() => {
    // Daftar semua tabel yang perlu dikosongkan
    const tables = [
        'queue',
        'mechanics',
        'attendance',
        'services',
        'inventory',
        'bike_types',
        'part_types',
        'customers',
        'stock_in',
        'stock_out',
        'sales',
        'expenses'
        // Note: Tidak menghapus tabel 'users' untuk menjaga login credentials
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach(table => {
        db.run(`DELETE FROM ${table}`, function (err) {
            if (err) {
                console.error(`❌ Error menghapus data dari tabel ${table}:`, err.message);
            } else {
                console.log(`✅ Tabel ${table} dikosongkan (${this.changes} baris dihapus)`);
            }

            completed++;

            // Reset auto-increment untuk tabel dengan PRIMARY KEY AUTOINCREMENT
            if (table !== 'inventory') { // inventory menggunakan TEXT PRIMARY KEY
                db.run(`DELETE FROM sqlite_sequence WHERE name=?`, [table], (err) => {
                    if (err && !err.message.includes('no such table')) {
                        console.error(`⚠️  Warning reset sequence untuk ${table}:`, err.message);
                    }
                });
            }

            if (completed === total) {
                console.log('\n✨ Database berhasil dikosongkan!');
                console.log('ℹ️  Catatan: Data users tetap dipertahankan untuk keperluan login.\n');

                db.close((err) => {
                    if (err) {
                        console.error('Error menutup database:', err.message);
                    } else {
                        console.log('Database connection ditutup.');
                    }
                });
            }
        });
    });
});
