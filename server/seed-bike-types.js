import db from './db.js';

const bikeTypes = [
    // Honda Matic
    { type: 'Honda Beat', code: 'FI', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Honda Beat', code: 'Street', category: 'Matic', year_from: '2020', year_to: '2024' },
    { type: 'Honda Vario 125', code: 'FI', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Honda Vario 160', code: 'FI', category: 'Matic', year_from: '2022', year_to: '2024' },
    { type: 'Honda PCX 160', code: 'ABS', category: 'Matic', year_from: '2021', year_to: '2024' },
    { type: 'Honda Scoopy', code: 'FI', category: 'Matic', year_from: '2017', year_to: '2024' },
    { type: 'Honda Genio', code: 'FI', category: 'Matic', year_from: '2019', year_to: '2024' },
    { type: 'Honda ADV 160', code: 'ABS', category: 'Matic', year_from: '2020', year_to: '2024' },
    { type: 'Honda Forza 250', code: 'ABS', category: 'Matic', year_from: '2021', year_to: '2024' },

    // Honda Bebek
    { type: 'Honda Supra X 125', code: 'FI', category: 'Bebek', year_from: '2016', year_to: '2024' },
    { type: 'Honda Supra GTR 150', code: 'FI', category: 'Bebek', year_from: '2017', year_to: '2024' },
    { type: 'Honda Revo', code: 'FI', category: 'Bebek', year_from: '2015', year_to: '2024' },
    { type: 'Honda Wave 110', code: 'FI', category: 'Bebek', year_from: '2018', year_to: '2024' },

    // Honda Sport
    { type: 'Honda CBR150R', code: 'ABS', category: 'Sport', year_from: '2016', year_to: '2024' },
    { type: 'Honda CBR250RR', code: 'ABS', category: 'Sport', year_from: '2017', year_to: '2024' },
    { type: 'Honda CB150R', code: 'Streetfire', category: 'Sport', year_from: '2018', year_to: '2024' },
    { type: 'Honda CB150X', code: 'Adventure', category: 'Sport', year_from: '2021', year_to: '2024' },
    { type: 'Honda CRF150L', code: 'Trail', category: 'Sport', year_from: '2017', year_to: '2024' },

    // Yamaha Matic
    { type: 'Yamaha Mio M3', code: 'FI', category: 'Matic', year_from: '2017', year_to: '2024' },
    { type: 'Yamaha Mio S', code: 'FI', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Yamaha Mio Gear', code: 'FI', category: 'Matic', year_from: '2020', year_to: '2024' },
    { type: 'Yamaha Aerox 155', code: 'VVA', category: 'Matic', year_from: '2020', year_to: '2024' },
    { type: 'Yamaha Lexi', code: 'VVA', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Yamaha FreeGo', code: 'S-Version', category: 'Matic', year_from: '2019', year_to: '2024' },
    { type: 'Yamaha Nmax 155', code: 'Connected', category: 'Matic', year_from: '2020', year_to: '2024' },
    { type: 'Yamaha XMax 250', code: 'ABS', category: 'Matic', year_from: '2021', year_to: '2024' },

    // Yamaha Bebek
    { type: 'Yamaha Vega Force', code: 'FI', category: 'Bebek', year_from: '2016', year_to: '2024' },
    { type: 'Yamaha Jupiter Z1', code: 'FI', category: 'Bebek', year_from: '2015', year_to: '2024' },
    { type: 'Yamaha MX King 150', code: 'FI', category: 'Bebek', year_from: '2019', year_to: '2024' },

    // Yamaha Sport
    { type: 'Yamaha R15', code: 'VVA', category: 'Sport', year_from: '2017', year_to: '2024' },
    { type: 'Yamaha R25', code: 'ABS', category: 'Sport', year_from: '2019', year_to: '2024' },
    { type: 'Yamaha MT-15', code: 'VVA', category: 'Sport', year_from: '2019', year_to: '2024' },
    { type: 'Yamaha MT-25', code: 'ABS', category: 'Sport', year_from: '2020', year_to: '2024' },
    { type: 'Yamaha XSR 155', code: 'Heritage', category: 'Sport', year_from: '2020', year_to: '2024' },
    { type: 'Yamaha WR 155', code: 'Trail', category: 'Sport', year_from: '2020', year_to: '2024' },

    // Suzuki Matic
    { type: 'Suzuki Nex II', code: 'FI', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Suzuki Address', code: 'FI', category: 'Matic', year_from: '2017', year_to: '2024' },
    { type: 'Suzuki Avenis', code: 'FI', category: 'Matic', year_from: '2021', year_to: '2024' },

    // Suzuki Bebek
    { type: 'Suzuki Smash', code: 'FI', category: 'Bebek', year_from: '2016', year_to: '2024' },
    { type: 'Suzuki Satria F150', code: 'FI', category: 'Bebek', year_from: '2017', year_to: '2024' },

    // Suzuki Sport
    { type: 'Suzuki GSX-R150', code: 'ABS', category: 'Sport', year_from: '2017', year_to: '2024' },
    { type: 'Suzuki GSX-S150', code: 'FI', category: 'Sport', year_from: '2017', year_to: '2024' },

    // Kawasaki
    { type: 'Kawasaki Ninja 250', code: 'SL', category: 'Sport', year_from: '2018', year_to: '2024' },
    { type: 'Kawasaki Ninja 250', code: 'ABS', category: 'Sport', year_from: '2019', year_to: '2024' },
    { type: 'Kawasaki Z250', code: 'ABS', category: 'Sport', year_from: '2019', year_to: '2024' },
    { type: 'Kawasaki W175', code: 'Retro', category: 'Sport', year_from: '2018', year_to: '2024' },
    { type: 'Kawasaki KLX 150', code: 'BF', category: 'Sport', year_from: '2017', year_to: '2024' },

    // Vespa
    { type: 'Vespa Primavera', code: '150', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Vespa Sprint', code: '150', category: 'Matic', year_from: '2018', year_to: '2024' },
    { type: 'Vespa GTS', code: '150', category: 'Matic', year_from: '2019', year_to: '2024' },

    // Royal Enfield
    { type: 'Royal Enfield Classic 350', code: 'Standard', category: 'Sport', year_from: '2020', year_to: '2024' },
    { type: 'Royal Enfield Meteor 350', code: 'Cruiser', category: 'Sport', year_from: '2021', year_to: '2024' },

    // Benelli
    { type: 'Benelli Motobi 200', code: 'EVO', category: 'Sport', year_from: '2021', year_to: '2024' },
    { type: 'Benelli TNT 135', code: 'Naked', category: 'Sport', year_from: '2020', year_to: '2024' }
];

console.log('Seeding bike types...');

// Clear existing data
db.run('DELETE FROM bike_types', (err) => {
    if (err) {
        console.error('Error clearing bike_types:', err);
        return;
    }

    console.log('Cleared existing bike types');

    // Insert new data
    const stmt = db.prepare(`
        INSERT INTO bike_types (type, code, category, year_from, year_to)
        VALUES (?, ?, ?, ?, ?)
    `);

    let count = 0;
    bikeTypes.forEach((bike) => {
        stmt.run(
            bike.type,
            bike.code,
            bike.category,
            bike.year_from,
            bike.year_to,
            (err) => {
                if (err) {
                    console.error('Error inserting:', bike.type, err);
                } else {
                    count++;
                    if (count === bikeTypes.length) {
                        console.log(`✅ Successfully seeded ${count} bike types!`);
                        console.log('\nSample data:');
                        console.log('- Honda Beat FI (Matic)');
                        console.log('- Yamaha Nmax 155 (Matic)');
                        console.log('- Honda CBR150R (Sport)');
                        console.log('- Yamaha R15 VVA (Sport)');
                        console.log('- Suzuki GSX-R150 (Sport)');
                        console.log('\nTotal brands: Honda, Yamaha, Suzuki, Kawasaki, Vespa, Royal Enfield, Benelli');
                        console.log('Total categories: Matic, Bebek, Sport');

                        stmt.finalize();
                        db.close();
                    }
                }
            }
        );
    });
});
