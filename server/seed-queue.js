
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./bengkel.db');

const services = [
    {
        name: 'Budi Santoso',
        bike: 'Honda Beat 2020',
        plate: 'KB 4521 AB',
        complaint: 'Ganti Oli + Servis Rutin',
        status: 'Done',
        offset: -5 // 5 hari lalu
    },
    {
        name: 'Siti Aminah',
        bike: 'Yamaha NMAX',
        plate: 'KB 2234 CD',
        complaint: 'Rem bunyi cit cit',
        status: 'Paid',
        offset: -4
    },
    {
        name: 'Joko Widodo',
        bike: 'Honda Vario 150',
        plate: 'KB 8899 JK',
        complaint: 'Tarikan berat',
        status: 'In Progress',
        offset: -3
    },
    {
        name: 'Rina Nose',
        bike: 'Yamaha Mio M3',
        plate: 'KB 1212 RR',
        complaint: 'Lampu depan mati',
        status: 'Pending',
        offset: -2
    },
    {
        name: 'Doni Tata',
        bike: 'Suzuki Satria F',
        plate: 'KB 5555 FF',
        complaint: 'Ganti Rantai',
        status: 'Paid',
        offset: -2
    },
    {
        name: 'Ahmad Dhani',
        bike: 'Honda CBR 150',
        plate: 'KB 1919 DE',
        complaint: 'Servis Besar',
        status: 'Waiting',
        offset: -1
    },
    {
        name: 'Mulan Jameela',
        bike: 'Yamaha Fazzio',
        plate: 'KB 3344 MJ',
        complaint: 'Cek CVT',
        status: 'Pending',
        offset: -1
    },
    {
        name: 'Raffi Ahmad',
        bike: 'Vespa Sprint',
        plate: 'KB 7777 RA',
        complaint: 'Ganti Ban Depan Belakang',
        status: 'Pending',
        offset: 0 // Hari ini
    },
    {
        name: 'Nagita Slavina',
        bike: 'Honda Scoopy',
        plate: 'KB 8888 NS',
        complaint: 'Oli Bocor',
        status: 'In Progress',
        offset: 0
    },
    {
        name: 'Deddy Corbuzier',
        bike: 'Ducati Panigale',
        plate: 'KB 1 DC',
        complaint: 'Servis Ringan',
        status: 'Waiting',
        offset: 0
    }
];

function getDateString(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
}

console.log('🌱 Seeding 10 Mock Service Queue Data...');

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT INTO queue (
            id, queueNumber, date, customerName, bikeModel, plateNumber, 
            status, complaint, entryTime, mechanicId, items, serviceType,
            phoneNumber, address, kilometer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    services.forEach((s, index) => {
        const id = Date.now().toString() + index; // Mock ID
        const date = getDateString(s.offset);
        const queueNum = index + 1;
        const entryTime = '08:30';
        // Assign mechanic ID 1 or 2 randomly for In Progress/Done/Paid
        const mechanicId = ['In Progress', 'Done', 'Paid'].includes(s.status) ? (Math.random() > 0.5 ? 1 : 2) : null;

        stmt.run(
            id,
            queueNum,
            date,
            s.name,
            s.bike,
            s.plate,
            s.status,
            s.complaint,
            entryTime,
            mechanicId,
            JSON.stringify([]), // Items kosong dulu
            'Servis Umum',
            '08123456789',
            'Jl. Mock Data No. ' + index,
            12000 + (index * 500)
        );
        console.log(`INSERTED: [${date}] ${s.name} - ${s.status}`);
    });

    stmt.finalize();
});

// Close DB connection
setTimeout(() => {
    db.close((err) => {
        if (err) console.error(err);
        else console.log('🏁 Selesai! 10 Data Dummy berhasil ditambahkan.');
    });
}, 1000);
