import db from './db.js';

console.log('Checking queue data...\n');

// Check all queue data
db.all('SELECT id, queueNumber, plateNumber, customerName, status, date FROM queue ORDER BY id DESC LIMIT 10', [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
        db.close();
        return;
    }

    console.log('=== Last 10 Queue Records ===');
    console.table(rows);

    // Check Paid/Done records
    db.all("SELECT id, queueNumber, plateNumber, customerName, status, date FROM queue WHERE status = 'Paid' OR status = 'Done' ORDER BY id DESC", [], (err2, paidRows) => {
        if (err2) {
            console.error('Error:', err2.message);
        } else {
            console.log('\n=== Paid/Done Records ===');
            if (paidRows.length === 0) {
                console.log('❌ No Paid or Done records found!');
            } else {
                console.table(paidRows);
            }
        }

        db.close();
    });
});
