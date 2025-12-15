
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// Simple hash function for quick setup (in production use bcrypt)
// Since we are adding bcryptjs via npm, we can use it, but for seed script simplicity:
// We will insert plain text for now and handle hashing in the app/login endpoint or update this script
// Actually, let's just insert 'admin' user if not exists.

db.serialize(() => {
    db.run(createUsersTable, (err) => {
        if (err) {
            console.error("Error creating users table:", err);
            return;
        }
        console.log("Users table ready.");

        // Check if admin exists
        db.get("SELECT * FROM users WHERE username = ?", ['admin'], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }
            if (!row) {
                // Insert default admin
                // Ideally we hash this. But for now let's insert and we can impl login check.
                // Wait, if we use bcrypt in app, we MUST hash it here.

                // Let's use a placeholder hash or plain text and handle migration if needed.
                // Actually, I'll just write the user creation logic in a separate robust script that imports bcrypt.
                console.log("Admin user not found. Run 'node server/seed-users.js' to create it.");
            } else {
                console.log("Admin user already exists.");
            }
            db.close();
        });
    });
});
