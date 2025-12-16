import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'bengkel.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking for orphan inventory items...\n');

// Find inventory items that don't have corresponding part_types
db.all(`
    SELECT i.id, i.name, i.stock, i.price 
    FROM inventory i
    LEFT JOIN part_types pt ON i.id = pt.code
    WHERE pt.code IS NULL
    ORDER BY i.name
`, [], (err, orphans) => {
    if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
    }

    if (orphans.length === 0) {
        console.log('✅ No orphan inventory items found. Database is clean!');
        db.close();
        return;
    }

    console.log(`⚠️  Found ${orphans.length} orphan inventory items:\n`);

    orphans.forEach((item, index) => {
        console.log(`${index + 1}. [${item.id}] ${item.name}`);
        console.log(`   Stock: ${item.stock}, Price: Rp ${item.price?.toLocaleString() || 0}`);
        console.log('');
    });

    console.log('\n🗑️  Deleting orphan inventory items...\n');

    // Delete orphan inventory items
    db.run(`
        DELETE FROM inventory 
        WHERE id IN (
            SELECT i.id 
            FROM inventory i
            LEFT JOIN part_types pt ON i.id = pt.code
            WHERE pt.code IS NULL
        )
    `, function (deleteErr) {
        if (deleteErr) {
            console.error('❌ Failed to delete orphans:', deleteErr.message);
        } else {
            console.log(`✅ Successfully deleted ${this.changes} orphan inventory items!`);
        }

        db.close();
    });
});
