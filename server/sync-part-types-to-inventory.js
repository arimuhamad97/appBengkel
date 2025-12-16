/**
 * Script untuk sync part_types lama ke inventory
 * Improved version dengan better error handling
 */

import db, { initDb } from './db.js';

console.log('===========================================');
console.log('  Sync Part Types ke Inventory');
console.log('===========================================');
console.log('');

// Initialize database first
await initDb();

console.log('✅ Database connected');
console.log('');

// Get all part_types
db.all("SELECT * FROM part_types", [], (err, partTypes) => {
    if (err) {
        console.error('❌ Error fetching part types:', err);
        db.close();
        process.exit(1);
    }

    if (!partTypes || partTypes.length === 0) {
        console.log('⚠️  No part types found in database.');
        console.log('');
        console.log('Kemungkinan:');
        console.log('1. Belum ada data jenis sparepart');
        console.log('2. Database baru/kosong');
        console.log('');
        console.log('Silakan tambah jenis sparepart di menu Pengaturan terlebih dahulu.');
        db.close();
        process.exit(0);
    }

    console.log(`📦 Found ${partTypes.length} part types`);
    console.log('');

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    const syncPromises = partTypes.map((part, index) => {
        return new Promise((resolve) => {
            const inventoryId = part.code || `PT${part.id}`;
            const sql = "INSERT OR IGNORE INTO inventory (id, name, price, stock, category) VALUES (?, ?, ?, ?, ?)";
            const params = [inventoryId, part.name, part.sell_price || 0, 0, part.group_type];

            db.run(sql, params, function (insertErr) {
                if (insertErr) {
                    console.error(`❌ [${index + 1}/${partTypes.length}] Error: ${part.name} - ${insertErr.message}`);
                    errors++;
                } else {
                    if (this.changes > 0) {
                        console.log(`✅ [${index + 1}/${partTypes.length}] Synced: ${part.name} (${inventoryId})`);
                        synced++;
                    } else {
                        // Item already exists in inventory
                        skipped++;
                    }
                }
                resolve();
            });
        });
    });

    Promise.all(syncPromises).then(() => {
        console.log('');
        console.log('===========================================');
        console.log('  SYNC COMPLETE!');
        console.log('===========================================');
        console.log('');
        console.log(`✅ Synced: ${synced} items (new records created)`);
        console.log(`⏭️  Skipped: ${skipped} items (already in inventory)`);
        if (errors > 0) {
            console.log(`❌ Errors: ${errors} items`);
        }
        console.log('');

        if (synced > 0) {
            console.log('🎉 SUCCESS!');
            console.log('');
            console.log('Data lama sekarang sudah ada di inventory!');
            console.log('');
            console.log('LANGKAH SELANJUTNYA:');
            console.log('1. Buka aplikasi di browser');
            console.log('2. Menu Persediaan → Total Item');
            console.log('3. Tekan F5 (refresh)');
            console.log('4. Cari nama sparepart yang tadi ditambahkan');
            console.log('');
        } else {
            console.log('ℹ️  Semua data sudah tersinkron sebelumnya.');
            console.log('   Tidak ada item baru yang perlu ditambahkan.');
        }

        db.close((closeErr) => {
            if (closeErr) {
                console.error('Error closing database:', closeErr);
            }
            process.exit(0);
        });
    });
});
