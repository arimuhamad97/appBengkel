import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./server/bengkel.db');

// Seed sample mechanics
const sampleMechanics = [
    { id: 'M001', name: 'Budi Santoso', phone: '081234567890' },
    { id: 'M002', name: 'Ahmad Rizki', phone: '081234567891' },
    { id: 'M003', name: 'Dedi Kurniawan', phone: '081234567892' }
];

console.log('Seeding mechanics...');

sampleMechanics.forEach((mechanic) => {
    db.run(
        "INSERT OR REPLACE INTO mechanics (id, name, phone) VALUES (?, ?, ?)",
        [mechanic.id, mechanic.name, mechanic.phone],
        (err) => {
            if (err) {
                console.error(`Error inserting ${mechanic.name}:`, err.message);
            } else {
                console.log(`✓ Added: ${mechanic.name}`);
            }
        }
    );
});

setTimeout(() => {
    db.close(() => {
        console.log('\nMechanics seeding completed!');
        process.exit(0);
    });
}, 1000);
