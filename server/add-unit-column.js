import db from './db.js';

console.log('🔄 Menambahkan kolom unit ke tabel inventory...');

db.serialize(() => {
    // 1. Cek apakah kolom unit sudah ada
    db.all("PRAGMA table_info(inventory)", [], (err, columns) => {
        if (err) {
            console.error('❌ Error checking table info:', err);
            return;
        }

        const unitExists = columns.some(col => col.name === 'unit');

        if (!unitExists) {
            // 2. Tambahkan kolom unit
            db.run("ALTER TABLE inventory ADD COLUMN unit TEXT DEFAULT 'Pcs'", (err) => {
                if (err) {
                    console.error('❌ Gagal menambahkan kolom unit:', err.message);
                } else {
                    console.log('✅ Berhasil menambahkan kolom unit!');

                    // 3. Update existing records jika data di part_types ada
                    // (Opsional, tapi bagus supaya data lama sinkron)
                    console.log('🔄 Sinkronisasi unit dari master part...');
                    db.run(`
                        UPDATE inventory 
                        SET unit = (
                            SELECT unit FROM part_types 
                            WHERE part_types.code = inventory.id 
                            AND part_types.name = inventory.name
                        )
                        WHERE EXISTS (
                            SELECT 1 FROM part_types 
                            WHERE part_types.code = inventory.id 
                            AND part_types.name = inventory.name
                        )
                    `, (err) => {
                        if (err) console.error('⚠️ Warning sync unit:', err.message);
                        else console.log('✅ Unit berhasil disinkronkan dengan data master.');
                    });
                }
            });
        } else {
            console.log('ℹ️ Kolom unit sudah ada, tidak perlu perubahan.');
        }
    });
});
