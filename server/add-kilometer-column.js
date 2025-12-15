import db from './db.js';

console.log('Adding kilometer column to customers table...');

db.run(`ALTER TABLE customers ADD COLUMN kilometer TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ Column kilometer already exists');
        } else {
            console.error('❌ Error adding column:', err.message);
        }
    } else {
        console.log('✅ Successfully added kilometer column to customers table');
    }

    db.close();
});
