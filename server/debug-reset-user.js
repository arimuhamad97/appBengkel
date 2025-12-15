
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Check all users
    db.all("SELECT id, username, password, role FROM users", [], (err, rows) => {
        if (err) {
            console.error("Error reading users:", err);
            return;
        }
        console.log("Current Users in DB:");
        console.table(rows);
    });

    // 2. Force reset admin password just in case
    // Using simple text as per previous failure of bcrypt
    const USERNAME = 'admin';
    const PASSWORD = 'mutiara06844';

    db.run("DELETE FROM users WHERE username = ?", ['admin'], (err) => {
        if (err) console.error("Delete error", err);
        else {
            db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', 'mutiara06844', 'admin'], (err) => {
                if (err) console.error("Insert error", err);
                else console.log("Admin reset successfully to 'mutiara06844'");
            });
        }
    });

});

// Keep open for a moment to allow async ops
setTimeout(() => {
    db.close();
}, 2000);
