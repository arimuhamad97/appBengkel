import db from './db.js';

// Delete all inventory data
db.run('DELETE FROM inventory', (err) => {
    if (err) {
        console.error('Error deleting inventory:', err.message);
    } else {
        console.log('✅ All inventory data deleted successfully');
    }

    // Verify deletion
    db.get('SELECT COUNT(*) as count FROM inventory', (err, row) => {
        if (err) {
            console.error('Error checking inventory:', err.message);
        } else {
            console.log(`📦 Inventory count: ${row.count}`);
        }
        db.close();
    });
});
