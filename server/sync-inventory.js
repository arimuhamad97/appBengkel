import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'bengkel.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Syncing part_types to inventory...\n');

db.serialize(() => {
    // Clear existing inventory data
    db.run('DELETE FROM inventory', (err) => {
        if (err) {
            console.error('❌ Failed to clear inventory:', err);
            return;
        }
        console.log('✅ Inventory table cleared');
    });

    // Copy data from part_types to inventory
    const sql = `
        INSERT OR IGNORE INTO inventory (id, name, price, stock, category)
        SELECT 
            code as id,
            name,
            sell_price as price,
            0 as stock,
            group_type as category
        FROM part_types
        WHERE code IS NOT NULL AND code != ''
    `;

    db.run(sql, (err) => {
        if (err) {
            console.error('❌ Failed to sync data:', err);
            db.close();
            return;
        }

        // Count results
        db.get('SELECT COUNT(*) as count FROM inventory', (err, row) => {
            if (err) {
                console.error('❌ Failed to count:', err);
            } else {
                console.log(`✅ Successfully synced ${row.count} items to inventory`);
                console.log('\n📊 Sample data from inventory:');

                // Show sample
                db.all('SELECT * FROM inventory LIMIT 10', (err, rows) => {
                    if (!err && rows) {
                        rows.forEach(row => {
                            console.log(`   [${row.id}] ${row.name} - Stock: ${row.stock} - Harga: Rp ${row.price?.toLocaleString()}`);
                        });
                    }

                    console.log('\n✅ Sync completed!');
                    console.log('💡 All parts are now available in inventory with 0 stock');
                    console.log('💡 Use "Stok Masuk" to add stock for specific items\n');

                    db.close();
                });
            }
        });
    });
});
