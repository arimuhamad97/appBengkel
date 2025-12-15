import db from './db.js';

console.log('🧹 Memulai pembersihan data Inventory & Master Part...');

db.serialize(() => {
    // 1. Hapus Inventory (Stok berjalan)
    db.run("DELETE FROM inventory", function (err) {
        if (err) console.error('❌ Error inventory:', err);
        else console.log(`✅ Inventory dibersihkan: ${this.changes} items dihapus`);
    });

    // 2. Hapus Part Types (Master Data)
    db.run("DELETE FROM part_types", function (err) {
        if (err) console.error('❌ Error part_types:', err);
        else console.log(`✅ Master Part Types dibersihkan: ${this.changes} items dihapus`);
    });

    // 3. Hapus Stock In History (Riwayat Masuk) - Opsional, tapi sebaiknya dihapus agar konsisten
    db.run("DELETE FROM stock_in", function (err) {
        if (err) console.error('❌ Error stock_in:', err);
        else console.log(`✅ Riwayat Stok Masuk dibersihkan: ${this.changes} records dihapus`);
    });
});
