import db, { initDb } from './db.js';

// Mock Data (Copied to seed)
const mockServices = [
    { id: 1, name: 'Ganti Oli Ringan', price: 15000, duration: 15 },
    { id: 2, name: 'Servis Ringan (Tune Up)', price: 45000, duration: 30 },
    { id: 3, name: 'Servis Besar / Turun Mesin', price: 150000, duration: 120 },
    { id: 4, name: 'Ganti Kampas Rem', price: 10000, duration: 20 },
    { id: 5, name: 'Ganti Ban', price: 15000, duration: 25 },
];

const mockSpareParts = [
    { id: 'P001', name: 'Oli MPX2 0.8L', price: 45000, stock: 24, category: 'Oli' },
    { id: 'P002', name: 'Oli Yamalube Matic', price: 48000, stock: 15, category: 'Oli' },
    { id: 'P003', name: 'Kampas Rem Depan Beat', price: 35000, stock: 10, category: 'Kampas' },
    { id: 'P004', name: 'Kampas Rem Belakang Vario', price: 40000, stock: 8, category: 'Kampas' },
    { id: 'P005', name: 'Busi NGK', price: 15000, stock: 50, category: 'Mesin' },
    { id: 'P006', name: 'Ban Luar Federal 90/90-14', price: 185000, stock: 4, category: 'Ban' },
];

const mockMechanics = [
    { id: 1, name: 'Budi Santoso', status: 'Available' },
    { id: 2, name: 'Ahmad Dani', status: 'Busy' },
    { id: 3, name: 'Catur Rizki', status: 'Available' },
];

// Initial Queue
const mockQueue = [
    {
        id: 101, queueNumber: 1, date: new Date().toISOString().split('T')[0], customerName: 'Pak Eko', bikeModel: 'Vario 150', plateNumber: 'AD 1234 XY',
        status: 'In Progress', mechanicId: 2, entryTime: '09:00', serviceType: 'Servis Ringan', complaint: 'Tarikan berat',
        items: JSON.stringify([
            { type: 'Service', name: 'Servis Ringan (Tune Up)', price: 45000, q: 1 },
            { type: 'Part', name: 'Oli MPX2 0.8L', price: 45000, q: 1 }
        ]),
        phoneNumber: '08123456789', address: 'Jl. Melati No. 5', frameNumber: 'MH1JSH123', engineNumber: 'JSH123', kilometer: 15000
    },
    {
        id: 102, queueNumber: 2, date: new Date().toISOString().split('T')[0], customerName: 'Bu Siti', bikeModel: 'Beat Street', plateNumber: 'B 4567 ABC',
        status: 'Pending', mechanicId: null, entryTime: '09:15', serviceType: 'Ganti Oli', complaint: '',
        items: JSON.stringify([]),
        phoneNumber: '08567890123', address: 'Solo Baru', frameNumber: '', engineNumber: '', kilometer: 8500
    }
];

export function seed() {
    initDb();

    setTimeout(() => {
        const stmtService = db.prepare("INSERT OR REPLACE INTO services VALUES (?, ?, ?, ?)");
        mockServices.forEach(s => stmtService.run(s.id, s.name, s.price, s.duration));
        stmtService.finalize();

        const stmtPart = db.prepare("INSERT OR REPLACE INTO inventory VALUES (?, ?, ?, ?, ?)");
        mockSpareParts.forEach(p => stmtPart.run(p.id, p.name, p.price, p.stock, p.category));
        stmtPart.finalize();

        const stmtMech = db.prepare("INSERT OR REPLACE INTO mechanics VALUES (?, ?, ?)");
        mockMechanics.forEach(m => stmtMech.run(m.id, m.name, m.status));
        stmtMech.finalize();

        const stmtQueue = db.prepare(`INSERT OR REPLACE INTO queue 
            (id, queueNumber, date, customerName, bikeModel, plateNumber, status, mechanicId, entryTime, serviceType, complaint, items, phoneNumber, address, frameNumber, engineNumber, kilometer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        mockQueue.forEach(q => {
            stmtQueue.run(q.id, q.queueNumber, q.date, q.customerName, q.bikeModel, q.plateNumber, q.status, q.mechanicId, q.entryTime, q.serviceType, q.complaint, q.items, q.phoneNumber, q.address, q.frameNumber, q.engineNumber, q.kilometer);
        });
        stmtQueue.finalize();

        console.log('Database seeded successfully');
    }, 1000);
}

seed();
