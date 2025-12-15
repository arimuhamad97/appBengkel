
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./bengkel.db');

console.log('🧹 Memulai pembersihan data Transaksi (Master Data AMAN)...');

db.serialize(() => {
    // 1. Hapus Transaksi Servis
    db.run("DELETE FROM queue", function (err) {
        if (err) console.error('❌ Gagal hapus Queue:', err);
        else console.log(`✅ Queue/Servis dibersihkan: ${this.changes} items dihapus`);
    });

    // 2. Hapus Data Stok Fisik (Inventory) - Master Part Tetap Ada
    db.run("DELETE FROM inventory", function (err) {
        if (err) console.error('❌ Gagal hapus Inventory:', err);
        else console.log(`✅ Inventory Stok dibersihkan: ${this.changes} items dihapus`);
    });

    // 3. Hapus Riwayat Stok Masuk
    db.run("DELETE FROM stock_in", function (err) {
        if (err) console.error('❌ Gagal hapus Stock In:', err);
        else console.log(`✅ Riwayat Stok Masuk dibersihkan: ${this.changes} items dihapus`);
    });

    // 4. Hapus Riwayat Stok Keluar
    db.run("DELETE FROM stock_out", function (err) {
        if (err) console.error('❌ Gagal hapus Stock Out:', err);
        else console.log(`✅ Riwayat Stok Keluar dibersihkan: ${this.changes} items dihapus`);
    });

    // 5. Hapus Customers (Optional, tapi biar bersih total)
    db.run("DELETE FROM customers", function (err) {
        if (err) console.error('❌ Gagal hapus Customers:', err);
        else console.log(`✅ Data Pelanggan dibersihkan: ${this.changes} items dihapus`);
    });

    // Master Data (Part Types, Services, Mechanics, Bike Types) TIDAK DIHAPUS
});

// Close DB connection after a short delay to ensure operations finish
setTimeout(() => {
    db.close((err) => {
        if (err) console.error(err);
        else console.log('🏁 Database connection closed.');
    });
}, 1000);
