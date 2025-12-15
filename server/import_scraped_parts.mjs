import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

console.log('🔄 Importing Honda parts from scraped data...\n');

// Read JSON file
const jsonFile = join(__dirname, 'honda_parts_scraped.json');
let parts = [];

try {
    const jsonData = fs.readFileSync(jsonFile, 'utf-8');
    parts = JSON.parse(jsonData);
    console.log(`✅ Loaded ${parts.length} parts from JSON file\n`);
} catch (error) {
    console.error('❌ Error reading JSON file:', error.message);
    process.exit(1);
}

// Function to estimate price based on part name/category
function estimatePrice(part) {
    const name = part.name.toLowerCase();
    const sku = part.sku;

    // Major expensive parts
    if (name.includes('speedometer') || name.includes('speedo')) return { cost: 500000, sell: 650000 };
    if (name.includes('kaliper')) return { cost: 300000, sell: 390000 };
    if (name.includes('master rem')) return { cost: 180000, sell: 234000 };
    if (name.includes('shock') && name.includes('belakang')) return { cost: 320000, sell: 416000 };
    if (name.includes('lampu depan')) return { cost: 420000, sell: 546000 };
    if (name.includes('lampu belakang')) return { cost: 200000, sell: 260000 };
    if (name.includes('spion')) return { cost: 70000, sell: 91000 };
    if (name.includes('aki') || name.includes('accu')) return { cost: 200000, sell: 260000 };

    // Medium parts
    if (name.includes('kampas rem')) return { cost: 50000, sell: 65000 };
    if (name.includes('v-belt') || name.includes('v belt')) return { cost: 80000, sell: 104000 };
    if (name.includes('roller')) return { cost: 50000, sell: 65000 };
    if (name.includes('kampas kopling')) return { cost: 90000, sell: 117000 };
    if (name.includes('filter udara')) return { cost: 45000, sell: 58500 };
    if (name.includes('filter oli') || name.includes('oil filter')) return { cost: 25000, sell: 32500 };
    if (name.includes('kabel')) return { cost: 25000, sell: 32500 };
    if (name.includes('piston kit')) return { cost: 220000, sell: 286000 };
    if (name.includes('ring piston')) return { cost: 50000, sell: 65000 };
    if (name.includes('rantai') || name.includes('chain')) return { cost: 200000, sell: 260000 };
    if (name.includes('gir') || name.includes('sprocket')) return { cost: 70000, sell: 91000 };

    // Busi
    if (name.includes('busi') || name.includes('spark plug')) {
        if (name.includes('cprid') || name.includes('iridium')) return { cost: 50000, sell: 65000 };
        if (name.includes('cpr') || name.includes('fi')) return { cost: 35000, sell: 45500 };
        return { cost: 15000, sell: 19500 };
    }

    // Ban
    if (name.includes('ban') || name.includes('tire')) {
        if (name.includes('120') || name.includes('100')) return { cost: 400000, sell: 520000 };
        if (name.includes('90')) return { cost: 300000, sell: 390000 };
        return { cost: 180000, sell: 234000 };
    }

    // Small parts
    if (name.includes('seal') || name.includes('oli seal')) return { cost: 15000, sell: 19500 };
    if (name.includes('bearing') || name.includes('laher')) return { cost: 30000, sell: 39000 };
    if (name.includes('paking') || name.includes('gasket')) return { cost: 20000, sell: 26000 };
    if (name.includes('baut') || name.includes('bolt') || name.includes('screw')) return { cost: 2000, sell: 2600 };
    if (name.includes('mur') || name.includes('nut')) return { cost: 1500, sell: 1950 };
    if (name.includes('ring') && !name.includes('piston')) return { cost: 2000, sell: 2600 };
    if (name.includes('clip') || name.includes('klip')) return { cost: 3000, sell: 3900 };
    if (name.includes('o-ring') || name.includes('oring')) return { cost: 5000, sell: 6500 };
    if (name.includes('karet') || name.includes('rubber')) return { cost: 8000, sell: 10400 };
    if (name.includes('per') || name.includes('spring')) return { cost: 10000, sell: 13000 };

    // Body parts
    if (name.includes('cover') || name.includes('cowl') || name.includes('fender')) return { cost: 80000, sell: 104000 };
    if (name.includes('stiker') || name.includes('sticker') || name.includes('mark')) return { cost: 15000, sell: 19500 };
    if (name.includes('garnish')) return { cost: 40000, sell: 52000 };

    // Default for unknown parts
    return { cost: 25000, sell: 32500 };
}

// Import to database
db.serialize(() => {
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO part_types (code, name, group_type, unit, cost_price, sell_price)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    parts.forEach((part, index) => {
        // Skip if no SKU
        if (part.sku === 'N/A' || !part.sku) {
            skippedCount++;
            return;
        }

        // Estimate prices
        const prices = estimatePrice(part);

        stmt.run(
            part.sku,
            part.name,
            part.group,
            part.unit,
            prices.cost,
            prices.sell,
            function (err) {
                if (err) {
                    console.error(`❌ Error on ${part.name}:`, err.message);
                } else {
                    if (this.changes > 0) {
                        insertedCount++;
                        if ((insertedCount + updatedCount) % 100 === 0) {
                            process.stdout.write(`\r✓ Processed: ${insertedCount + updatedCount}/${parts.length - skippedCount}`);
                        }
                    }
                }

                // Final summary
                if (index === parts.length - 1) {
                    stmt.finalize(() => {
                        console.log('\n');
                        console.log('='.repeat(60));
                        console.log('✅ Import completed!');
                        console.log(`📊 Total parts from JSON: ${parts.length}`);
                        console.log(`✅ Imported to database: ${insertedCount}`);
                        console.log(`⏭️  Skipped (no SKU): ${skippedCount}`);
                        console.log('='.repeat(60));

                        db.close((err) => {
                            if (err) {
                                console.error('Error closing database:', err.message);
                            } else {
                                console.log('\nDatabase connection closed.');
                            }
                        });
                    });
                }
            }
        );
    });
});
