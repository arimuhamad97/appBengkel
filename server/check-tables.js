import db from './db.js';

// Check part_types table
db.all('SELECT * FROM part_types', [], (err, rows) => {
    if (err) {
        console.error('Error querying part_types:', err.message);
    } else {
        console.log('📦 Part Types Table:');
        console.log('='.repeat(80));
        if (rows.length === 0) {
            console.log('❌ No data found in part_types table');
        } else {
            console.log(`✅ Found ${rows.length} records:\n`);
            rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}`);
                console.log(`   Code: ${row.code}`);
                console.log(`   Name: ${row.name}`);
                console.log(`   Group Type: ${row.group_type || '(null)'}`);
                console.log(`   Unit: ${row.unit}`);
                console.log(`   Sell Price: Rp ${(row.sell_price || 0).toLocaleString()}`);
                console.log(`   Cost Price: Rp ${(row.cost_price || 0).toLocaleString()}`);
                console.log('');
            });
        }
    }

    // Also check inventory table
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            console.error('Error querying inventory:', err.message);
        } else {
            console.log('\n📦 Inventory Table:');
            console.log('='.repeat(80));
            if (rows.length === 0) {
                console.log('❌ No data found in inventory table');
            } else {
                console.log(`✅ Found ${rows.length} records:\n`);
                rows.forEach((row, index) => {
                    console.log(`${index + 1}. ID: ${row.id}`);
                    console.log(`   Name: ${row.name}`);
                    console.log(`   Category: ${row.category || '(null)'}`);
                    console.log(`   Price: Rp ${(row.price || 0).toLocaleString()}`);
                    console.log(`   Stock: ${row.stock}`);
                    console.log('');
                });
            }
        }
        db.close();
    });
});
