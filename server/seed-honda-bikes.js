import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

console.log('🏍️  Mulai mengisi data motor Honda...\n');

// Data motor Honda berdasarkan katalog dari hondacengkareng.com
const hondaBikes = [
    // === KATEGORI CUB (BEBEK) ===
    { type: 'Honda WIN', code: 'GF6', category: 'CUB', year_from: '1990', year_to: '2005', engine_serial: 'GF6', frame_serial: 'GF6' },
    { type: 'Honda Astrea Grand', code: 'GRAND', category: 'CUB', year_from: '1995', year_to: '2007', engine_serial: 'C70', frame_serial: 'C70' },
    { type: 'Honda Karisma', code: 'KARISMA', category: 'CUB', year_from: '2002', year_to: '2010', engine_serial: 'NF125', frame_serial: 'NF125' },
    { type: 'Honda Kirana', code: 'KIRANA', category: 'CUB', year_from: '2003', year_to: '2007', engine_serial: 'NF100', frame_serial: 'NF100' },
    { type: 'Honda Astrea Legenda', code: 'LEGENDA', category: 'CUB', year_from: '1997', year_to: '2005', engine_serial: 'C100', frame_serial: 'C100' },
    { type: 'Honda Revo 100', code: 'REVO100', category: 'CUB', year_from: '2007', year_to: '2012', engine_serial: 'NF100', frame_serial: 'NF100' },
    { type: 'Honda Revo 110 Carbu', code: 'REVO110', category: 'CUB', year_from: '2012', year_to: '2015', engine_serial: 'NF110', frame_serial: 'NF110' },
    { type: 'Honda Revo AT', code: 'KWZ', category: 'CUB', year_from: '2009', year_to: '2012', engine_serial: 'NF110', frame_serial: 'KWZ' },
    { type: 'Honda Revo FI', code: 'K03', category: 'CUB', year_from: '2013', year_to: '2024', engine_serial: 'NF110F', frame_serial: 'K03' },
    { type: 'Honda Blade 110', code: 'BLADE110', category: 'CUB', year_from: '2009', year_to: '2012', engine_serial: 'NF110', frame_serial: 'NF110' },
    { type: 'Honda New Blade 110', code: 'BLADE110NEW', category: 'CUB', year_from: '2012', year_to: '2016', engine_serial: 'NF110', frame_serial: 'NF110' },
    { type: 'Honda Blade 125 FI', code: 'K47', category: 'CUB', year_from: '2014', year_to: '2024', engine_serial: 'JF51E', frame_serial: 'K47' },
    { type: 'Honda Supra 100', code: 'SUPRA100', category: 'CUB', year_from: '1997', year_to: '2008', engine_serial: 'C100', frame_serial: 'C100' },
    { type: 'Honda Supra FIT New', code: 'KTL', category: 'CUB', year_from: '2006', year_to: '2010', engine_serial: 'NF100', frame_serial: 'KTL' },
    { type: 'Honda Supra FIT', code: 'SUPRAFIT', category: 'CUB', year_from: '2004', year_to: '2008', engine_serial: 'NF100', frame_serial: 'NF100' },
    { type: 'Honda Supra FIT X', code: 'SUPRAFITX', category: 'CUB', year_from: '2008', year_to: '2012', engine_serial: 'NF100', frame_serial: 'NF100' },
    { type: 'Honda Supra X 125', code: 'SUPRAX125', category: 'CUB', year_from: '2005', year_to: '2012', engine_serial: 'NF125', frame_serial: 'NF125' },
    { type: 'Honda Supra X 125 PGM-FI', code: 'SUPRAX125FI', category: 'CUB', year_from: '2012', year_to: '2016', engine_serial: 'NF125F', frame_serial: 'NF125F' },
    { type: 'Honda Supra X 125 FI', code: 'KVL', category: 'CUB', year_from: '2016', year_to: '2020', engine_serial: 'JF51E', frame_serial: 'KVL' },
    { type: 'Honda Supra X 125 FI', code: 'K41', category: 'CUB', year_from: '2020', year_to: '2024', engine_serial: 'JF51E', frame_serial: 'K41' },
    { type: 'Honda Supra X 125 Helm In', code: 'KYZ', category: 'CUB', year_from: '2014', year_to: '2018', engine_serial: 'JF51E', frame_serial: 'KYZ' },
    { type: 'Honda Supra GTR 150', code: 'K56F', category: 'CUB', year_from: '2015', year_to: '2020', engine_serial: 'JF56E', frame_serial: 'K56F' },
    { type: 'Honda Supra GTR 150', code: 'K56W', category: 'CUB', year_from: '2020', year_to: '2024', engine_serial: 'JF56E', frame_serial: 'K56W' },
    { type: 'Honda Super Cub 125', code: 'SUPERCUB125', category: 'CUB', year_from: '2021', year_to: '2024', engine_serial: 'JA48E', frame_serial: 'JA48' },
    { type: 'Honda CT125 Hunter Cub', code: 'CT125', category: 'CUB', year_from: '2021', year_to: '2024', engine_serial: 'JA55E', frame_serial: 'JA55' },

    // === KATEGORI MATIC ===
    { type: 'Honda BeAT', code: 'KVY', category: 'Matic', year_from: '2008', year_to: '2012', engine_serial: 'AF02E', frame_serial: 'KVY' },
    { type: 'Honda BeAT FI', code: 'K25A', category: 'Matic', year_from: '2012', year_to: '2015', engine_serial: 'AF30E', frame_serial: 'K25A' },
    { type: 'Honda BeAT eSP', code: 'K25', category: 'Matic', year_from: '2015', year_to: '2018', engine_serial: 'JF41E', frame_serial: 'K25' },
    { type: 'Honda BeAT POP eSP', code: 'K61', category: 'Matic', year_from: '2016', year_to: '2020', engine_serial: 'JF41E', frame_serial: 'K61' },
    { type: 'Honda BeAT eSP', code: 'K81', category: 'Matic', year_from: '2018', year_to: '2020', engine_serial: 'JF41E', frame_serial: 'K81' },
    { type: 'Honda BeAT Street eSP', code: 'K81ST', category: 'Matic', year_from: '2018', year_to: '2020', engine_serial: 'JF41E', frame_serial: 'K81' },
    { type: 'Honda BeAT', code: 'K1A', category: 'Matic', year_from: '2020', year_to: '2023', engine_serial: 'JF41E', frame_serial: 'K1A' },
    { type: 'Honda BeAT Street eSP', code: 'K1AST', category: 'Matic', year_from: '2020', year_to: '2023', engine_serial: 'JF41E', frame_serial: 'K1A' },
    { type: 'Honda New BeAT', code: 'K1AL', category: 'Matic', year_from: '2023', year_to: '2024', engine_serial: 'JF41E', frame_serial: 'K1AL' },
    { type: 'Honda New BeAT Street', code: 'K1ALST', category: 'Matic', year_from: '2023', year_to: '2024', engine_serial: 'JF41E', frame_serial: 'K1AL' },
    { type: 'Honda Genio', code: 'GENIO', category: 'Matic', year_from: '2019', year_to: '2022', engine_serial: 'JF41E', frame_serial: 'GENIO' },
    { type: 'Honda Genio', code: 'K0JN', category: 'Matic', year_from: '2022', year_to: '2024', engine_serial: 'JMA1E', frame_serial: 'MH1JMA1' },
    { type: 'Honda Genio', code: 'K0JB', category: 'Matic', year_from: '2024', year_to: '2024', engine_serial: 'JMB1E', frame_serial: 'MH1JMB1' },
    { type: 'Honda Spacy', code: 'SPACY', category: 'Matic', year_from: '2009', year_to: '2012', engine_serial: 'AF02E', frame_serial: 'AF02' },
    { type: 'Honda Spacy FI', code: 'KZL', category: 'Matic', year_from: '2012', year_to: '2016', engine_serial: 'AF30E', frame_serial: 'KZL' },
    { type: 'Honda Scoopy', code: 'KYT', category: 'Matic', year_from: '2010', year_to: '2012', engine_serial: 'AF02E', frame_serial: 'KYT' },
    { type: 'Honda Scoopy FI', code: 'SCOOPYFI1', category: 'Matic', year_from: '2012', year_to: '2014', engine_serial: 'AF30E', frame_serial: 'AF30' },
    { type: 'Honda Scoopy FI', code: 'SCOOPYFI2', category: 'Matic', year_from: '2014', year_to: '2017', engine_serial: 'AF30E', frame_serial: 'AF30' },
    { type: 'Honda Scoopy eSP', code: 'K16', category: 'Matic', year_from: '2017', year_to: '2018', engine_serial: 'JF41E', frame_serial: 'K16' },
    { type: 'Honda Scoopy eSP', code: 'K93', category: 'Matic', year_from: '2018', year_to: '2019', engine_serial: 'JF41E', frame_serial: 'K93' },
    { type: 'Honda Scoopy eSP', code: 'K93H', category: 'Matic', year_from: '2019', year_to: '2021', engine_serial: 'JF41E', frame_serial: 'K93H' },
    { type: 'Honda Scoopy eSP', code: 'K2F', category: 'Matic', year_from: '2021', year_to: '2024', engine_serial: 'JF41E', frame_serial: 'K2F' },
    { type: 'Honda Scoopy eSP', code: 'K2FP', category: 'Matic', year_from: '2024', year_to: '2024', engine_serial: 'JF41E', frame_serial: 'K2FP' },
    { type: 'Honda Vario', code: 'KVB', category: 'Matic', year_from: '2006', year_to: '2009', engine_serial: 'AF02E', frame_serial: 'KVB' },
    { type: 'Honda Vario CBS', code: 'VARIOCBS', category: 'Matic', year_from: '2009', year_to: '2011', engine_serial: 'AF02E', frame_serial: 'AF02' },
    { type: 'Honda Vario 110 FI', code: 'VARIO110FI', category: 'Matic', year_from: '2011', year_to: '2015', engine_serial: 'AF30E', frame_serial: 'AF30' },
    { type: 'Honda Vario 110 eSP', code: 'VARIO110ESP', category: 'Matic', year_from: '2015', year_to: '2020', engine_serial: 'JF41E', frame_serial: 'JF41' },
    { type: 'Honda Vario Techno 125', code: 'VARIOTECHNO1', category: 'Matic', year_from: '2009', year_to: '2012', engine_serial: 'AF02E', frame_serial: 'AF02' },
    { type: 'Honda Vario Techno 125', code: 'VARIOTECHNO2', category: 'Matic', year_from: '2012', year_to: '2015', engine_serial: 'AF30E', frame_serial: 'AF30' },
    { type: 'Honda Vario 125', code: 'K60', category: 'Matic', year_from: '2015', year_to: '2018', engine_serial: 'JF50E', frame_serial: 'K60' },
    { type: 'Honda Vario 125', code: 'K60R', category: 'Matic', year_from: '2018', year_to: '2022', engine_serial: 'JF50E', frame_serial: 'K60R' },
    { type: 'Honda Vario 125', code: 'K2V', category: 'Matic', year_from: '2022', year_to: '2024', engine_serial: 'JMK2E', frame_serial: 'MH1JMK2' },
    { type: 'Honda Vario 125 Street', code: 'K2VST', category: 'Matic', year_from: '2024', year_to: '2024', engine_serial: 'JMK1E', frame_serial: 'MH1JMK1' },
    { type: 'Honda Vario 150', code: 'K59', category: 'Matic', year_from: '2015', year_to: '2018', engine_serial: 'JF52E', frame_serial: 'K59' },
    { type: 'Honda Vario 150', code: 'K59J', category: 'Matic', year_from: '2018', year_to: '2022', engine_serial: 'JF52E', frame_serial: 'K59J' },
    { type: 'Honda Vario 160', code: 'VARIO160', category: 'Matic', year_from: '2022', year_to: '2024', engine_serial: 'JF52E', frame_serial: 'VARIO160' },
    { type: 'Honda PCX 125', code: 'KWN', category: 'Matic', year_from: '2010', year_to: '2014', engine_serial: 'JF47E', frame_serial: 'KWN' },
    { type: 'Honda PCX 150', code: 'KZYF', category: 'Matic', year_from: '2014', year_to: '2015', engine_serial: 'JF47E', frame_serial: 'KZYF' },
    { type: 'Honda PCX 150', code: 'PCX150', category: 'Matic', year_from: '2015', year_to: '2018', engine_serial: 'JF58E', frame_serial: 'JF58' },
    { type: 'Honda PCX 150', code: 'K97', category: 'Matic', year_from: '2018', year_to: '2021', engine_serial: 'JF64E', frame_serial: 'K97' },
    { type: 'Honda PCX 160', code: 'PCX160', category: 'Matic', year_from: '2021', year_to: '2024', engine_serial: 'KF64E', frame_serial: 'PCX160' },
    { type: 'Honda PCX 160', code: 'K1ZV', category: 'Matic', year_from: '2024', year_to: '2024', engine_serial: 'KF64E', frame_serial: 'K1ZV' },
    { type: 'Honda ADV 150', code: 'ADV150', category: 'Matic', year_from: '2019', year_to: '2022', engine_serial: 'KF38E', frame_serial: 'ADV150' },
    { type: 'Honda ADV 160', code: 'ADV160', category: 'Matic', year_from: '2022', year_to: '2024', engine_serial: 'KF38E', frame_serial: 'ADV160' },
    { type: 'Honda Forza', code: 'FORZA', category: 'Matic', year_from: '2019', year_to: '2024', engine_serial: 'JF68E', frame_serial: 'FORZA' },
    { type: 'Honda Stylo 160', code: 'STYLO160', category: 'Matic', year_from: '2023', year_to: '2024', engine_serial: 'KF52E', frame_serial: 'STYLO160' },
    { type: 'Honda SH 150i', code: 'SH150I', category: 'Matic', year_from: '2023', year_to: '2024', engine_serial: 'KF17E', frame_serial: 'SH150I' },
    { type: 'Honda EM1 e:', code: 'EM1', category: 'Matic', year_from: '2023', year_to: '2024', engine_serial: 'ELECTRIC', frame_serial: 'EM1' },
    { type: 'Honda CUV e:', code: 'CUVE', category: 'Matic', year_from: '2024', year_to: '2024', engine_serial: 'ELECTRIC', frame_serial: 'CUVE' },
    { type: 'Honda ICON e:', code: 'ICONE', category: 'Matic', year_from: '2024', year_to: '2024', engine_serial: 'ELECTRIC', frame_serial: 'ICONE' },

    // === KATEGORI SPORT ===
    { type: 'Honda CS1', code: 'CS1', category: 'Sport', year_from: '2006', year_to: '2010', engine_serial: 'JF41E', frame_serial: 'CS1' },
    { type: 'Honda Verza 150', code: 'K18', category: 'Sport', year_from: '2012', year_to: '2017', engine_serial: 'JF51E', frame_serial: 'K18' },
    { type: 'Honda Sonic 150R', code: 'K56', category: 'Sport', year_from: '2015', year_to: '2024', engine_serial: 'JF56E', frame_serial: 'K56' },
    { type: 'Honda GL Pro Max', code: 'GLPROMAX', category: 'Sport', year_from: '1995', year_to: '2000', engine_serial: 'CB125', frame_serial: 'CB125' },
    { type: 'Honda Mega Pro', code: 'KEH', category: 'Sport', year_from: '2006', year_to: '2010', engine_serial: 'CG160', frame_serial: 'KEH' },
    { type: 'Honda New Mega Pro', code: 'KYE', category: 'Sport', year_from: '2010', year_to: '2014', engine_serial: 'NF150', frame_serial: 'KYE' },
    { type: 'Honda New Mega Pro FI', code: 'KYEFI', category: 'Sport', year_from: '2014', year_to: '2017', engine_serial: 'NF150F', frame_serial: 'KYE' },
    { type: 'Honda CB150R StreetFire', code: 'K15', category: 'Sport', year_from: '2012', year_to: '2015', engine_serial: 'JF54E', frame_serial: 'K15' },
    { type: 'Honda CB150R StreetFire', code: 'K15G', category: 'Sport', year_from: '2015', year_to: '2017', engine_serial: 'JF54E', frame_serial: 'K15G' },
    { type: 'Honda CB150R StreetFire', code: 'CB150R', category: 'Sport', year_from: '2017', year_to: '2021', engine_serial: 'JF54E', frame_serial: 'CB150R' },
    { type: 'Honda CB150R StreetFire', code: 'K15P', category: 'Sport', year_from: '2021', year_to: '2024', engine_serial: 'JF54E', frame_serial: 'K15P' },
    { type: 'Honda Tiger 2000', code: 'TIGER2000', category: 'Sport', year_from: '2000', year_to: '2006', engine_serial: 'CB200', frame_serial: 'CB200' },
    { type: 'Honda Tiger Revo', code: 'KCJ', category: 'Sport', year_from: '2007', year_to: '2013', engine_serial: 'NF200', frame_serial: 'KCJ' },
    { type: 'Honda CBR 150R', code: 'CBR150CBU', category: 'CBU', year_from: '2002', year_to: '2009', engine_serial: 'CBR150R', frame_serial: 'CBR150R' },
    { type: 'Honda CBR 150R', code: 'CBR150', category: 'Sport', year_from: '2010', year_to: '2015', engine_serial: 'JF45E', frame_serial: 'CBR150' },
    { type: 'Honda CBR 150R', code: 'K45G', category: 'Sport', year_from: '2015', year_to: '2018', engine_serial: 'JF45E', frame_serial: 'K45G' },
    { type: 'Honda CBR 150R', code: 'K45N', category: 'Sport', year_from: '2018', year_to: '2021', engine_serial: 'JF45E', frame_serial: 'K45N' },
    { type: 'Honda CBR 150R', code: 'K45R', category: 'Sport', year_from: '2021', year_to: '2024', engine_serial: 'JF45E', frame_serial: 'K45R' },
    { type: 'Honda CBR 250R', code: 'CBR250R', category: 'CBU', year_from: '2011', year_to: '2016', engine_serial: 'MC41E', frame_serial: 'MC41' },
    { type: 'Honda CBR 250RR', code: 'K64', category: 'Sport', year_from: '2016', year_to: '2019', engine_serial: 'MC51E', frame_serial: 'K64' },
    { type: 'Honda CBR 250RR', code: 'K64J', category: 'Sport', year_from: '2019', year_to: '2022', engine_serial: 'MC51E', frame_serial: 'K64J' },
    { type: 'Honda CBR 250RR', code: 'K64N', category: 'Sport', year_from: '2022', year_to: '2024', engine_serial: 'MC51E', frame_serial: 'K64N' },
    { type: 'Honda CB150X', code: 'CB150X', category: 'Sport', year_from: '2021', year_to: '2024', engine_serial: 'JF54E', frame_serial: 'CB150X' },
    { type: 'Honda CB500X', code: 'MJW', category: 'CBU', year_from: '2013', year_to: '2024', engine_serial: 'PC46E', frame_serial: 'MJW' },
    { type: 'Honda CB650F', code: 'CB650F', category: 'CBU', year_from: '2014', year_to: '2018', engine_serial: 'RC97E', frame_serial: 'CB650F' },
    { type: 'Honda CRF 150L', code: 'CRF150L', category: 'Sport', year_from: '2017', year_to: '2021', engine_serial: 'JF45E', frame_serial: 'CRF150L' },
    { type: 'Honda CRF 150L', code: 'K84F', category: 'Sport', year_from: '2021', year_to: '2024', engine_serial: 'JF45E', frame_serial: 'K84F' },
    { type: 'Honda CRF 250 Rally', code: 'CRF250', category: 'Sport', year_from: '2017', year_to: '2024', engine_serial: 'MC46E', frame_serial: 'CRF250' },
    { type: 'Honda CB150 Verza', code: 'K18H', category: 'Sport', year_from: '2017', year_to: '2024', engine_serial: 'JF51E', frame_serial: 'K18H' },
    { type: 'Honda ST125 Dax', code: 'ST125', category: 'Sport', year_from: '2021', year_to: '2024', engine_serial: 'JA55E', frame_serial: 'ST125' },
    { type: 'Honda Monkey', code: 'MONKEY', category: 'Sport', year_from: '2021', year_to: '2024', engine_serial: 'JB02E', frame_serial: 'MONKEY' },
    { type: 'Honda CBR1000RR-R', code: 'CBR1000S1', category: 'CBU', year_from: '2020', year_to: '2024', engine_serial: 'SC77L', frame_serial: 'JH2SC77L' },
];

db.serialize(() => {
    let insertedCount = 0;
    let errorCount = 0;

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO bike_types (type, code, category, year_from, year_to, engine_serial, frame_serial)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    hondaBikes.forEach((bike, index) => {
        stmt.run(
            bike.type,
            bike.code,
            bike.category,
            bike.year_from,
            bike.year_to,
            bike.engine_serial,
            bike.frame_serial,
            function (err) {
                if (err) {
                    console.error(`❌ Error pada ${bike.type}:`, err.message);
                    errorCount++;
                } else if (this.changes > 0) {
                    insertedCount++;
                    console.log(`✅ ${bike.type} (${bike.code}) - ${bike.category}`);
                }

                // Jika sudah proses semua
                if (index === hondaBikes.length - 1) {
                    stmt.finalize(() => {
                        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                        console.log(`✨ Selesai!`);
                        console.log(`📊 Total motor Honda: ${hondaBikes.length}`);
                        console.log(`✅ Berhasil ditambahkan: ${insertedCount}`);
                        console.log(`⏭️  Sudah ada (skip): ${hondaBikes.length - insertedCount - errorCount}`);
                        if (errorCount > 0) {
                            console.log(`❌ Error: ${errorCount}`);
                        }
                        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

                        // Breakdown per kategori
                        const cubCount = hondaBikes.filter(b => b.category === 'CUB').length;
                        const maticCount = hondaBikes.filter(b => b.category === 'Matic').length;
                        const sportCount = hondaBikes.filter(b => b.category === 'Sport').length;
                        const cbuCount = hondaBikes.filter(b => b.category === 'CBU').length;

                        console.log(`📋 Breakdown per kategori:`);
                        console.log(`   🏍️  CUB/Bebek: ${cubCount} motor`);
                        console.log(`   🛵 Matic: ${maticCount} motor`);
                        console.log(`   🏁 Sport: ${sportCount} motor`);
                        console.log(`   🌏 CBU: ${cbuCount} motor`);
                        console.log(``);

                        db.close((err) => {
                            if (err) {
                                console.error('Error menutup database:', err.message);
                            } else {
                                console.log('Database connection ditutup.');
                            }
                        });
                    });
                }
            }
        );
    });
});
