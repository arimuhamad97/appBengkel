import db from './db.js';

console.log("Mengecek 5 data konsumen terakhir...");

db.all("SELECT * FROM customers ORDER BY id DESC LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error("Error:", err.message);
    } else {
        console.log("Data Konsumen Terakhir:");
        console.log(JSON.stringify(rows, null, 2));
    }
});
