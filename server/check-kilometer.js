import db from './db.js';

console.log('Checking kilometer data in queue table...\n');

// Check schema
db.all("PRAGMA table_info(queue)", [], (err, columns) => {
    if (err) {
        console.error('Error:', err.message);
        db.close();
        return;
    }

    console.log('=== Queue Table Schema ===');
    console.table(columns);

    const hasKilometer = columns.some(col => col.name === 'kilometer');

    if (!hasKilometer) {
        console.log('\n❌ Column "kilometer" NOT FOUND in queue table!');
        console.log('Need to add kilometer column to queue table.');
    } else {
        console.log('\n✅ Column "kilometer" exists in queue table');

        // Check if any records have kilometer data
        db.all("SELECT id, queueNumber, plateNumber, kilometer FROM queue WHERE kilometer IS NOT NULL AND kilometer != '' LIMIT 5", [], (err2, rows) => {
            if (err2) {
                console.error('Error:', err2.message);
            } else {
                console.log('\n=== Records with Kilometer Data ===');
                if (rows.length === 0) {
                    console.log('❌ No records with kilometer data found');
                } else {
                    console.table(rows);
                }
            }
            db.close();
        });
    }
});
