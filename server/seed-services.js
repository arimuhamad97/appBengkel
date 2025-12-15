import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./server/bengkel.db');

// Seed sample services
const sampleServices = [
    { name: 'Servis Berkala ASS I', group: 'ASS I', price: 50000 },
    { name: 'Servis Berkala ASS II', group: 'ASS II', price: 75000 },
    { name: 'Servis Berkala ASS III', group: 'ASS III', price: 100000 },
    { name: 'Servis Berkala ASS IV', group: 'ASS IV', price: 125000 },
    { name: 'Ganti Oli Mesin', group: 'Fast Pit', price: 35000 },
    { name: 'Tune Up', group: 'Servis Lengkap', price: 150000 },
    { name: 'Overhaul Mesin', group: 'Perbaikan Berat', price: 500000 },
    { name: 'Perbaikan Karburator', group: 'Perbaikan Berat', price: 200000 },
    { name: 'Cuci Motor', group: 'Lain-lain', price: 15000 }
];

console.log('Seeding services...');

sampleServices.forEach((service) => {
    db.run(
        "INSERT INTO services (name, group_type, price) VALUES (?, ?, ?)",
        [service.name, service.group, service.price],
        (err) => {
            if (err) {
                console.error(`Error inserting ${service.name}:`, err.message);
            } else {
                console.log(`✓ Added: ${service.name}`);
            }
        }
    );
});

setTimeout(() => {
    db.close(() => {
        console.log('\nSeeding completed!');
        process.exit(0);
    });
}, 1000);
