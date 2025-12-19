import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('../bengkel.db');

console.log('=== STRUKTUR TABEL SERVICES ===\n');
db.all("PRAGMA table_info(services)", [], (err, cols) => {
    if (err) console.error('Error:', err);
    else {
        console.log('Kolom di tabel services:');
        cols.forEach(col => console.log(`- ${col.name} (${col.type})`));
    }

    console.log('\n=== SEMUA JASA ===\n');
    db.all("SELECT * FROM services LIMIT 10", [], (err2, rows) => {
        if (err2) console.error('Error:', err2);
        else {
            rows.forEach(row => {
                console.log(`ID: ${row.id}, Name: "${row.name}", Group: "${row.group_type}", Price: ${row.price}`);
            });
        }

        console.log('\n=== STRUKTUR TABEL INVENTORY ===\n');
        db.all("PRAGMA table_info(inventory)", [], (err3, cols2) => {
            if (err3) console.error('Error:', err3);
            else {
                console.log('Kolom di tabel inventory:');
                cols2.forEach(col => console.log(`- ${col.name} (${col.type})`));
            }

            console.log('\n=== SAMPLE INVENTORY ===\n');
            db.all("SELECT * FROM inventory LIMIT 5", [], (err4, rows2) => {
                if (err4) console.error('Error:', err4);
                else {
                    rows2.forEach(row => {
                        console.log(`ID: "${row.id}", Name: "${row.name}", Category: "${row.category}", Price: ${row.price}`);
                    });
                }
                db.close();
            });
        });
    });
});
