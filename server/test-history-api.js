// Test API endpoint
const plateNumber = 'KB 9428 UJ'; // Dari data yang ada (Paid)

fetch(`http://localhost:3001/api/service-history/${encodeURIComponent(plateNumber)}`)
    .then(res => res.json())
    .then(data => {
        console.log(`\n=== Service History for ${plateNumber} ===`);
        console.log('Found:', data.length, 'records');
        console.table(data.map(d => ({
            id: d.id,
            queueNumber: d.queueNumber,
            date: d.date,
            status: d.status,
            serviceType: d.serviceType,
            itemsCount: d.items?.length || 0
        })));
    })
    .catch(err => {
        console.error('Error:', err.message);
    });
