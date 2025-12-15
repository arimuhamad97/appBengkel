import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

console.log('🗑️  Menghapus data part lama...\n');

db.serialize(() => {
    db.run('DELETE FROM part_types', function (err) {
        if (err) {
            console.error('❌ Error:', err.message);
        } else {
            console.log(`✅ ${this.changes} part dihapus dari database`);
            console.log('✨ Database siap untuk data baru!\n');
        }

        db.close((err) => {
            if (err) {
                console.error('Error menutup database:', err.message);
            } else {
                console.log('Database connection ditutup.');
            }
        });
    });
});
