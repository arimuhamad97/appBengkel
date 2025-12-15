const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bengkel.db');
const db = new sqlite3.Database(dbPath);

console.log('Generating Mock Data for October & November 2025...');

const mechanics = [1, 2]; // Assuming IDs 1 and 2 exist. If not, script might fail silently on FKs but it's fine for simple mock.
const services = [
    { name: 'Servis Ringan', price: 45000, type: 'Service' },
    { name: 'Ganti Oli', price: 65000, type: 'Part' }, // Simplification
    { name: 'Ganti Kampas Rem', price: 35000, type: 'Service' },
    { name: 'Kampas Rem Depan', price: 85000, type: 'Part' },
    { name: 'Servis Besar', price: 150000, type: 'Service' },
    { name: 'Tambal Ban', price: 15000, type: 'Service' }
];

const customers = [
    { name: 'Budi Santoso', plate: 'AD 1234 AB', bike: 'Honda Vario' },
    { name: 'Siti Aminah', plate: 'AD 5678 CD', bike: 'Yamaha NMAX' },
    { name: 'Joko Widodo', plate: 'AD 9012 EF', bike: 'Honda Beat' },
    { name: 'Rina Wati', plate: 'AD 3456 GH', bike: 'Yamaha Mio' },
    { name: 'Ahmad Yani', plate: 'AD 7890 IJ', bike: 'Suzuki Satria' }
];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

db.serialize(() => {
    // 1. Generate Services (Queue)
    const startDate = new Date('2025-10-01');
    const endDate = new Date('2025-11-30');

    console.log('Inserting Services...');
    for (let i = 0; i < 60; i++) {
        const date = randomDate(startDate, endDate);
        const dateStr = date.toISOString().split('T')[0];
        const cust = customers[randomInt(0, customers.length - 1)];
        const mechId = mechanics[randomInt(0, mechanics.length - 1)];

        // Generate random items
        const numItems = randomInt(1, 4);
        const currentItems = [];
        let total = 0;

        for (let j = 0; j < numItems; j++) {
            const item = services[randomInt(0, services.length - 1)];
            currentItems.push({
                ...item,
                q: 1,
                discount: 0,
                listId: Date.now() + j
            });
            total += item.price;
        }

        db.run(`INSERT INTO queue (
            queueNumber, plateNumber, customerName, bikeModel, 
            complaint, mechanicId, status, serviceType, 
            entryTime,
            items, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            randomInt(1, 50), cust.plate, cust.name, cust.bike,
            'Mock Data Service', mechId, 'Paid', 'Servis Ringan',
            '09:00',
            JSON.stringify(currentItems), dateStr
        ]);
    }

    // 2. Generate Sales
    console.log('Inserting Sales...');
    for (let i = 0; i < 40; i++) {
        const date = randomDate(startDate, endDate);
        const dateStr = date.toISOString().split('T')[0];

        // Generate random items
        const numItems = randomInt(1, 3);
        const currentItems = [];
        let total = 0;

        for (let j = 0; j < numItems; j++) {
            const item = services.filter(s => s.type === 'Part')[randomInt(0, 1)]; // Only parts
            currentItems.push({
                ...item,
                id: randomInt(100, 200), // Fake ID
                q: randomInt(1, 2)
            });
            total += item.price * currentItems[j].q;
        }

        db.run(`INSERT INTO sales (
            buyer, items, total, date, items_detail
        ) VALUES (?, ?, ?, ?, ?)`, [
            'Umum', currentItems.length, total, dateStr, JSON.stringify(currentItems)
        ]);
    }

    // 3. Generate Attendance
    console.log('Inserting Attendance...');
    // Iterate every day from Oct 1 to Nov 30
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 0) continue; // Skip Sundays

        const dateStr = d.toISOString().split('T')[0];

        mechanics.forEach(mechId => {
            // 90% chance present
            if (Math.random() > 0.1) {
                db.run(`INSERT INTO attendance (
                    mechanic_id, date, check_in_time, check_out_time, status, notes
                ) VALUES (?, ?, ?, ?, ?, ?)`, [
                    mechId, dateStr, '08:00', '17:00', 'Hadir', ''
                ]);
            } else {
                // 50/50 Sakit or Ijin
                const status = Math.random() > 0.5 ? 'Sakit' : 'Ijin';
                db.run(`INSERT INTO attendance (
                    mechanic_id, date, status, notes
                ) VALUES (?, ?, ?, ?)`, [
                    mechId, dateStr, status, 'Mock Data'
                ]);
            }
        });
    }

    console.log('Done! Mock data inserted successfully.');
});

db.close();
