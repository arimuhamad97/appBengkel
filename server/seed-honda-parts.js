import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bengkel.db');

const db = new sqlite3.Database(dbPath);

console.log('🔧 Mulai mengisi data sparepart Honda Genuine Parts (HGP)...\n');

// Fungsi untuk menghitung harga jual (markup 30%)
const calculateSellPrice = (costPrice) => Math.round(costPrice * 1.3);

// Data sparepart Honda Genuine Parts dengan kode asli Honda (10 digit)
const hondaParts = [
    // === AKI (ACCU) ===
    { code: '31500K93N01', name: 'Aki GTZ5S (BeAT, Vario)', group: 'Aki', unit: 'pcs', cost_price: 180000, sell_price: 0 },
    { code: '31500K16J01', name: 'Aki GTZ6V (Scoopy, PCX)', group: 'Aki', unit: 'pcs', cost_price: 220000, sell_price: 0 },
    { code: '31500K45N01', name: 'Aki GTZ7V (CBR 150R)', group: 'Aki', unit: 'pcs', cost_price: 280000, sell_price: 0 },
    { code: '31500KCRN01', name: 'Aki YTX9-BS (Tiger, Mega Pro)', group: 'Aki', unit: 'pcs', cost_price: 350000, sell_price: 0 },

    // === BAN (TIRE) ===
    { code: '42711K25J00', name: 'Ban Depan IRC 70/90-14 NR53 (BeAT, Vario)', group: 'Ban', unit: 'pcs', cost_price: 185000, sell_price: 0 },
    { code: '42711K81J00', name: 'Ban Belakang IRC 80/90-14 NR77 (BeAT, Vario)', group: 'Ban', unit: 'pcs', cost_price: 210000, sell_price: 0 },
    { code: '42711K97J00', name: 'Ban Depan IRC 90/80-14 (PCX, ADV)', group: 'Ban', unit: 'pcs', cost_price: 280000, sell_price: 0 },
    { code: '42711K97J01', name: 'Ban Belakang IRC 100/80-14 (PCX)', group: 'Ban', unit: 'pcs', cost_price: 320000, sell_price: 0 },
    { code: '42711KVL900', name: 'Ban Depan IRC 70/90-17 (Supra, Blade)', group: 'Ban', unit: 'pcs', cost_price: 160000, sell_price: 0 },
    { code: '42711KVL910', name: 'Ban Belakang IRC 80/90-17 (Supra)', group: 'Ban', unit: 'pcs', cost_price: 185000, sell_price: 0 },
    { code: '42711K45N00', name: 'Ban Depan IRC 90/80-17 (CBR 150R)', group: 'Ban', unit: 'pcs', cost_price: 380000, sell_price: 0 },
    { code: '42711K45N01', name: 'Ban Belakang IRC 120/70-17 (CBR 150R)', group: 'Ban', unit: 'pcs', cost_price: 480000, sell_price: 0 },

    // === BUSI (SPARK PLUG) ===
    { code: '9807956886', name: 'Busi NGK U20FS-U (Revo, Blade Karbu)', group: 'Busi', unit: 'pcs', cost_price: 15000, sell_price: 0 },
    { code: '9807956717', name: 'Busi NGK U24FS-U (BeAT, Scoopy Karbu)', group: 'Busi', unit: 'pcs', cost_price: 15000, sell_price: 0 },
    { code: '9807956705', name: 'Busi NGK U27FS-U (Vario Karbu)', group: 'Busi', unit: 'pcs', cost_price: 16000, sell_price: 0 },
    { code: '31926K25V41', name: 'Busi NGK CPR8EA-9 (Vario FI, BeAT FI)', group: 'Busi', unit: 'pcs', cost_price: 35000, sell_price: 0 },
    { code: '31926KRM841', name: 'Busi NGK CPR9EA-9 (PCX, Scoopy FI)', group: 'Busi', unit: 'pcs', cost_price: 38000, sell_price: 0 },
    { code: '31926KVL841', name: 'Busi NGK CPR6EA-9 (Supra FI)', group: 'Busi', unit: 'pcs', cost_price: 32000, sell_price: 0 },
    { code: '31926K15M32', name: 'Busi NGK CPR8EABM-9 (CB150R, CBR150R)', group: 'Busi', unit: 'pcs', cost_price: 42000, sell_price: 0 },
    { code: '31926K64J01', name: 'Busi NGK CPR9EABM-9 (CBR 250RR)', group: 'Busi', unit: 'pcs', cost_price: 58000, sell_price: 0 },

    // === KAMPAS REM (BRAKE PAD & SHOE) ===
    { code: '06455K25V80', name: 'Kampas Rem Depan BeAT, Scoopy', group: 'Kampas Rem', unit: 'set', cost_price: 45000, sell_price: 0 },
    { code: '06430K44V80', name: 'Kampas Rem Belakang BeAT (Drum)', group: 'Kampas Rem', unit: 'set', cost_price: 28000, sell_price: 0 },
    { code: '06455K59V80', name: 'Kampas Rem Depan Vario 125/150', group: 'Kampas Rem', unit: 'set', cost_price: 52000, sell_price: 0 },
    { code: '06455K97N01', name: 'Kampas Rem Depan PCX 150/160', group: 'Kampas Rem', unit: 'set', cost_price: 68000, sell_price: 0 },
    { code: '06435K97N01', name: 'Kampas Rem Belakang PCX 150/160', group: 'Kampas Rem', unit: 'set', cost_price: 62000, sell_price: 0 },
    { code: '06430KVLN80', name: 'Kampas Rem Tromol Supra X 125', group: 'Kampas Rem', unit: 'set', cost_price: 32000, sell_price: 0 },
    { code: '06455K15M01', name: 'Kampas Rem Depan CB150R', group: 'Kampas Rem', unit: 'set', cost_price: 85000, sell_price: 0 },
    { code: '06455K45N01', name: 'Kampas Rem Depan CBR 150R', group: 'Kampas Rem', unit: 'set', cost_price: 95000, sell_price: 0 },
    { code: '06455K45N02', name: 'Kampas Rem Belakang CBR 150R', group: 'Kampas Rem', unit: 'set', cost_price: 88000, sell_price: 0 },

    // === SARINGAN UDARA (AIR FILTER) ===
    { code: '17211K25V00', name: 'Filter Udara BeAT FI/eSP', group: 'Filter Udara', unit: 'pcs', cost_price: 38000, sell_price: 0 },
    { code: '17211K16J00', name: 'Filter Udara Scoopy FI/eSP', group: 'Filter Udara', unit: 'pcs', cost_price: 42000, sell_price: 0 },
    { code: '17211K60V00', name: 'Filter Udara Vario 125 eSP', group: 'Filter Udara', unit: 'pcs', cost_price: 45000, sell_price: 0 },
    { code: '17211K59V00', name: 'Filter Udara Vario 150 eSP', group: 'Filter Udara', unit: 'pcs', cost_price: 48000, sell_price: 0 },
    { code: '17211K97N00', name: 'Filter Udara PCX 150', group: 'Filter Udara', unit: 'pcs', cost_price: 65000, sell_price: 0 },
    { code: '17211KVLN00', name: 'Filter Udara Supra X 125 FI', group: 'Filter Udara', unit: 'pcs', cost_price: 35000, sell_price: 0 },
    { code: '17211K15M00', name: 'Filter Udara CB150R StreetFire', group: 'Filter Udara', unit: 'pcs', cost_price: 55000, sell_price: 0 },
    { code: '17211K45N00', name: 'Filter Udara CBR 150R', group: 'Filter Udara', unit: 'pcs', cost_price: 68000, sell_price: 0 },

    // === OLI FILTER ===
    { code: '15410KZRA01', name: 'Oil Filter BeAT, Vario, Scoopy', group: 'Filter Oli', unit: 'pcs', cost_price: 18000, sell_price: 0 },
    { code: '15410K97N00', name: 'Oil Filter PCX 150/160', group: 'Filter Oli', unit: 'pcs', cost_price: 32000, sell_price: 0 },
    { code: '15410K15N00', name: 'Oil Filter CB150R, CBR150R', group: 'Filter Oli', unit: 'pcs', cost_price: 28000, sell_price: 0 },
    { code: '15410K64N00', name: 'Oil Filter CBR 250RR', group: 'Filter Oli', unit: 'pcs', cost_price: 42000, sell_price: 0 },

    // === KAMPAS KOPLING (CLUTCH) ===
    { code: '22201K25V00', name: 'Kampas Kopling (Clutch Face) BeAT, Vario, Scoopy', group: 'Kampas Kopling', unit: 'set', cost_price: 85000, sell_price: 0 },
    { code: '22201K97N00', name: 'Kampas Kopling (Clutch Face) PCX 150', group: 'Kampas Kopling', unit: 'set', cost_price: 125000, sell_price: 0 },
    { code: '22201KVLN00', name: 'Kampas Kopling (Clutch Disc) Supra X 125', group: 'Kampas Kopling', unit: 'set', cost_price: 75000, sell_price: 0 },
    { code: '22201K15M00', name: 'Kampas Kopling (Clutch Disc) CB150R', group: 'Kampas Kopling', unit: 'set', cost_price: 145000, sell_price: 0 },
    { code: '22201K45N00', name: 'Kampas Kopling (Clutch Disc) CBR 150R', group: 'Kampas Kopling', unit: 'set', cost_price: 165000, sell_price: 0 },

    // === V-BELT (VAN BELT) ===
    { code: '23100K25V00', name: 'V-Belt BeAT FI/eSP', group: 'V-Belt', unit: 'pcs', cost_price: 75000, sell_price: 0 },
    { code: '23100K16J00', name: 'V-Belt Scoopy FI/eSP', group: 'V-Belt', unit: 'pcs', cost_price: 78000, sell_price: 0 },
    { code: '23100K60V00', name: 'V-Belt Vario 125 eSP', group: 'V-Belt', unit: 'pcs', cost_price: 82000, sell_price: 0 },
    { code: '23100K59V00', name: 'V-Belt Vario 150 eSP', group: 'V-Belt', unit: 'pcs', cost_price: 88000, sell_price: 0 },
    { code: '23100K97N00', name: 'V-Belt PCX 150', group: 'V-Belt', unit: 'pcs', cost_price: 145000, sell_price: 0 },
    { code: '23100K84N00', name: 'V-Belt ADV 150', group: 'V-Belt', unit: 'pcs', cost_price: 155000, sell_price: 0 },

    // === ROLLER SET ===
    { code: '22121K25V00', name: 'Roller Set BeAT', group: 'Roller', unit: 'set', cost_price: 45000, sell_price: 0 },
    { code: '22121K16J00', name: 'Roller Set Scoopy', group: 'Roller', unit: 'set', cost_price: 48000, sell_price: 0 },
    { code: '22121K60V00', name: 'Roller Set Vario 125', group: 'Roller', unit: 'set', cost_price: 52000, sell_price: 0 },
    { code: '22121K59V00', name: 'Roller Set Vario 150', group: 'Roller', unit: 'set', cost_price: 58000, sell_price: 0 },
    { code: '22121K97N00', name: 'Roller Set PCX 150', group: 'Roller', unit: 'set', cost_price: 85000, sell_price: 0 },

    // === RANTAI & GIR (CHAIN KIT) ===
    { code: '40530KVLP01', name: 'Rantai (Drive Chain) Supra X 125', group: 'Rantai', unit: 'pcs', cost_price: 145000, sell_price: 0 },
    { code: '40530K15M01', name: 'Rantai (Drive Chain) CB150R StreetFire', group: 'Rantai', unit: 'pcs', cost_price: 285000, sell_price: 0 },
    { code: '40530K45N01', name: 'Rantai (Drive Chain) CBR 150R', group: 'Rantai', unit: 'pcs', cost_price: 345000, sell_price: 0 },
    { code: '23801KVLN00', name: 'Gir Depan (Sprocket Drive) Supra X 125', group: 'Gir', unit: 'pcs', cost_price: 45000, sell_price: 0 },
    { code: '41201KVLN00', name: 'Gir Belakang (Sprocket Driven) Supra X 125', group: 'Gir', unit: 'pcs', cost_price: 85000, sell_price: 0 },
    { code: '23801K15M00', name: 'Gir Depan (Sprocket Drive) CB150R', group: 'Gir', unit: 'pcs', cost_price: 65000, sell_price: 0 },
    { code: '41201K15M00', name: 'Gir Belakang (Sprocket Driven) CB150R', group: 'Gir', unit: 'pcs', cost_price: 125000, sell_price: 0 },

    // === KABEL (CABLES) ===
    { code: '17910K25V00', name: 'Kabel Gas (Cable Throttle) BeAT', group: 'Kabel', unit: 'pcs', cost_price: 28000, sell_price: 0 },
    { code: '17910K59V00', name: 'Kabel Gas (Cable Throttle) Vario 125/150', group: 'Kabel', unit: 'pcs', cost_price: 32000, sell_price: 0 },
    { code: '17910KVLN00', name: 'Kabel Gas (Cable Throttle) Supra X 125', group: 'Kabel', unit: 'pcs', cost_price: 25000, sell_price: 0 },
    { code: '45450K25V00', name: 'Kabel Rem Depan (Cable Brake Front) BeAT', group: 'Kabel', unit: 'pcs', cost_price: 22000, sell_price: 0 },
    { code: '43450K25V00', name: 'Kabel Rem Belakang (Cable Brake Rear) BeAT', group: 'Kabel', unit: 'pcs', cost_price: 22000, sell_price: 0 },
    { code: '22870KVLN00', name: 'Kabel Kopling (Cable Clutch) Supra X 125', group: 'Kabel', unit: 'pcs', cost_price: 25000, sell_price: 0 },
    { code: '22870K15M00', name: 'Kabel Kopling (Cable Clutch) CB150R', group: 'Kabel', unit: 'pcs', cost_price: 32000, sell_price: 0 },
    { code: '44830KVLN00', name: 'Kabel Speedometer Supra X 125', group: 'Kabel', unit: 'pcs', cost_price: 28000, sell_price: 0 },

    // === SHOCK BREAKER ===
    { code: '52400K25V01', name: 'Shock Belakang BeAT (Sepasang)', group: 'Shock', unit: 'set', cost_price: 285000, sell_price: 0 },
    { code: '52400K59V01', name: 'Shock Belakang Vario 125/150 (Sepasang)', group: 'Shock', unit: 'set', cost_price: 325000, sell_price: 0 },
    { code: '52400K16J01', name: 'Shock Belakang Scoopy (Sepasang)', group: 'Shock', unit: 'set', cost_price: 295000, sell_price: 0 },
    { code: '52400K97N01', name: 'Shock Belakang PCX 150 (Sepasang)', group: 'Shock', unit: 'set', cost_price: 485000, sell_price: 0 },
    { code: '52400KVLN01', name: 'Shock Belakang Supra X 125 (Sepasang)', group: 'Shock', unit: 'set', cost_price: 245000, sell_price: 0 },

    // === LAMPU (LIGHTS) ===
    { code: '33100K25V01', name: 'Lampu Depan Assy BeAT', group: 'Lampu', unit: 'pcs', cost_price: 385000, sell_price: 0 },
    { code: '33100K59V01', name: 'Lampu Depan Assy Vario 125/150', group: 'Lampu', unit: 'pcs', cost_price: 425000, sell_price: 0 },
    { code: '33100K97N01', name: 'Lampu Depan Assy PCX 150', group: 'Lampu', unit: 'pcs', cost_price: 685000, sell_price: 0 },
    { code: '33701K25V01', name: 'Lampu Belakang Assy BeAT', group: 'Lampu', unit: 'pcs', cost_price: 185000, sell_price: 0 },
    { code: '33701K59V01', name: 'Lampu Belakang Assy Vario', group: 'Lampu', unit: 'pcs', cost_price: 225000, sell_price: 0 },
    { code: '33600K25V01', name: 'Lampu Sein BeAT (1pcs)', group: 'Lampu', unit: 'pcs', cost_price: 45000, sell_price: 0 },

    // === SPEEDOMETER ===
    { code: '37100K25V01', name: 'Speedometer Assy BeAT', group: 'Speedometer', unit: 'pcs', cost_price: 485000, sell_price: 0 },
    { code: '37100K60V01', name: 'Speedometer Assy Vario 125', group: 'Speedometer', unit: 'pcs', cost_price: 525000, sell_price: 0 },
    { code: '37100K59V01', name: 'Speedometer Assy Vario 150', group: 'Speedometer', unit: 'pcs', cost_price: 585000, sell_price: 0 },
    { code: '37100K97N01', name: 'Speedometer Assy PCX 150', group: 'Speedometer', unit: 'pcs', cost_price: 1285000, sell_price: 0 },
    { code: '37100KVLN01', name: 'Speedometer Assy Supra X 125', group: 'Speedometer', unit: 'pcs', cost_price: 385000, sell_price: 0 },

    // === SPION (MIRROR) ===
    { code: '88110K25V01', name: 'Spion Kiri (Mirror Left) BeAT', group: 'Spion', unit: 'pcs', cost_price: 65000, sell_price: 0 },
    { code: '88120K25V01', name: 'Spion Kanan (Mirror Right) BeAT', group: 'Spion', unit: 'pcs', cost_price: 65000, sell_price: 0 },
    { code: '88110K59V01', name: 'Spion Kiri (Mirror Left) Vario 125/150', group: 'Spion', unit: 'pcs', cost_price: 75000, sell_price: 0 },
    { code: '88120K59V01', name: 'Spion Kanan (Mirror Right) Vario 125/150', group: 'Spion', unit: 'pcs', cost_price: 75000, sell_price: 0 },
    { code: '88110K97N01', name: 'Spion Kiri (Mirror Left) PCX 150', group: 'Spion', unit: 'pcs', cost_price: 185000, sell_price: 0 },
    { code: '88120K97N01', name: 'Spion Kanan (Mirror Right) PCX 150', group: 'Spion', unit: 'pcs', cost_price: 185000, sell_price: 0 },

    // === MASTER REM ===
    { code: '45500K25V01', name: 'Master Rem Depan BeAT', group: 'Master Rem', unit: 'pcs', cost_price: 145000, sell_price: 0 },
    { code: '45500K59V01', name: 'Master Rem Depan Vario 125/150', group: 'Master Rem', unit: 'pcs', cost_price: 165000, sell_price: 0 },
    { code: '45500K97N01', name: 'Master Rem Depan PCX 150', group: 'Master Rem', unit: 'pcs', cost_price: 285000, sell_price: 0 },
    { code: '45500K15M01', name: 'Master Rem Depan CB150R', group: 'Master Rem', unit: 'pcs', cost_price: 325000, sell_price: 0 },

    // === KALIPER (CALIPER) ===
    { code: '45150K25V01', name: 'Kaliper Depan BeAT', group: 'Kaliper', unit: 'pcs', cost_price: 285000, sell_price: 0 },
    { code: '45150K59V01', name: 'Kaliper Depan Vario 125/150', group: 'Kaliper', unit: 'pcs', cost_price: 325000, sell_price: 0 },
    { code: '45150K97N01', name: 'Kaliper Depan PCX 150', group: 'Kaliper', unit: 'pcs', cost_price: 485000, sell_price: 0 },
    { code: '43150K97N01', name: 'Kaliper Belakang PCX 150', group: 'Kaliper', unit: 'pcs', cost_price: 445000, sell_price: 0 },

    // === PISTON KIT ===
    { code: '13101K25V01', name: 'Piston Kit BeAT (Std)', group: 'Piston', unit: 'set', cost_price: 185000, sell_price: 0 },
    { code: '13101K60V01', name: 'Piston Kit Vario 125 (Std)', group: 'Piston', unit: 'set', cost_price: 225000, sell_price: 0 },
    { code: '13101K59V01', name: 'Piston Kit Vario 150 (Std)', group: 'Piston', unit: 'set', cost_price: 265000, sell_price: 0 },
    { code: '13101KVLN01', name: 'Piston Kit Supra X 125 (Std)', group: 'Piston', unit: 'set', cost_price: 195000, sell_price: 0 },
    { code: '13101K15M01', name: 'Piston Kit CB150R (Std)', group: 'Piston', unit: 'set', cost_price: 385000, sell_price: 0 },
    { code: '13101K45N01', name: 'Piston Kit CBR 150R (Std)', group: 'Piston', unit: 'set', cost_price: 425000, sell_price: 0 },

    // === RING PISTON ===
    { code: '13011K25V00', name: 'Ring Piston BeAT (Std)', group: 'Ring Piston', unit: 'set', cost_price: 45000, sell_price: 0 },
    { code: '13011K60V00', name: 'Ring Piston Vario 125 (Std)', group: 'Ring Piston', unit: 'set', cost_price: 52000, sell_price: 0 },
    { code: '13011KVLN00', name: 'Ring Piston Supra X 125 (Std)', group: 'Ring Piston', unit: 'set', cost_price: 48000, sell_price: 0 },
    { code: '13011K15M00', name: 'Ring Piston CB150R (Std)', group: 'Ring Piston', unit: 'set', cost_price: 85000, sell_price: 0 },

    // === PAKING (GASKET) ===
    { code: '12251K25V00', name: 'Paking Head (Gasket Head) BeAT', group: 'Paking', unit: 'pcs', cost_price: 28000, sell_price: 0 },
    { code: '11381K25V00', name: 'Paking Blok (Gasket Block) BeAT', group: 'Paking', unit: 'pcs', cost_price: 15000, sell_price: 0 },
    { code: '11394K25V00', name: 'Paking Cover Blok BeAT', group: 'Paking', unit: 'pcs', cost_price: 12000, sell_price: 0 },
    { code: '12251KVLN00', name: 'Paking Head (Gasket Head) Supra X 125', group: 'Paking', unit: 'pcs', cost_price: 32000, sell_price: 0 },
    { code: '11381KVLN00', name: 'Paking Blok (Gasket Block) Supra X 125', group: 'Paking', unit: 'pcs', cost_price: 18000, sell_price: 0 },

    // === SEAL ===
    { code: '91212K25V00', name: 'Seal Kruk As (Oil Seal) BeAT (Depan)', group: 'Seal', unit: 'pcs', cost_price: 18000, sell_price: 0 },
    { code: '51490K25V00', name: 'Seal Shock Depan (Universal)', group: 'Seal', unit: 'set', cost_price: 35000, sell_price: 0 },
    { code: '91256K25V00', name: 'Seal Roda (Wheel Oil Seal) BeAT', group: 'Seal', unit: 'pcs', cost_price: 15000, sell_price: 0 },

    // === BEARING (LAHER) ===
    { code: '96100K25V00', name: 'Bearing Roda Depan BeAT', group: 'Bearing', unit: 'pcs', cost_price: 28000, sell_price: 0 },
    { code: '91051K25V00', name: 'Bearing Roda Belakang BeAT', group: 'Bearing', unit: 'pcs', cost_price: 32000, sell_price: 0 },
    { code: '53231K25V00', name: 'Bearing Komstir BeAT (Atas)', group: 'Bearing', unit: 'pcs', cost_price: 25000, sell_price: 0 },

    // === CDI & KIPROK ===
    { code: '30410K25V01', name: 'CDI (ECM Unit) BeAT FI/eSP', group: 'CDI', unit: 'pcs', cost_price: 385000, sell_price: 0 },
    { code: '30410K59V01', name: 'CDI (ECM Unit) Vario 125/150 eSP', group: 'CDI', unit: 'pcs', cost_price: 425000, sell_price: 0 },
    { code: '30410KVLN01', name: 'CDI (ECM Unit) Supra X 125 FI', group: 'CDI', unit: 'pcs', cost_price: 365000, sell_price: 0 },
    { code: '31600K25V01', name: 'Kiprok (Regulator Rectifier) BeAT', group: 'Kiprok', unit: 'pcs', cost_price: 185000, sell_price: 0 },
    { code: '31600K59V01', name: 'Kiprok (Regulator Rectifier) Vario 125/150', group: 'Kiprok', unit: 'pcs', cost_price: 195000, sell_price: 0 },

    // === RING & WASHER - Umum ===
    { code: '9410912000', name: 'Ring Baut Oli 12MM (Washer Drain Plug)', group: 'Ring & Washer', unit: 'pcs', cost_price: 3000, sell_price: 0 },
    { code: '9410914000', name: 'Ring Baut Oli 14MM (Washer Drain Plug)', group: 'Ring & Washer', unit: 'pcs', cost_price: 3500, sell_price: 0 },
    { code: '9020906000', name: 'Ring 6MM (Washer)', group: 'Ring & Washer', unit: 'pcs', cost_price: 1000, sell_price: 0 },
    { code: '9020908000', name: 'Ring 8MM (Washer)', group: 'Ring & Washer', unit: 'pcs', cost_price: 1200, sell_price: 0 },
    { code: '9020910000', name: 'Ring 10MM (Washer)', group: 'Ring & Washer', unit: 'pcs', cost_price: 1500, sell_price: 0 },

    // === BAUT MUR (NUTS & BOLTS) - Umum ===
    { code: '9510006012', name: 'Baut 6x12mm', group: 'Baut', unit: 'pcs', cost_price: 1000, sell_price: 0 },
    { code: '9510008012', name: 'Baut 8x12mm', group: 'Baut', unit: 'pcs', cost_price: 1200, sell_price: 0 },
    { code: '9510010012', name: 'Baut 10x12mm', group: 'Baut', unit: 'pcs', cost_price: 1500, sell_price: 0 },
    { code: '9410006000', name: 'Mur 6mm (Nut)', group: 'Baut', unit: 'pcs', cost_price: 800, sell_price: 0 },
    { code: '9410008000', name: 'Mur 8mm (Nut)', group: 'Baut', unit: 'pcs', cost_price: 1000, sell_price: 0 },
    { code: '9410010000', name: 'Mur 10mm (Nut)', group: 'Baut', unit: 'pcs', cost_price: 1200, sell_price: 0 },

    // === MISC ===
    { code: '53140K25V00', name: 'Handle Gas (Throttle Grip)', group: 'Handle', unit: 'set', cost_price: 35000, sell_price: 0 },
    { code: '53178K25V00', name: 'Handle Rem (Brake Lever)', group: 'Handle', unit: 'pcs', cost_price: 25000, sell_price: 0 },
    { code: '50530K25V00', name: 'Standar Samping (Side Stand) BeAT', group: 'Standar', unit: 'pcs', cost_price: 85000, sell_price: 0 },
    { code: '50530K59V00', name: 'Standar Samping (Side Stand) Vario', group: 'Standar', unit: 'pcs', cost_price: 95000, sell_price: 0 },
    { code: '50513K25V00', name: 'Per Standar (Spring Stand)', group: 'Per', unit: 'pcs', cost_price: 8000, sell_price: 0 },
];

// Hitung harga jual (30% markup) untuk semua part
hondaParts.forEach(part => {
    part.sell_price = calculateSellPrice(part.cost_price);
});

db.serialize(() => {
    let insertedCount = 0;
    let errorCount = 0;

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO part_types (code, name, group_type, unit, cost_price, sell_price)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    hondaParts.forEach((part, index) => {
        stmt.run(
            part.code,
            part.name,
            part.group,
            part.unit,
            part.cost_price,
            part.sell_price,
            function (err) {
                if (err) {
                    console.error(`❌ Error pada ${part.name}:`, err.message);
                    errorCount++;
                } else if (this.changes > 0) {
                    insertedCount++;
                    console.log(`✅ ${part.code} - ${part.name}`);
                }

                // Jika sudah proses semua
                if (index === hondaParts.length - 1) {
                    stmt.finalize(() => {
                        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                        console.log(`✨ Selesai!`);
                        console.log(`📊 Total sparepart Honda (HGP): ${hondaParts.length}`);
                        console.log(`✅ Berhasil ditambahkan: ${insertedCount}`);
                        console.log(`⏭️  Sudah ada (skip): ${hondaParts.length - insertedCount - errorCount}`);
                        if (errorCount > 0) {
                            console.log(`❌ Error: ${errorCount}`);
                        }
                        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

                        // Breakdown per kategori
                        const groups = [...new Set(hondaParts.map(p => p.group))];
                        console.log(`📋 Breakdown per kategori:`);
                        groups.forEach(group => {
                            const count = hondaParts.filter(p => p.group === group).length;
                            console.log(`   🔧 ${group}: ${count} item`);
                        });

                        console.log(`\n💰 Contoh Harga (Pokok → Jual +30%):`);
                        console.log(`   • Ring Baut Oli 12MM: Rp 3.000 → Rp 3.900`);
                        console.log(`   • Busi CPR8EA-9: Rp 35.000 → Rp 45.500`);
                        console.log(`   • V-Belt BeAT: Rp 75.000 → Rp 97.500`);
                        console.log(`   • Speedometer PCX: Rp 1.285.000 → Rp 1.670.500`);
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
