import db from './db.js';

console.log('🔄 Memulai perbaikan data inventory...');

db.serialize(() => {
    // 1. Hapus data null/sampah
    db.run("DELETE FROM inventory WHERE id IS NULL OR name IS NULL", function (err) {
        if (err) console.error('❌ Error deleting nulls:', err);
        else console.log(`🗑️ Berhasil menghapus ${this.changes} data sampah (null).`);
    });

    // 2. Update category berdasarkan part_types
    // Kita ambil semua items inventory dulu
    db.all("SELECT * FROM inventory", [], (err, inventoryItems) => {
        if (err) {
            console.error('❌ Error reading inventory:', err);
            return;
        }

        if (inventoryItems.length === 0) {
            console.log('ℹ️ Inventory kosong, tidak ada yang perlu diupdate.');
            return;
        }

        inventoryItems.forEach(item => {
            // Cari part_type yang cocok berdasarkan code (inventory.id) dan name
            // Kita prioritaskan kecocokan nama juga karena code 111 ada dua (oli mesin & test)
            db.get(
                "SELECT * FROM part_types WHERE code = ? AND name = ?",
                [item.id, item.name],
                (err, partType) => {
                    if (err) console.error(`❌ Error finding part for ${item.name}:`, err);

                    if (partType) {
                        const newGroup = partType.group_type || 'Umum';

                        if (item.category !== newGroup) {
                            db.run(
                                "UPDATE inventory SET category = ? WHERE id = ? AND name = ?",
                                [newGroup, item.id, item.name],
                                function (err) {
                                    if (err) console.error(`❌ Gagal update ${item.name}:`, err);
                                    else console.log(`✅ ${item.name}: Category diubah dari '${item.category}' menjadi '${newGroup}'`);
                                }
                            );
                        } else {
                            console.log(`ℹ️ ${item.name}: Category sudah benar ('${newGroup}')`);
                        }
                    } else {
                        console.log(`⚠️ Tidak menemukan data master Part Type untuk inventory: Code ${item.id} / Name ${item.name}`);
                    }
                }
            );
        });
    });
});
