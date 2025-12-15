// Mock Data for Prototype

export const mockServices = [
    { id: 1, name: 'Ganti Oli Ringan', price: 15000, duration: 15 },
    { id: 2, name: 'Servis Ringan (Tune Up)', price: 45000, duration: 30 },
    { id: 3, name: 'Servis Besar / Turun Mesin', price: 150000, duration: 120 },
    { id: 4, name: 'Ganti Kampas Rem', price: 10000, duration: 20 },
    { id: 5, name: 'Ganti Ban', price: 15000, duration: 25 },
];

export const mockSpareParts = [
    { id: 'P001', name: 'Oli MPX2 0.8L', price: 45000, stock: 24, category: 'Oli' },
    { id: 'P002', name: 'Oli Yamalube Matic', price: 48000, stock: 15, category: 'Oli' },
    { id: 'P003', name: 'Kampas Rem Depan Beat', price: 35000, stock: 10, category: 'Kampas' },
    { id: 'P004', name: 'Kampas Rem Belakang Vario', price: 40000, stock: 8, category: 'Kampas' },
    { id: 'P005', name: 'Busi NGK', price: 15000, stock: 50, category: 'Mesin' },
    { id: 'P006', name: 'Ban Luar Federal 90/90-14', price: 185000, stock: 4, category: 'Ban' },
];

export const mockMechanics = [
    { id: 1, name: 'Budi Santoso', status: 'Available' },
    { id: 2, name: 'Ahmad Dani', status: 'Busy' },
    { id: 3, name: 'Catur Rizki', status: 'Available' },
];

export const mockCustomers = [
    { plateNumber: 'AD1234XY', customerName: 'Pak Eko', phoneNumber: '08123456789', address: 'Jl. Melati No. 5', bikeModel: 'Vario 150', frameNumber: 'MH1JSH123', engineNumber: 'JSH123' },
    { plateNumber: 'B4567ABC', customerName: 'Bu Siti', phoneNumber: '08567890123', address: 'Solo Baru', bikeModel: 'Beat Street', frameNumber: 'MH1KJF456', engineNumber: 'KJF456' },
    { plateNumber: 'AB9999XX', customerName: 'Mas Arif', phoneNumber: '08198765432', address: 'Kartasura', bikeModel: 'NMAX', frameNumber: 'MH3SED789', engineNumber: 'SED789' },
    { plateNumber: 'AD5555BC', customerName: 'Joko', phoneNumber: '08122233344', address: 'Mojosongo', bikeModel: 'Supra X 125', frameNumber: 'MH1JB2333', engineNumber: 'JB2333' }
];

export const mockQueue = [
    {
        id: 101,
        queueNumber: 1,
        date: new Date().toISOString().split('T')[0], // Today
        customerName: 'Pak Eko',
        bikeModel: 'Vario 150',
        plateNumber: 'AD 1234 XY',
        status: 'In Progress',
        mechanicId: 2,
        entryTime: '09:00',
        serviceType: 'Servis Ringan',
        complaint: 'Tarikan berat',
        items: [
            { type: 'Service', name: 'Servis Ringan (Tune Up)', price: 45000, q: 1 },
            { type: 'Part', name: 'Oli MPX2 0.8L', price: 45000, q: 1 }
        ],
        // Hidden fields for testing auto-fill context if needed
        phoneNumber: '08123456789', address: 'Jl. Melati No. 5', frameNumber: 'MH1JSH123', engineNumber: 'JSH123', kilometer: 15000
    },
    {
        id: 102,
        queueNumber: 2,
        date: new Date().toISOString().split('T')[0], // Today
        customerName: 'Bu Siti',
        bikeModel: 'Beat Street',
        plateNumber: 'B 4567 ABC',
        status: 'Pending',
        mechanicId: null,
        entryTime: '09:15',
        serviceType: 'Ganti Oli',
        complaint: '',
        items: [],
        phoneNumber: '08567890123', address: 'Solo Baru', frameNumber: '', engineNumber: '', kilometer: 8500
    },
    {
        id: 103,
        queueNumber: 3,
        date: new Date().toISOString().split('T')[0], // Today
        customerName: 'Mas Arif',
        bikeModel: 'NMAX',
        plateNumber: 'AB 9999 XX',
        status: 'Waiting',
        mechanicId: null,
        entryTime: '09:30',
        serviceType: 'Cek Rem',
        complaint: 'Rem bunyi',
        items: [],
        phoneNumber: '08198765432', address: 'Kartasura', frameNumber: '', engineNumber: '', kilometer: 12000
    },
];
