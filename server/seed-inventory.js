import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./server/bengkel.db');

// Seed sample inventory items
const sampleInventory = [
    { id: 'OLI001', name: 'Oli Mesin AHM 0.8L', price: 35000, stock: 50, category: 'Pcs' },
    { id: 'OLI002', name: 'Oli Mesin Yamalube 0.8L', price: 38000, stock: 40, category: 'Pcs' },
    { id: 'BAN001', name: 'Ban Luar 70/90-14', price: 150000, stock: 20, category: 'Pcs' },
    { id: 'BAN002', name: 'Ban Dalam 70/90-14', price: 35000, stock: 25, category: 'Pcs' },
    { id: 'AKI001', name: 'Aki GS Astra 12V 5Ah', price: 250000, stock: 15, category: 'Pcs' },
    { id: 'BUS001', name: 'Busi NGK Iridium', price: 45000, stock: 100, category: 'Pcs' },
    { id: 'REM001', name: 'Kampas Rem Depan', price: 35000, stock: 30, category: 'Set' },
    { id: 'REM002', name: 'Kampas Rem Belakang', price: 30000, stock: 35, category: 'Set' },
    { id: 'FIL001', name: 'Filter Udara', price: 25000, stock: 40, category: 'Pcs' },
    { id: 'FIL002', name: 'Filter Oli', price: 15000, stock: 50, category: 'Pcs' },
    { id: 'LAM001', name: 'Lampu Depan LED', price: 85000, stock: 20, category: 'Pcs' },
    { id: 'LAM002', name: 'Lampu Sein', price: 15000, stock: 40, category: 'Pcs' },
    { id: 'VBE001', name: 'V-Belt', price: 55000, stock: 25, category: 'Pcs' },
    { id: 'ROL001', name: 'Roller Set', price: 45000, stock: 30, category: 'Set' },
    { id: 'SPK001', name: 'Spakbor Depan', price: 75000, stock: 10, category: 'Pcs' }
];

console.log('Seeding inventory...');

sampleInventory.forEach((item) => {
    db.run(
        "INSERT OR REPLACE INTO inventory (id, name, price, stock, category) VALUES (?, ?, ?, ?, ?)",
        [item.id, item.name, item.price, item.stock, item.category],
        (err) => {
            if (err) {
                console.error(`Error inserting ${item.name}:`, err.message);
            } else {
                console.log(`✓ Added: ${item.name} (Stock: ${item.stock})`);
            }
        }
    );
});

setTimeout(() => {
    db.close(() => {
        console.log('\nInventory seeding completed!');
        console.log('Total items: ' + sampleInventory.length);
        process.exit(0);
    });
}, 1000);
