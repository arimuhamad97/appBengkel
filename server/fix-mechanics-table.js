import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./bengkel.db');

console.log('🔧 Recreating mechanics table...');

db.serialize(() => {
    // Drop old table
    db.run("DROP TABLE IF EXISTS mechanics", (err) => {
        if (err) {
            console.error('Error dropping table:', err);
            return;
        }
        console.log('✓ Old mechanics table dropped');

        // Create new table with updated schema
        db.run(`CREATE TABLE mechanics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            status TEXT DEFAULT 'Available'
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                return;
            }
            console.log('✓ New mechanics table created');
            console.log('✅ Done! You can now add mechanics.');
            db.close();
        });
    });
});
