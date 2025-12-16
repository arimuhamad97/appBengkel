/**
 * Script untuk update harga sparepart yang salah
 * TANPA mengubah stok yang sudah ada
 * 
 * Cara pakai:
 * 1. Edit array priceUpdates di bawah dengan data harga yang benar
 * 2. Jalankan: node update-part-prices.js
 */

import db, { initDb } from './db.js';

// Data harga yang benar (dari website Honda atau supplier)
const priceUpdates = [
    // === AKI (BATTERY) ===
    {
        code: '31500KZR602',
        cost_price: 271800,      // GTZ6V - BeAT Sporty, Scoopy & Vario
        sell_price: 355000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu GTZ6V - dari website Honda Cengkareng'
    },
    {
        code: '31500KPH881',
        cost_price: 223200,      // GTZ5S GS
        sell_price: 290000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu GTZ5S GS - dari website Honda Cengkareng'
    },
    {
        code: '31500KWWA01',
        cost_price: 241000,      // GTZ4V
        sell_price: 315000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu GTZ4V - dari website Honda Cengkareng'
    },
    {
        code: '31500K64N01',
        cost_price: 520000,      // GTZ8V - CBR 250RR
        sell_price: 675000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu GTZ8V - CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '31500KCJFM0',
        cost_price: 297500,      // GM7B-4B
        sell_price: 387000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu GM7B-4B - dari website Honda Cengkareng'
    },
    {
        code: '31500GF6FM0',
        cost_price: 86000,       // 6N4-2A-4 GS - Honda WIN
        sell_price: 112000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Aki 6N4-2A-4 GS - Honda WIN - dari website Honda Cengkareng'
    },
    {
        code: '31500GBGFM0',
        cost_price: 157500,      // GM5Z-3B - Legenda, Mega Pro, Revo, Supra Fit
        sell_price: 205000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Battery GM5Z-3B - Honda Legenda, Mega Pro, Revo, Supra Fit - dari website Honda Cengkareng'
    },
    {
        code: '3150KGBGFM0',
        cost_price: 170000,      // GM5Z-3B Kit - Legenda, Supra, MegaPro, Revo
        sell_price: 221000,      // Harga jual (sudah bulat)
        note: 'Battery GM5Z-3B Kit - dari website Honda Cengkareng'
    },
    {
        code: '31500KEHFM0',
        cost_price: 107000,      // GM2.5A-3C-2 - GL MAX
        sell_price: 140000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu GM2.5A-3C-2 - GL MAX - dari website Honda Cengkareng'
    },
    {
        code: '31500KWWA03',
        cost_price: 238000,      // NTZ4V - BeAT, Blade, Revo, Scoopy, Spacy, Supra X 125
        sell_price: 310000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu NTZ4V - BeAT/Blade/Revo/Scoopy/Spacy/Supra - dari website Honda Cengkareng'
    },
    {
        code: '31500KYJ780',
        cost_price: 614500,      // YTX7L-BS - CBR 250
        sell_price: 800000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu YTX7L-BS - CBR 250 - dari website Honda Cengkareng'
    },
    {
        code: '31500KWWA02',
        cost_price: 253500,      // YTZ4-V
        sell_price: 330000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu YTZ4-V - dari website Honda Cengkareng'
    },
    {
        code: '31500KZR601',
        cost_price: 332000,      // YTZ6-V
        sell_price: 432000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu YTZ6-V - dari website Honda Cengkareng'
    },
    {
        code: '31500KPH882',
        cost_price: 273000,      // YTZ5 S
        sell_price: 355000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Accu YTZ5 S - dari website Honda Cengkareng'
    },

    // === AKSESORI AKI ===
    {
        code: '35148K78N10',
        cost_price: 0,           // Baterai Remote Keyless CR2032 - harga tidak tercantum
        sell_price: 0,           // Harga jual - akan diupdate manual
        note: 'Baterai Remote Keyless CR2032 - harga tidak tercantum di website'
    },
    {
        code: '50384K84900',
        cost_price: 82500,       // Box Battery Honda CRF 150
        sell_price: 107500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Box Battery Honda CRF 150 - dari website Honda Cengkareng'
    },
    {
        code: '64320K1AN00',
        cost_price: 66500,       // Box Comp Battery Honda BeAT K1A
        sell_price: 86500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Box Comp Battery Honda BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '50320K56N00',
        cost_price: 31000,       // Box Aki Honda Sonic
        sell_price: 40500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Box Aki Honda Sonic - dari website Honda Cengkareng'
    },
    {
        code: '50384K18900',
        cost_price: 18000,       // Box Battery Honda Verza 150
        sell_price: 23500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Box Battery Honda Verza 150 - dari website Honda Cengkareng'
    },
    {
        code: '32601K18900',
        cost_price: 15000,       // Kabel Massa Battery Honda CB150 Verza
        sell_price: 19500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kabel Massa Battery Honda CB150 Verza - dari website Honda Cengkareng'
    },
    {
        code: '32601KYE900',
        cost_price: 41500,       // Kabel Aki (Cable Battery Earth) Honda Mega Pro New
        sell_price: 54000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kabel Aki Honda Mega Pro New - dari website Honda Cengkareng'
    },
    {
        code: '80120K2FN00',
        cost_price: 36000,       // Cover Comp Battery Honda Scoopy eSP K2F
        sell_price: 47000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Cover Comp Battery Honda Scoopy eSP K2F - dari website Honda Cengkareng'
    },
    {
        code: '50381K45NL0',
        cost_price: 52000,       // Plat Penahan Aki Honda CBR150 K45R
        sell_price: 68000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plat Penahan Aki Honda CBR150 K45R - dari website Honda Cengkareng'
    },
    {
        code: '50386K18900',
        cost_price: 9000,        // Plat Penahan Aki Honda Verza 150
        sell_price: 12000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plat Penahan Aki Honda Verza 150 - dari website Honda Cengkareng'
    },
    {
        code: '50382KVBN50',
        cost_price: 12000,       // Plat Penahan Aki Honda Vario Karbu
        sell_price: 16000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plat Penahan Aki Honda Vario Karbu - dari website Honda Cengkareng'
    },
    {
        code: '50382KZLA00',
        cost_price: 5000,        // Plat Penahan Aki Honda Spacy
        sell_price: 6500,        // Harga jual (sudah bulat kelipatan 500)
        note: 'Plat Penahan Aki Honda Spacy - dari website Honda Cengkareng'
    },
    {
        code: '50381K3BN00',
        cost_price: 77500,       // Plat Penahan Aki Honda CBX 150
        sell_price: 101000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plat Penahan Aki Honda CBX 150 - dari website Honda Cengkareng'
    },
    {
        code: '50386K84900',
        cost_price: 14000,       // Plat Penahan Aki Honda CRF 150
        sell_price: 18500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plat Penahan Aki Honda CRF 150 - dari website Honda Cengkareng'
    },
    {
        code: '50381K45N40',
        cost_price: 12000,       // Plat Penahan Aki Honda CBR150R
        sell_price: 16000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plat Penahan Aki Honda CBR150R - dari website Honda Cengkareng'
    },

    // === AS RODA ===
    {
        code: '44301K84900',
        cost_price: 31000,       // As Roda Depan Honda CRF 150L K84
        sell_price: 40500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda CRF 150L K84 - dari website Honda Cengkareng'
    },
    {
        code: '90131KWB600',
        cost_price: 8000,        // Pin Pillion Step Honda Blade 110 KWB
        sell_price: 10500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Pin Pillion Step Honda Blade 110 KWB - dari website Honda Cengkareng'
    },
    {
        code: '90305GGZJ01',
        cost_price: 11000,       // Nut U 14mm (Baud Mur) – CBR 250RR K64
        sell_price: 14500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Nut U 14mm - CBR 250RR K64 - dari website Honda Cengkareng'
    },
    {
        code: '44301K64N00',
        cost_price: 44500,       // As Roda Depan Honda CBR 250RR
        sell_price: 58000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '44301KVG950',
        cost_price: 27000,       // As Roda Depan Honda BeAT FI
        sell_price: 35500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda BeAT FI - dari website Honda Cengkareng'
    },
    {
        code: '44301K56N10',
        cost_price: 24000,       // As Roda Depan Honda Supra GTR 150
        sell_price: 31500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Supra GTR 150 - dari website Honda Cengkareng'
    },
    {
        code: '42301K64N00',
        cost_price: 61000,       // As Roda Belakang Honda All New CBR 250RR
        sell_price: 79500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda All New CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '90305KVB901',
        cost_price: 15000,       // Mur As Roda belakang Matic
        sell_price: 19500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Mur As Roda belakang Matic - dari website Honda Cengkareng'
    },
    {
        code: '44301K45N00',
        cost_price: 23000,       // As Roda Depan Honda New CB150R Streetfire K15G
        sell_price: 30000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda New CB150R Streetfire K15G - dari website Honda Cengkareng'
    },
    {
        code: '44301K45NL0',
        cost_price: 33000,       // As Roda Depan Honda CBR 150R K45R
        sell_price: 43000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda CBR 150R K45R - dari website Honda Cengkareng'
    },
    {
        code: '44301KWB600',
        cost_price: 29000,       // As Roda Depan Honda Blade Karbu
        sell_price: 38000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Blade Karbu - dari website Honda Cengkareng'
    },
    {
        code: '44301K56N00',
        cost_price: 32000,       // As Roda Depan Honda Sonic 150R (K56)
        sell_price: 42000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Sonic 150R K56 - dari website Honda Cengkareng'
    },
    {
        code: '44301K0WN00',
        cost_price: 29000,       // As Roda Depan Honda ADV 150
        sell_price: 38000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda ADV 150 - dari website Honda Cengkareng'
    },
    {
        code: '44312KZR600',
        cost_price: 14000,       // Bosh Roda Depan Honda Vario125
        sell_price: 18500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Roda Depan Honda Vario125 - dari website Honda Cengkareng'
    },
    {
        code: '42301KPG900',
        cost_price: 33500,       // As Roda Belakang Honda Karisma
        sell_price: 43500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Karisma - dari website Honda Cengkareng'
    },
    {
        code: '42301KPGT00',
        cost_price: 25000,       // As Roda Belakang Honda Blade 125 FI
        sell_price: 32500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Blade 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '42301KFM900',
        cost_price: 25000,       // As Roda Belakang Honda Supra FIT
        sell_price: 32500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Supra FIT - dari website Honda Cengkareng'
    },
    {
        code: '44301K2SH00',
        cost_price: 21000,       // As Roda Depan Honda Vario 160 K2S
        sell_price: 27500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Vario 160 K2S - dari website Honda Cengkareng'
    },
    {
        code: '44301KWW640',
        cost_price: 26000,       // As Roda Depan Honda Supra X 125 FI
        sell_price: 34000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Supra X 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '42301KSPB00',
        cost_price: 44500,       // As Roda Belakang Honda New Mega Pro
        sell_price: 58000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda New Mega Pro - dari website Honda Cengkareng'
    },
    {
        code: '42301K56N00',
        cost_price: 41500,       // As Roda Belakang Honda Sonic 150R
        sell_price: 54000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '42301K84900',
        cost_price: 55000,       // As Roda Belakang Honda CRF 150L (K84)
        sell_price: 71500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda CRF 150L K84 - dari website Honda Cengkareng'
    },
    {
        code: '44301KSP900',
        cost_price: 21000,       // As Roda Depan Honda New Mega Pro (KSP)
        sell_price: 27500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda New Mega Pro KSP - dari website Honda Cengkareng'
    },
    {
        code: '90305KCJ951',
        cost_price: 13000,       // Nut U 14mm – CBR 150R, New CB150R Streetfire
        sell_price: 17000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Nut U 14mm - CBR 150R, CB150R - dari website Honda Cengkareng'
    },
    {
        code: '42301K45N00',
        cost_price: 42500,       // As Roda Belakang Honda New CBR 150R K45G
        sell_price: 55500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda New CBR 150R K45G - dari website Honda Cengkareng'
    },
    {
        code: '52101K56N00',
        cost_price: 30000,       // As Swingarm Honda Sonic 150R
        sell_price: 39000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Swingarm Honda Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '44301GN5900',
        cost_price: 19000,       // As Roda Depan Honda Scoopy FI
        sell_price: 25000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Scoopy FI - dari website Honda Cengkareng'
    },
    {
        code: '44301KW1900',
        cost_price: 24000,       // As Roda Depan Honda Tiger 2000
        sell_price: 31500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Tiger 2000 - dari website Honda Cengkareng'
    },
    {
        code: '42301KCJ690',
        cost_price: 50500,       // As Roda Belakang Honda Tiger 2000
        sell_price: 66000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Tiger 2000 - dari website Honda Cengkareng'
    },
    {
        code: '64710K0WN00',
        cost_price: 40500,       // Per As Dudukan Windshiel Honda ADV 160
        sell_price: 53000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Per As Dudukan Windshiel Honda ADV 160 - dari website Honda Cengkareng'
    },
    {
        code: '64705K0WN00',
        cost_price: 105500,      // As Penyetel Windshiel A Honda ADV 160
        sell_price: 137500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Penyetel Windshiel A Honda ADV 160 - dari website Honda Cengkareng'
    },
    {
        code: '44301GN5960',
        cost_price: 20500,       // As Roda Depan Honda Supra100
        sell_price: 27000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Supra100 - dari website Honda Cengkareng'
    },
    {
        code: '42301GN5830',
        cost_price: 25500,       // Axle RR Wheel Honda Supra, Grand Impressa, Legenda
        sell_price: 33500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Supra/Grand/Legenda - dari website Honda Cengkareng'
    },
    {
        code: '44301KEV880',
        cost_price: 23500,       // As Roda Depan Honda Supra Fit
        sell_price: 30500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Depan Honda Supra Fit - dari website Honda Cengkareng'
    },
    {
        code: '42301KWW640',
        cost_price: 26500,       // As Roda Belakang Honda Revo 110 New
        sell_price: 34500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Revo 110 New - dari website Honda Cengkareng'
    },
    {
        code: '42301KWB600',
        cost_price: 23500,       // As Roda Belakang Honda Blade Karburator
        sell_price: 30500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Blade Karburator - dari website Honda Cengkareng'
    },
    {
        code: '42311KWN900',
        cost_price: 39500,       // Bosh Roda Belakang Honda Vario 125
        sell_price: 51500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Roda Belakang Honda Vario 125 - dari website Honda Cengkareng'
    },
    {
        code: '90306KGH902',
        cost_price: 8000,        // Nut U 12 mm (Mur) – BeAT FI CBS K25
        sell_price: 10500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Nut U 12 mm - BeAT FI/CBR/Sonic - dari website Honda Cengkareng'
    },
    {
        code: '42301KPC640',
        cost_price: 44500,       // As Roda Belakang Honda Mega Pro FI
        sell_price: 58000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'As Roda Belakang Honda Mega Pro FI - dari website Honda Cengkareng'
    },

    // === BAN (TIRE) ===
    {
        code: '42711K59A12',
        cost_price: 297000,      // Ban Tubles Belakang 90/90-14 Honda Vario 150 eSP
        sell_price: 386000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 90/90-14 Vario 150 eSP - dari website Honda Cengkareng'
    },
    {
        code: '44711K59A12',
        cost_price: 263000,      // Ban Tubles Depan 80/90-14 Honda Vario 150 eSP
        sell_price: 342000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 80/90-14 Vario 150 eSP - dari website Honda Cengkareng'
    },
    {
        code: '42753GM9743',
        cost_price: 50000,       // Pentil Ban Tubles – Vario 125 eSP & Vario 150 eSP
        sell_price: 65000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Pentil Ban Tubles Vario - dari website Honda Cengkareng'
    },
    {
        code: '42711K2SN01',
        cost_price: 417000,      // Ban Belakang 120/70-14 Honda Vario 160 K2S
        sell_price: 542500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 120/70-14 Vario 160 K2S - dari website Honda Cengkareng'
    },
    {
        code: '44711K2SN01',
        cost_price: 348000,      // Ban Depan Fdr 100/80-14 Honda Vario 160 K2S
        sell_price: 452500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 100/80-14 Vario 160 K2S - dari website Honda Cengkareng'
    },
    {
        code: '42711K3VN01',
        cost_price: 479500,      // Ban Tubles Belakang Honda Stylo 160
        sell_price: 623500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang Stylo 160 - dari website Honda Cengkareng'
    },
    {
        code: '44711K3VN01',
        cost_price: 383500,      // Ban Tubles Depan Honda Stylo 160
        sell_price: 499000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan Stylo 160 - dari website Honda Cengkareng'
    },
    {
        code: '42711K0WN01',
        cost_price: 427000,      // Ban Belakang Fdr 130/70-13 Honda ADV 150
        sell_price: 555500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 130/70-13 ADV 150 - dari website Honda Cengkareng'
    },
    {
        code: '44711K0WN01',
        cost_price: 385000,      // Ban Tubles Depan Fdr 110-80-14 Honda ADV 150
        sell_price: 500500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 110-80-14 ADV 150 - dari website Honda Cengkareng'
    },
    {
        code: '42711KWW010TB',
        cost_price: 291000,      // Ban Tubles Belakang 80/90-17 Honda Supra X 125 FI
        sell_price: 378500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 80/90-17 Supra X 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '44711KWW010TB',
        cost_price: 242000,      // Ban Tubles Depan 70/90-17 Honda Revo 110
        sell_price: 315000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 70/90-17 Revo 110 - dari website Honda Cengkareng'
    },
    {
        code: '42711KVB931',
        cost_price: 243000,      // Ban Belakang 90/90-14 Honda BeAT POP eSP
        sell_price: 316000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 90/90-14 BeAT POP eSP - dari website Honda Cengkareng'
    },
    {
        code: '44711KVB931',
        cost_price: 196000,      // Ban Depan Honda 80/90-14 Vario 110 eSP
        sell_price: 255000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 80/90-14 Vario 110 eSP - dari website Honda Cengkareng'
    },
    {
        code: '42711K93N02',
        cost_price: 347000,      // Ban Tubles Belakang 110/90-12 Honda Scoopy eSP K93
        sell_price: 451500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 110/90-12 Scoopy eSP K93 - dari website Honda Cengkareng'
    },
    {
        code: '44711K93N02',
        cost_price: 287000,      // Ban Tubles Depan 100/90-12 Honda Scoopy eSP K93
        sell_price: 373500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 100/90-12 Scoopy eSP K93 - dari website Honda Cengkareng'
    },
    {
        code: '44711KTM850',
        cost_price: 201000,      // Ban Depan 70/90-17 Honda Supra X 125
        sell_price: 261500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 70/90-17 Supra X 125 - dari website Honda Cengkareng'
    },
    {
        code: '42711KTM850',
        cost_price: 247000,      // Ban Belakang 80/90-17 Honda Supra X 125
        sell_price: 321500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 80/90-17 Supra X 125 - dari website Honda Cengkareng'
    },
    {
        code: '42711K1ZN21',
        cost_price: 502000,      // Ban Tubles Belakang 130/70/13 Honda PCX 160 K1Z
        sell_price: 653000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 130/70/13 PCX 160 K1Z - dari website Honda Cengkareng'
    },
    {
        code: '44711K1ZN21',
        cost_price: 411000,      // Ban Tubles Depan 110/70/14 Honda PCX 160 K1Z
        sell_price: 534500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 110/70/14 PCX 160 K1Z - dari website Honda Cengkareng'
    },
    {
        code: '42711K0JN01',
        cost_price: 297000,      // Ban Tubles Belakang 90/90-14 Honda Genio
        sell_price: 386000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 90/90-14 Genio - dari website Honda Cengkareng'
    },
    {
        code: '44712KYE911',
        cost_price: 56500,       // Ban Dalam (Tube Tire 3.00/3.25-17) – CB150R, Mega Pro, Verza
        sell_price: 73500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Dalam 3.00/3.25-17 CB150R/Mega Pro/Verza - dari website Honda Cengkareng'
    },
    {
        code: '44711K97N02',
        cost_price: 371000,      // Ban Tubles Depan 100/80-14 Honda PCX 150 K97
        sell_price: 482500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 100/80-14 PCX 150 K97 - dari website Honda Cengkareng'
    },
    {
        code: '42711K97N02',
        cost_price: 442000,      // Ban Tubles Belakang IRC 120/70-14 Honda PCX 150 K97
        sell_price: 575000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 120/70-14 PCX 150 K97 - dari website Honda Cengkareng'
    },
    {
        code: '42711K46N00',
        cost_price: 256000,      // Ban Luar Belakang 90/90-14 Honda Vario 110 FI
        sell_price: 333000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 90/90-14 Vario 110 FI - dari website Honda Cengkareng'
    },
    {
        code: '44711K45N01',
        cost_price: 454500,      // Ban Tubles Depan IRC 100/80-17 Honda CBR150R K45A
        sell_price: 591000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 100/80-17 CBR150R K45A - dari website Honda Cengkareng'
    },
    {
        code: '42711K64N01',
        cost_price: 728000,      // Ban Tubles Belakang 140/70-17 Honda CBR 250RR
        sell_price: 946500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 140/70-17 CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '44711K64N01',
        cost_price: 519000,      // Ban Tubles Depan 110/70-17 Honda CBR 250RR
        sell_price: 675000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 110/70-17 CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '42711K59A72',
        cost_price: 345000,      // Ban Tubles Belakang Fdr 100/80-14 Honda Vario 150 eSP K59J
        sell_price: 448500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 100/80-14 Vario 150 eSP K59J - dari website Honda Cengkareng'
    },
    {
        code: '44711K59A72',
        cost_price: 298000,      // Ban Tubles Depan Fdr 90/80-14 Honda Vario 150 eSP K59J
        sell_price: 387500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 90/80-14 Vario 150 eSP K59J - dari website Honda Cengkareng'
    },
    {
        code: '42711K84901',
        cost_price: 565500,      // Ban Luar Belakang IRC 4.10-18 Honda CRF 150L
        sell_price: 735500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 4.10-18 CRF 150L - dari website Honda Cengkareng'
    },
    {
        code: '42711K45N01',
        cost_price: 740500,      // Ban Tubles Belakang 130/70-17 IRC Honda CBR 150R K45A
        sell_price: 963000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 130/70-17 CBR 150R K45A - dari website Honda Cengkareng'
    },
    {
        code: '44712KZT901',
        cost_price: 46000,       // Ban Dalam (Tube Tire) – BeAT POP eSP & BeAT Sporty eSP
        sell_price: 60000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Dalam BeAT POP/Sporty eSP - dari website Honda Cengkareng'
    },
    {
        code: '42711KYE911',
        cost_price: 427500,      // Ban Belakang 100/90-17 Honda CB Verza
        sell_price: 556000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 100/90-17 CB Verza - dari website Honda Cengkareng'
    },
    {
        code: '44713K84901',
        cost_price: 5500,        // Flap Tire IRC Honda CRF 150L
        sell_price: 7500,        // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Flap Tire IRC CRF 150L - dari website Honda Cengkareng'
    },
    {
        code: '42711K45N00TB',
        cost_price: 632000,      // Ban Tubles Belakang 130/70-17 Honda CBR 150R K45G
        sell_price: 822000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 130/70-17 CBR 150R K45G - dari website Honda Cengkareng'
    },
    {
        code: '44711K45N00TB',
        cost_price: 415000,      // Ban Tubles Depan 100/80-17 Honda CBR 150R K45G
        sell_price: 540000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 100/80-17 CBR 150R K45G - dari website Honda Cengkareng'
    },
    {
        code: '42711K56N11',
        cost_price: 543000,      // Ban Tubles Belakang 80/90-17 Honda Supra GTR K56F
        sell_price: 706000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 80/90-17 Supra GTR K56F - dari website Honda Cengkareng'
    },
    {
        code: '44711K56N11',
        cost_price: 375000,      // Ban Tubles Depan 90/80-17 Honda Supra GTR K56F
        sell_price: 487500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 90/80-17 Supra GTR K56F - dari website Honda Cengkareng'
    },
    {
        code: '42711K56N01',
        cost_price: 347500,      // Ban Tubles Belakang 80/90-17 Honda Sonic 150R
        sell_price: 452000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 80/90-17 Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '44711KYE901',
        cost_price: 322000,      // Ban Depan Tubles 80/100-17 Honda Mega Pro
        sell_price: 419000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 80/100-17 Mega Pro - dari website Honda Cengkareng'
    },
    {
        code: '44711KYE911',
        cost_price: 263000,      // Ban Luar Depan 80/100-17 Honda Mega Pro
        sell_price: 342000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Depan 80/100-17 Mega Pro - dari website Honda Cengkareng'
    },
    {
        code: '42711K15901',
        cost_price: 480000,      // Ban Tubles Belakang 100/80-17 Honda CB150R StreetFire (Old)
        sell_price: 624000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Ban Belakang 100/80-17 CB150R StreetFire - dari website Honda Cengkareng'
    },

    // === KAMPAS REM (BRAKE PAD) ===
    {
        code: '06455KVBT01',
        cost_price: 60500,       // Kampas Rem Depan Matic
        sell_price: 78500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan Matic - dari website Honda Cengkareng'
    },
    {
        code: '06430KZL930',
        cost_price: 61000,       // Kampas Rem Belakang Matic Tipe Tromol
        sell_price: 79500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang Matic Tromol dari website Honda Cengkareng'
    },
    {
        code: '06455K59A71',
        cost_price: 89000,       // Kampas Rem Depan Matic (Vario 150)
        sell_price: 116000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan Matic Vario 150 - dari website Honda Cengkareng'
    },
    {
        code: '06455K84902',
        cost_price: 72500,       // Kampas Rem Depan Honda CRF 150L Dan PCX 150 K97 ABS
        sell_price: 94500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan CRF 150L/PCX 150 K97 ABS - dari website Honda Cengkareng'
    },
    {
        code: '06435K97N01',
        cost_price: 132500,      // Kampas Rem Belakang PCX 150 K97 & PCX Hybrid
        sell_price: 172500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang PCX 150 K97/Hybrid - dari website Honda Cengkareng'
    },
    {
        code: '06455K46N21',
        cost_price: 62000,       // Kampas Rem Depan Matic (Vario 110)
        sell_price: 80500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan Matic Vario 110 - dari website Honda Cengkareng'
    },
    {
        code: '06435KREG32',
        cost_price: 81000,       // Kampas Rem Belakang CBR150R K45A, CB150R Streetfire, CBR 150R K45G
        sell_price: 105500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang CBR150R/CB150R - dari website Honda Cengkareng'
    },
    {
        code: '06455KPPN02',
        cost_price: 64500,       // Kampas Rem Depan CB150R/CBR150R/Verza
        sell_price: 84000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan CB150R/CBR150R/Verza - dari website Honda Cengkareng'
    },
    {
        code: '06455KWB601',
        cost_price: 55000,       // Kampas Rem Cakram Depan Blade & Supra X 125 FI
        sell_price: 71500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan Blade/Supra X 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '06455KPP901',
        cost_price: 53000,       // Kampas Rem Cakram Depan Mega Pro & Tiger
        sell_price: 69000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan Mega Pro/Tiger - dari website Honda Cengkareng'
    },
    {
        code: '06435KPP901',
        cost_price: 51500,       // Kampas Rem Cakram Belakang Supra X 125 & Tiger
        sell_price: 67000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang Supra X 125/Tiger - dari website Honda Cengkareng'
    },
    {
        code: '06435K64N01',
        cost_price: 143000,      // Kampas Rem Belakang CBR 250RR K64
        sell_price: 186000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '06455K33D52',
        cost_price: 409500,      // Kampas Rem Depan CBR 250RR K64
        sell_price: 532500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '06455K56N01',
        cost_price: 59500,       // Kampas Rem Depan Honda Sonic
        sell_price: 77500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Depan Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '06435K56N01',
        cost_price: 84000,       // Kampas Rem Cakram Belakang Sonic 150R
        sell_price: 109500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang Sonic 150R - dari website Honda Cengkareng'
    },

    // === BUSI (SPARK PLUG) ===
    {
        code: '31919K25601',
        cost_price: 43500,       // Busi MR9C-9N Honda BeAT Sporty eSP
        sell_price: 56500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi MR9C-9N BeAT Sporty eSP - dari website Honda Cengkareng'
    },
    {
        code: '9805657723',
        cost_price: 18000,       // Busi U22FSU (DS)
        sell_price: 23500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi U22FSU - dari website Honda Cengkareng'
    },
    {
        code: '9806786871',
        cost_price: 19500,       // Busi U20EPR9 (DS)
        sell_price: 25500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi U20EPR9 - dari website Honda Cengkareng'
    },
    {
        code: '30700KZL931',
        cost_price: 35500,       // Kepala Busi Honda Scoopy FI
        sell_price: 46500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kepala Busi Scoopy FI - dari website Honda Cengkareng'
    },
    {
        code: '30700KZR602',
        cost_price: 32000,       // Kepala Busi Honda Vario 125 FI
        sell_price: 41500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kepala Busi Vario 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '30700K81N01',
        cost_price: 35500,       // Kepala Busi Honda BeAT eSP New K81
        sell_price: 46500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kepala Busi BeAT eSP K81 - dari website Honda Cengkareng'
    },
    {
        code: '30700K81N11',
        cost_price: 47500,       // Kepala Busi Honda BeAT eSP New K81 (Type 2)
        sell_price: 62000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kepala Busi BeAT eSP K81 Type 2 - dari website Honda Cengkareng'
    },

    // === SPION (MIRROR) ===
    {
        code: '45517K81N30',
        cost_price: 27000,       // Holder Dudukan Spion Honda Scoopy eSP K93
        sell_price: 35500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Holder Spion Scoopy eSP K93 - dari website Honda Cengkareng'
    },
    {
        code: '88220K1AN01',
        cost_price: 49500,       // Spion Kiri Mirror L Honda BeAT K1A
        sell_price: 64500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '88110K25900',
        cost_price: 38500,       // Spion Kanan Mirror R Honda BeAT FI
        sell_price: 50000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan BeAT FI - dari website Honda Cengkareng'
    },
    {
        code: '88120K25900',
        cost_price: 38500,       // Spion Kiri Mirror L Honda BeAT eSP
        sell_price: 50000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri BeAT eSP - dari website Honda Cengkareng'
    },
    {
        code: '88110KCJ660',
        cost_price: 47500,       // Spion Kanan Mirror R Honda Tiger Revo
        sell_price: 62000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan Tiger/Revo - dari website Honda Cengkareng'
    },
    {
        code: '88120KCJ660',
        cost_price: 47500,       // Spion Kiri Mirror L Honda New CB150R K15G
        sell_price: 62000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri CB150R K15G - dari website Honda Cengkareng'
    },
    {
        code: '88210K1AN01',
        cost_price: 49500,       // Spion Kanan Mirror R Honda BeAT K1A
        sell_price: 64500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '88120KZR600',
        cost_price: 43500,       // Spion Kiri Mirror L Honda Vario 125 eSP
        sell_price: 56500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri Vario 125 eSP - dari website Honda Cengkareng'
    },
    {
        code: '88110KZR600',
        cost_price: 43500,       // Spion Kanan Mirror R Honda Vario 125 eSP
        sell_price: 56500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan Vario 125 eSP - dari website Honda Cengkareng'
    },
    {
        code: '88119KWW640',
        cost_price: 5000,        // Karet Spion Cap Lock Nut Honda Scoopy eSP K93
        sell_price: 6500,        // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Karet Spion Scoopy eSP K93 - dari website Honda Cengkareng'
    },
    {
        code: '88210K97N01',
        cost_price: 62500,       // Spion Kanan Mirror R Honda PCX 150 K97
        sell_price: 81500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan PCX 150 K97 - dari website Honda Cengkareng'
    },
    {
        code: '88220K97N01',
        cost_price: 62500,       // Spion Kiri Mirror L Honda PCX 150 K97
        sell_price: 81500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri PCX 150 K97 - dari website Honda Cengkareng'
    },
    {
        code: '88220K2SN01',
        cost_price: 64000,       // Spion Kiri Mirror L Honda Vario 160 K2S
        sell_price: 83500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri Vario 160 K2S - dari website Honda Cengkareng'
    },
    {
        code: '88210KEH600',
        cost_price: 41500,       // Spion Kanan Mirror R Honda CRF 150L
        sell_price: 54000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan CRF 150L - dari website Honda Cengkareng'
    },
    {
        code: '90003MY5720',
        cost_price: 24500,       // Baut Spion Bolt Adapter 10mm Honda PCX
        sell_price: 32000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Baut Spion 10mm PCX - dari website Honda Cengkareng'
    },

    // === KOMPONEN CVT (Motor Matic) ===
    // V-BELT
    {
        code: '23100K44BA0',
        cost_price: 150000,      // Van Belt Honda BeAT eSP K81
        sell_price: 195000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt BeAT eSP K81 - dari website Honda Cengkareng'
    },
    {
        code: '23100K44V01',
        cost_price: 111000,      // Van Belt BeAT eSP, BeAT POP eSP & Vario 110 eSP
        sell_price: 144500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt BeAT/Vario 110 eSP - dari website Honda Cengkareng'
    },
    {
        code: '23100K1ABA0',
        cost_price: 123000,      // Vanbelt + Roller Set Honda Beat K1A/Scoopy K2F
        sell_price: 160000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt + Roller Set BeAT K1A/Scoopy K2F - dari website Honda Cengkareng'
    },
    {
        code: '23100K35V01',
        cost_price: 139000,      // Van Belt Vario 125 eSP
        sell_price: 181000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt Vario 125 eSP - dari website Honda Cengkareng'
    },
    {
        code: '23100K35BA0',
        cost_price: 175000,      // Van Belt Drive Kit Vario 125 eSP K60
        sell_price: 227500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt Drive Kit Vario 125 eSP K60 - dari website Honda Cengkareng'
    },
    {
        code: '23100KZRBA0',
        cost_price: 200500,      // Van Belt Vario 125 FI
        sell_price: 261000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt Vario 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '23100K2SN01',
        cost_price: 142500,      // Van Belt Honda Vario 160 K2S
        sell_price: 185500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt Vario 160 K2S - dari website Honda Cengkareng'
    },
    {
        code: '23100K0JBA0',
        cost_price: 130500,      // Belt Drive Kit Honda Genio
        sell_price: 170000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Belt Drive Kit Genio - dari website Honda Cengkareng'
    },
    {
        code: '23100KZLBA0',
        cost_price: 156000,      // Van Belt Spacy FI
        sell_price: 203000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt Spacy FI - dari website Honda Cengkareng'
    },
    {
        code: '23100K1ZN21',
        cost_price: 167500,      // Van Belt PCX 160 K1Z
        sell_price: 218000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt PCX 160 K1Z - dari website Honda Cengkareng'
    },
    {
        code: '23100K1ZBA0',
        cost_price: 208500,      // Van Belt Drive Kit PCX 160 K1Z & ADV 160
        sell_price: 271500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt Drive Kit PCX 160/ADV 160 - dari website Honda Cengkareng'
    },
    {
        code: '23100K97T01',
        cost_price: 167500,      // Van Belt PCX 150 & ADV
        sell_price: 218000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt PCX 150/ADV - dari website Honda Cengkareng'
    },
    {
        code: '23100KVYBA1',
        cost_price: 146500,      // Van Belt BeAT Karburator
        sell_price: 190500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt BeAT Karburator - dari website Honda Cengkareng'
    },
    {
        code: '23100KVY902',
        cost_price: 113000,      // Van Belt BeAT Karbu
        sell_price: 147000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Van Belt BeAT Karbu - dari website Honda Cengkareng'
    },

    // ROLLER SET
    {
        code: '22123K1AN00',
        cost_price: 39500,       // Roller Set 15 Gram Honda BeAT K1A
        sell_price: 51500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Roller Set 15g BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '2212AK44V00',
        cost_price: 55000,       // Roller Set 15 Gram Honda BeAT POP eSP
        sell_price: 71500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Roller Set 15g BeAT POP eSP - dari website Honda Cengkareng'
    },
    {
        code: '2212AKVB900',
        cost_price: 67500,       // Roller Set 13 Gram Honda Vario 110 Karbu
        sell_price: 88000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Roller Set 13g Vario 110 Karbu - dari website Honda Cengkareng'
    },
    {
        code: '22123K0SV00',
        cost_price: 45000,       // Roller Set 19 Gram Honda PCX 160 K1Z
        sell_price: 58500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Roller Set 19g PCX 160 K1Z - dari website Honda Cengkareng'
    },

    // RUMAH ROLLER
    {
        code: '22110K44V00',
        cost_price: 75500,       // Rumah Roler Honda Vario 110 eSP
        sell_price: 98500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Rumah Roller Vario 110 eSP - dari website Honda Cengkareng'
    },
    {
        code: '22110K35V00',
        cost_price: 84500,       // Rumah Roler Honda Vario 125 eSP
        sell_price: 110000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Rumah Roller Vario 125 eSP - dari website Honda Cengkareng'
    },
    {
        code: '22110GFM960',
        cost_price: 82000,       // Rumah Roler Honda Spacy FI
        sell_price: 106500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Rumah Roller Spacy FI - dari website Honda Cengkareng'
    },
    {
        code: '22110KVY900',
        cost_price: 71500,       // Rumah Roler Honda BeAT Karbu
        sell_price: 93000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Rumah Roller BeAT Karbu - dari website Honda Cengkareng'
    },

    // BOSH RUMAH ROLLER
    {
        code: '22105K44V00',
        cost_price: 28000,       // Bosh Rumah Roler Honda Vario 110 eSP
        sell_price: 36500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Rumah Roller Vario 110 eSP - dari website Honda Cengkareng'
    },
    {
        code: '22105KWN900',
        cost_price: 44500,       // Bosh Rumah Roler Honda Vario 125 eSP
        sell_price: 58000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Rumah Roller Vario 125 eSP - dari website Honda Cengkareng'
    },
    {
        code: '22105K0JN00',
        cost_price: 32500,       // Bosh Rumah Roler Honda BeAT K1A
        sell_price: 42500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Rumah Roller BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '22105KZLC00',
        cost_price: 26000,       // Bosh Rumah Roler Honda Spacy FI
        sell_price: 34000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Rumah Roller Spacy FI - dari website Honda Cengkareng'
    },
    {
        code: '22105KVB900',
        cost_price: 23000,       // Bosh Rumah Roler Honda Vario 110 Karbu
        sell_price: 30000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bosh Rumah Roller Vario 110 Karbu - dari website Honda Cenengkareng'
    },

    // KIPAS CVT
    {
        code: '22102K1ZN20',
        cost_price: 58000,       // Kipas CVT Honda PCX 160 K1Z
        sell_price: 75500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kipas CVT PCX 160 K1Z - dari website Honda Cengkareng'
    },
    {
        code: '22102KZR600',
        cost_price: 52500,       // Kipas CVT Honda PCX 150
        sell_price: 68500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kipas CVT PCX 150 - dari website Honda Cengkareng'
    },
    {
        code: '22102K44V00',
        cost_price: 49500,       // Kipas CVT Honda Vario 110 eSP
        sell_price: 64500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kipas CVT Vario 110 eSP - dari website Honda Cengkareng'
    },

    // KOMPONEN CVT LAINNYA
    {
        code: '23225KSY900',
        cost_price: 9000,        // Pin Roller Honda ADV, BeAT, PCX, Vario
        sell_price: 12000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Pin Roller ADV/BeAT/PCX/Vario - dari website Honda Cengkareng'
    },
    {
        code: '23225GW3000',
        cost_price: 9000,        // Pin Roller Honda BeAT FI
        sell_price: 12000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Pin Roller BeAT FI - dari website Honda Cengkareng'
    },
    {
        code: '23226K27V02',
        cost_price: 2500,        // Roller Guide BeAT eSP, Scoopy eSP
        sell_price: 3500,        // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Roller Guide BeAT/Scoopy eSP - dari website Honda Cengkareng'
    },
    {
        code: '22401KVY900',
        cost_price: 7000,        // Per Kampas Ganda Honda BeAT Karbu
        sell_price: 9500,        // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Per Kampas Ganda BeAT Karbu - dari website Honda Cengkareng'
    },
    {
        code: '22401KWN640',
        cost_price: 11000,       // Per Kampas Ganda PCX 150, Vario 150 eSP
        sell_price: 14500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Per Kampas Ganda PCX 150/Vario 150 - dari website Honda Cengkareng'
    },
    {
        code: '22100KWN900',
        cost_price: 130000,      // Mangkok Ganda PCX, Spacy FI, Vario 125/150
        sell_price: 169000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Mangkok Ganda PCX/Vario - dari website Honda Cengkareng'
    },
    {
        code: '22131KVB900',
        cost_price: 43500,       // Plate Ramp Honda BeAT POP
        sell_price: 56500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Plate Ramp BeAT POP - dari website Honda Cengkareng'
    },
    {
        code: '22350K81N21',
        cost_price: 45500,       // Dudukan Kampas Ganda Honda BeAT eSP K81
        sell_price: 59500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Dudukan Kampas Ganda BeAT eSP K81 - dari website Honda Cengkareng'
    },
    {
        code: '23411KZL930',
        cost_price: 180000,      // Shaft Drive 18T Honda BeAT eSP K25
        sell_price: 234000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Shaft Drive 18T BeAT eSP K25 - dari website Honda Cengkareng'
    },
    {
        code: '23411K81N00',
        cost_price: 126000,      // Shaft Drive 18T Honda BeAT eSP K81
        sell_price: 164000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Shaft Drive 18T BeAT eSP K81 - dari website Honda Cengkareng'
    },
    {
        code: '91109GGCG01',
        cost_price: 35000,       // Bearing Pully Honda Vario 125 eSP
        sell_price: 45500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Bearing Pully Vario 125 eSP - dari website Honda Cengkareng'
    },

    // === SARINGAN UDARA (AIR FILTER) ===
    {
        code: '17210K1AN00',
        cost_price: 65000,       // Saringan Udara Honda BeAT K1A ISS/Deluxe
        sell_price: 84500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '17210K16900',
        cost_price: 53500,       // Saringan Udara Honda BeAT FI/eSP/POP
        sell_price: 69500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara BeAT FI - dari website Honda Cengkareng'
    },
    {
        code: '17210K0JN00',
        cost_price: 55000,       // Saringan Udara Honda Genio, BeAT K1A CBS
        sell_price: 71500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Genio/BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '17210K97N00',
        cost_price: 79500,       // Saringan Udara Honda PCX 150 K97
        sell_price: 103500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara PCX 150 - dari website Honda Cengkareng'
    },
    {
        code: '17210K1ZN20',
        cost_price: 76500,       // Saringan Udara Honda PCX 160 K1Z
        sell_price: 99500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara PCX 160 - dari website Honda Cengkareng'
    },
    {
        code: '17220K59A10',
        cost_price: 65000,       // Saringan Udara Honda Vario 150 eSP
        sell_price: 84500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Vario 150 eSP - dari website Honda Cengkareng'
    },
    {
        code: '17220K2SN00',
        cost_price: 77000,       // Saringan Udara Honda Vario 160 K2S / ADV 160
        sell_price: 100000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Vario 160/ADV 160 - dari website Honda Cengkareng'
    },
    {
        code: '17220KZR600',
        cost_price: 59000,       // Saringan Udara Honda Vario Techno 125 Helm-In FI CBS
        sell_price: 76500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Vario 125 FI - dari website Honda Cengkareng'
    },
    {
        code: '17211K15900',
        cost_price: 61000,       // Saringan Udara Honda Old CB150R
        sell_price: 79500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Old CB150R - dari website Honda Cengkareng'
    },
    {
        code: '17211K84900',
        cost_price: 88000,       // Saringan Udara Honda CRF 150L K84
        sell_price: 114500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara CRF 150L - dari website Honda Cengkareng'
    },
    {
        code: '17211K18900',
        cost_price: 59000,       // Saringan Udara Honda Verza
        sell_price: 77000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Verza - dari website Honda Cengkareng'
    },
    {
        code: '17210K46N20',
        cost_price: 56000,       // Saringan Udara Honda Vario 110 FI
        sell_price: 73000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Vario 110 FI - dari website Honda Cengkareng'
    },
    {
        code: '17210K03N30',
        cost_price: 51000,       // Saringan Udara Honda Revo FI
        sell_price: 66500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Revo FI - dari website Honda Cengkareng'
    },
    {
        code: '17210KVY960',
        cost_price: 56500,       // Saringan Udara Honda BeAT Karburator
        sell_price: 73500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara BeAT Karbu - dari website Honda Cengkareng'
    },
    {
        code: '17210K64N00',
        cost_price: 130000,      // Saringan Udara Honda New CBR 250RR
        sell_price: 169000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara CBR 250RR - dari website Honda Cengkareng'
    },
    {
        code: '17210K93N00',
        cost_price: 63500,       // Saringan Udara Honda Scoopy eSP (K93)
        sell_price: 82500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Scoopy eSP K93 - dari website Honda Cengkareng'
    },
    {
        code: '17210KVB930',
        cost_price: 59500,       // Saringan Udara Honda Vario 110 Karbu
        sell_price: 77500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Vario 110 Karbu - dari website Honda Cengkareng'
    },
    {
        code: '17210KPH900',
        cost_price: 45500,       // Saringan Udara Honda Kharisma
        sell_price: 59500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Kharisma - dari website Honda Cengkareng'
    },
    {
        code: '17210K56N00',
        cost_price: 62500,       // Saringan Udara Honda Sonic 150R
        sell_price: 81500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '17210KZLA00',
        cost_price: 60500,       // Saringan Udara Honda Spacy
        sell_price: 79000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Saringan Udara Spacy - dari website Honda Cengkareng'
    },

    // === RANTAI RODA (GEAR SET / DRIVE CHAIN KIT) ===
    {
        code: '06401K18900',
        cost_price: 315500,      // Gear Set Honda Verza 150
        sell_price: 410000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Verza 150 - dari website Honda Cengkareng'
    },
    {
        code: '06401K41N01',
        cost_price: 225000,      // Gear Set Honda Supra X 125 FI New
        sell_price: 292500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Supra X 125 FI New - dari website Honda Cengkareng'
    },
    {
        code: '06401KPH881',
        cost_price: 206500,      // Gear Set Honda Kharisma
        sell_price: 268500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Kharisma - dari website Honda Cengkareng'
    },
    {
        code: '06401KWW900',
        cost_price: 207000,      // Gear Set Honda Revo 110 New
        sell_price: 269000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Revo 110 New - dari website Honda Cengkareng'
    },
    {
        code: '06401K84900',
        cost_price: 433500,      // Gear Set Honda CRF 150L
        sell_price: 563500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set CRF 150L - dari website Honda Cengkareng'
    },
    {
        code: '06401K45N01',
        cost_price: 360000,      // Gear Set Honda CB150 StreetFire
        sell_price: 468000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set CB150 StreetFire - dari website Honda Cengkareng'
    },
    {
        code: '06401K15900',
        cost_price: 346000,      // Gear Set Honda CB150R StreetFire (Old)
        sell_price: 450000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set CB150R Old - dari website Honda Cengkareng'
    },
    {
        code: '06401K56N11',
        cost_price: 348000,      // Gear Set Honda Supra GTR 150
        sell_price: 452500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Supra GTR 150 - dari website Honda Cengkareng'
    },
    {
        code: '06401KWB900',
        cost_price: 216500,      // Gear Set Honda Blade
        sell_price: 281500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Blade - dari website Honda Cengkareng'
    },
    {
        code: '06401KYZ900',
        cost_price: 220500,      // Gear Set Honda Supra X 125 Helm In
        sell_price: 286500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Supra X 125 Helm In - dari website Honda Cengkareng'
    },
    {
        code: '06401K45N41',
        cost_price: 357000,      // Gear Set Honda New CBR 150R K45G
        sell_price: 464000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set CBR 150R K45G - dari website Honda Cengkareng'
    },
    {
        code: '06401K56N00',
        cost_price: 323500,      // Gear Set Honda Sonic 150R
        sell_price: 420500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '06401KYE900',
        cost_price: 330000,      // Gear Set Honda New Mega Pro
        sell_price: 429000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Gear Set New Mega Pro - dari website Honda Cengkareng'
    },

    // === PELENGKAP KAMPAS REM (BRAKE SHOE - TROMOL) ===
    {
        code: '43130KZL930',
        cost_price: 55500,       // Kampas Rem Belakang Matic (BeAT/Vario/Scoopy/Spacy/Genio)
        sell_price: 72500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang Tromol Matic Universal - dari website Honda Cengkareng'
    },
    {
        code: '43130K44V80',
        cost_price: 49000,       // Kampas Rem Belakang BeAT K1A / BeAT Street K1A
        sell_price: 64000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang BeAT K1A - dari website Honda Cengkareng'
    },
    {
        code: '06430KWN900',
        cost_price: 271000,      // Kampas Rem Belakang PCX / High Quality
        sell_price: 352500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Kampas Rem Belakang PCX (High Quality) - dari website Honda Cengkareng'
    },
    {
        code: '06430K44V80',
        cost_price: 50000,       // Shoe Set Brake BeAT K1A
        sell_price: 65000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Shoe Set Brake BeAT K1A - dari website Honda Cengkareng'
    },

    // === PELENGKAP BUSI (SPARK PLUG) ===
    {
        code: '31916KPH901',
        cost_price: 13500,       // Busi NGK CPR6EA-9 (Kharisma, Supra X 125, BeAT Karbu, Scoopy)
        sell_price: 18000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi NGK CPR6EA-9 - Estimasi harga pasar'
    },
    {
        code: '31916KRM841',
        cost_price: 13500,       // Busi NGK CPR8EA-9 (BeAT FI, Vario 125/150, MegaPro New)
        sell_price: 18000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi NGK CPR8EA-9 - Estimasi harga pasar'
    },
    {
        code: '31916K25601',
        cost_price: 13500,       // Busi NGK CPR9EA-9 (Vario 150, CB150R, CBR150R, Sonic)
        sell_price: 18000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi NGK CPR9EA-9 - Estimasi harga pasar'
    },
    {
        code: '9805656718',
        cost_price: 13500,       // Busi Denso U20EPR9 (Alternative CPR6)
        sell_price: 18000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi Denso U20EPR9 - Estimasi harga pasar'
    },
    {
        code: '9805658718',
        cost_price: 13500,       // Busi Denso U24EPR9 (Alternative CPR8)
        sell_price: 18000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Busi Denso U24EPR9 - Estimasi harga pasar'
    },

    // === PELENGKAP SPION (MIRROR) ===
    {
        code: '88110K0JN01',
        cost_price: 50000,       // Spion Kanan Honda Genio
        sell_price: 65000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan Genio - Estimasi harga pasar'
    },
    {
        code: '88120K0JN01',
        cost_price: 50000,       // Spion Kiri Honda Genio
        sell_price: 65000,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri Genio - Estimasi harga pasar'
    },
    {
        code: '88110K0WN01',
        cost_price: 65000,       // Spion Kanan Honda ADV 150
        sell_price: 84500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan ADV 150 - Estimasi harga pasar'
    },
    {
        code: '88120K0WN01',
        cost_price: 65000,       // Spion Kiri Honda ADV 150
        sell_price: 84500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri ADV 150 - Estimasi harga pasar'
    },
    {
        code: '88110K56N01',
        cost_price: 55000,       // Spion Kanan Honda Supra GTR 150 / Sonic 150R
        sell_price: 71500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kanan Supra GTR/Sonic - Estimasi harga pasar'
    },
    {
        code: '88120K56N01',
        cost_price: 55000,       // Spion Kiri Honda Supra GTR 150 / Sonic 150R
        sell_price: 71500,       // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Spion Kiri Supra GTR/Sonic - Estimasi harga pasar'
    },

    // === PISTON KIT (SEHER SET) ===
    {
        code: '131A1KWN902',
        cost_price: 102000,      // Piston Kit Vario 125 eSP
        sell_price: 133000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit Vario 125 eSP - dari website Honda Cengkareng'
    },
    {
        code: '131A1K15305',
        cost_price: 153000,      // Piston Kit CB150R Streetfire Old
        sell_price: 200000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit CB150R Old - dari website Honda Cengkareng'
    },
    {
        code: '131A1K56P00',
        cost_price: 163000,      // Piston Kit Sonic 150R / Supra GTR / New CB150R
        sell_price: 212000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit Sonic 150R - dari website Honda Cengkareng'
    },
    {
        code: '131A1KPH881',
        cost_price: 115000,      // Piston Kit Kharisma / Supra X 125
        sell_price: 150000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit Kharisma - dari website Honda Cengkareng'
    },
    {
        code: '131A1GN5902',
        cost_price: 100000,      // Piston Kit Grand / Supra X / Prima
        sell_price: 130000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit Grand - Estimasi Harga Pasar'
    },
    {
        code: '131A1KZL960',
        cost_price: 115000,      // Piston Kit BeAT FI / Scoopy FI / Spacy FI
        sell_price: 150000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit BeAT FI - Estimasi Harga Pasar'
    },
    {
        code: '131A1K44V00',
        cost_price: 120000,      // Piston Kit BeAT eSP / Vario 110 eSP / BeAT Pop
        sell_price: 156000,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit BeAT eSP - Estimasi Harga Pasar'
    },
    {
        code: '131A1K0JN00',
        cost_price: 125000,      // Piston Kit Genio / BeAT K1A / Scoopy K2F
        sell_price: 162500,      // Harga jual (dibulatkan untuk kemudahan transaksi)
        note: 'Piston Kit Genio/BeAT K1A - Estimasi Harga Pasar'
    }
];

console.log('===========================================');
console.log('  Update Harga Sparepart');
console.log('===========================================');
console.log('');

// Initialize database
await initDb();

console.log(`📦 Total ${priceUpdates.length} part akan diupdate`);
console.log('');

let updated = 0;
let notFound = 0;
let errors = 0;

for (const item of priceUpdates) {
    try {
        // Check apakah part ada
        const part = await new Promise((resolve, reject) => {
            db.get(
                "SELECT id, code, name, cost_price, sell_price FROM part_types WHERE code = ?",
                [item.code],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!part) {
            console.log(`❌ Part tidak ditemukan: ${item.code}`);
            notFound++;
            continue;
        }

        // Show before/after
        console.log(`\n📝 ${part.name}`);
        console.log(`   Kode: ${item.code}`);
        console.log(`   BEFORE:`);
        console.log(`   - Harga Pokok: Rp ${part.cost_price?.toLocaleString('id-ID') || '0'}`);
        console.log(`   - Harga Jual:  Rp ${part.sell_price?.toLocaleString('id-ID') || '0'}`);
        console.log(`   AFTER:`);
        console.log(`   - Harga Pokok: Rp ${item.cost_price?.toLocaleString('id-ID')}`);
        console.log(`   - Harga Jual:  Rp ${item.sell_price?.toLocaleString('id-ID')}`);
        if (item.note) {
            console.log(`   📌 ${item.note}`);
        }

        // Update part_types (master data)
        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE part_types SET cost_price = ?, sell_price = ? WHERE code = ?",
                [item.cost_price, item.sell_price, item.code],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });

        // Update inventory (hanya harga, TIDAK mengubah stok!)
        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE inventory SET price = ? WHERE id = ?",
                [item.sell_price, item.code],
                function (err) {
                    if (err) {
                        // Ignore error jika item belum ada di inventory
                        console.log(`   ⚠️  Inventory belum ada (OK, nanti akan sync)`);
                    }
                    resolve();
                }
            );
        });

        console.log(`   ✅ Updated!`);
        updated++;

    } catch (error) {
        console.error(`❌ Error updating ${item.code}:`, error.message);
        errors++;
    }
}

console.log('\n');
console.log('===========================================');
console.log('  UPDATE COMPLETE!');
console.log('===========================================');
console.log('');
console.log(`✅ Updated: ${updated} items`);
console.log(`❌ Not found: ${notFound} items`);
if (errors > 0) {
    console.log(`⚠️  Errors: ${errors} items`);
}
console.log('');
console.log('📌 CATATAN:');
console.log('   - Harga sudah diupdate di part_types & inventory');
console.log('   - Stok TIDAK berubah (tetap aman)');
console.log('   - Refresh halaman untuk lihat perubahan');
console.log('');

db.close();
