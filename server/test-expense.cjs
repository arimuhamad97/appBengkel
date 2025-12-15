const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bengkel.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking expenses table in:', dbPath);

db.serialize(() => {
    // 1. Check if table exists
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'", (err, rows) => {
        if (err) {
            console.error('Error check table:', err);
        } else {
            console.log('Check Table Result:', rows);

            if (rows.length === 0) {
                console.log('Tabel expenses TIDAK DITEMUKAN! Mencoba membuat manual...');
                db.run(`CREATE TABLE IF NOT EXISTS expenses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    description TEXT NOT NULL,
                    category TEXT,
                    amount INTEGER NOT NULL,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) console.error("Create Table Error:", err);
                    else console.log("Table expenses created successfully.");
                });
            }
        }
    });

    // 2. Try insert dummy data
    const stmt = db.prepare("INSERT INTO expenses (date, description, category, amount, notes) VALUES (?, ?, ?, ?, ?)");
    stmt.run("2025-12-13", "Test Manual Expense Script", "Lainnya", 50000, "From script", function (err) {
        if (err) console.error('Insert Test Error:', err);
        else console.log('Insert Test Success, ID:', this.lastID);
    });
    stmt.finalize();
});
