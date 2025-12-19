export const formatSPK = (service, settings = {}) => {
    // COMPACT FORMAT FOR K2 - REVISED V4
    // Width standardized to 72 chars for safe Dot Matrix printing

    // Helper to pad strings
    const pad = (str, len) => (str + ' '.repeat(len)).slice(0, len);
    const padL = (str, len) => (' '.repeat(len) + str).slice(-len);
    const center = (str, len) => {
        const padding = Math.max(0, len - str.length) / 2;
        return ' '.repeat(Math.floor(padding)) + str + ' '.repeat(Math.ceil(padding));
    };

    const width = 78; // Increased to fill right space
    const line = '-'.repeat(width);
    const newline = '\n';

    const jasaItems = service.items.filter(i => i.type === 'Service') || [];
    const partItems = service.items.filter(i => i.type === 'Part') || [];

    const totalJasa = jasaItems.reduce((s, x) => s + ((x.price - (x.discount || 0)) * x.q), 0);
    const totalPart = partItems.reduce((s, x) => s + ((x.price - (x.discount || 0)) * x.q), 0);
    const total = totalJasa + totalPart;
    // Calculate Total Discount for "Hemat" info
    const totalDiscount = [...jasaItems, ...partItems].reduce((s, x) => s + ((x.discount || 0) * x.q), 0);

    // --- START PRINT ---
    let txt = '';

    // Header
    const headerTitle = (settings.workshopName || 'BENGKEL MOTOR').toUpperCase();
    txt += center(headerTitle, width) + newline;

    let subHeader = settings.workshopAddress || '';
    if (settings.workshopPhone) subHeader += ` | ${settings.workshopPhone}`;
    txt += center(subHeader.substring(0, width), width) + newline;

    txt += line + newline;

    // HIGHLIGHTED QUEUE NUMBER
    txt += center(`*** No Antrian: #${service.queueNumber} ***`, width) + newline;
    txt += center(new Date(service.date).toLocaleDateString('id-ID') + ' ' + (service.entryTime || '').substring(0, 5), width) + newline;
    txt += line + newline;

    // Cust Info - Stacked pairs
    // Width 78 -> Left 38 + Gap 2 + Right 38
    const cw = 38;
    const row1A = pad(`NAMA : ${service.customerName.substring(0, 28)}`, cw);
    const row1B = pad(`MOTOR: ${service.bikeModel.substring(0, 28)}`, cw);
    txt += row1A + "  " + row1B + newline;

    const row2A = pad(`NOPOL: ${service.plateNumber}`, cw);
    const row2B = pad(service.phoneNumber ? `TELP : ${service.phoneNumber}` : '', cw);
    txt += row2A + "  " + row2B + newline;

    if (service.complaint) {
        txt += line + newline;
        txt += `KELUHAN: ${service.complaint.substring(0, 76)}` + newline;
    }

    txt += line + newline;

    // ULTRA COMPACT SEQUENTIAL V5 (No Prices)
    // Jasa: Name Only (Include "Hemat" text if applicable)
    // Part: Name + Qty (Include "Hemat" text if applicable)

    // --- JASA SECTION ---
    if (jasaItems.length > 0) {
        txt += "[ JASA / SERVIS ]" + newline;
        jasaItems.forEach(item => {
            let name = item.name.substring(0, width);
            if (item.isFreeVoucher) name += " (FREE)";
            if (item.discount > 0) name += ` (Hemat ${item.discount.toLocaleString()})`;
            txt += name + newline;
        });
    }

    // --- PART SECTION ---
    if (partItems.length > 0) {
        if (jasaItems.length > 0) txt += newline;
        txt += "[ SPAREPART ]" + newline;

        // Column: Name(70) | Qty(8) = 78
        const wPName = 70;
        const wPQty = 8;

        partItems.forEach(item => {
            let name = item.name;
            if (item.isFreeVoucher) name += " (FREE)";
            if (item.discount > 0) name += ` (Hemat ${item.discount.toLocaleString()})`;

            txt += pad(name.substring(0, wPName), wPName) + padL(item.q.toString(), wPQty) + newline;
        });
    }

    txt += line + newline;

    if (totalDiscount > 0) {
        let msg = `Anda dapat potongan Rp ${totalDiscount.toLocaleString()} Total Estimasi menjadi Rp ${total.toLocaleString()}`;
        // Add stars
        msg = `*** ${msg} ***`;

        if (msg.length > width) {
            // Fallback if too long: Split it to avoid truncation
            txt += padL(`*** Anda dapat potongan Rp ${totalDiscount.toLocaleString()} ***`, width) + newline;
            txt += padL(`*** Total Estimasi menjadi Rp ${total.toLocaleString()} ***`, width) + newline;
        } else {
            txt += padL(msg, width) + newline;
        }
    } else {
        txt += padL(`*** TOTAL ESTIMASI: Rp ${total.toLocaleString()} ***`, width) + newline;
    }

    txt += line + newline;

    // Compact Signatures (Reduced spacing)
    txt += newline;
    // Left: Mekanik : (strictly left aligned)
    txt += "Mekanik :" + newline;
    txt += newline.repeat(3); // Space for signing

    // Eject
    txt += '\x0C';

    return txt;
};

export const formatInvoice = (service, settings = {}, mechanicName = '-') => {
    // 80 Char Width
    const pad = (str, len) => (str + ' '.repeat(len)).slice(0, len);
    const padL = (str, len) => (' '.repeat(len) + str).slice(-len);
    const center = (str, len) => {
        const padding = Math.max(0, len - str.length) / 2;
        return ' '.repeat(Math.floor(padding)) + str + ' '.repeat(Math.ceil(padding));
    };

    const width = 78; // Reduced from 80 to match SPK and prevent cut-off
    const line = '-'.repeat(width);
    const newline = '\n';

    // Calculate Totals matching HTML Logic (Exclude Free Items from Gross/Disc)
    const allItems = service.items || [];
    const validJasa = allItems.filter(i => i.type === 'Service' && !i.isFreeVoucher);
    const validPart = allItems.filter(i => i.type === 'Part' && !i.isFreeVoucher);

    // Gross: Price * Qty (Ignoring Discount for now)
    const grossJasa = validJasa.reduce((s, x) => s + (x.price * x.q), 0);
    const grossPart = validPart.reduce((s, x) => s + (x.price * x.q), 0);

    // Total Discount (Only from non-free items)
    const totalDisc = [...validJasa, ...validPart].reduce((s, x) => s + ((x.discount || 0) * x.q), 0);

    const grandTotal = grossJasa + grossPart - totalDisc;

    let txt = ''; // Removed leading newlines to reduce top margin

    txt += center((settings.workshopName || 'BENGKEL MOTOR').toUpperCase(), width) + newline;

    let subHeader = settings.workshopAddress || '';
    if (settings.workshopPhone) subHeader += ` | ${settings.workshopPhone}`;
    txt += center(subHeader, width) + newline;

    txt += line + newline;

    // Metadata Consolidated
    const r1Left = `No. Inv : INV-${service.id}`;
    const r1Right = `Kepada Yth: ${service.customerName.toUpperCase().substring(0, 25)}`;

    const r2Left = `Tgl     : ${new Date(service.payment_date || service.date).toLocaleDateString('id-ID')}`;
    const r2Right = `Motor     : ${service.bikeModel.substring(0, 15)} / ${service.plateNumber}`;

    txt += pad(r1Left, 40) + r1Right + newline;
    txt += pad(r2Left, 40) + r2Right + newline;
    txt += line + newline;

    // Table Header
    txt += pad("KETERANGAN", 43) + padL("QTY", 5) + padL("HARGA", 15) + padL("TOTAL", 15) + newline;
    txt += line + newline;

    const renderItem = (item) => {
        const isFree = item.isFreeVoucher;
        let name = item.name.substring(0, 41); // Reduced substring limit
        if (isFree) name += " [GRATIS]";

        const price = isFree ? 0 : item.price;
        // Total row displays (Price * Qty) - displayed normally, discount shown below
        // HTML logic: Row displays (Price * Qty). Discount row below.
        const rowTotal = price * item.q;

        let res = pad(name, 43) + padL(item.q.toString(), 5) + padL(price.toLocaleString(), 15) + padL(rowTotal.toLocaleString(), 15) + newline;

        if (item.discount > 0 && !isFree) {
            const discVal = item.discount * item.q;
            res += pad(`  (Disc: ${item.discount.toLocaleString()})`, 65) + padL(`-${discVal.toLocaleString()}`, 15) + newline;
        }
        return res;
    };

    // JASA Section
    const jasaList = allItems.filter(i => i.type === 'Service');
    if (jasaList.length > 0) {
        txt += "[ JASA ]" + newline;
        jasaList.forEach(item => txt += renderItem(item));
        txt += newline;
    }

    // PART Section
    const partList = allItems.filter(i => i.type === 'Part');
    if (partList.length > 0) {
        txt += "[ SPAREPART ]" + newline;
        partList.forEach(item => txt += renderItem(item));
        txt += newline;
    }

    txt += line + newline;

    // Totals Breakdown
    if (grossJasa > 0) {
        txt += pad("Total Jasa", 58) + padL("Rp " + grossJasa.toLocaleString(), 20) + newline;
    }
    if (grossPart > 0) {
        txt += pad("Total Sparepart", 58) + padL("Rp " + grossPart.toLocaleString(), 20) + newline;
    }
    if (totalDisc > 0) {
        txt += pad("Total Potongan/Diskon", 58) + padL("-Rp " + totalDisc.toLocaleString(), 20) + newline;
    }

    txt += line + newline;
    txt += pad("TOTAL BAYAR", 53) + padL("RP " + grandTotal.toLocaleString(), 25) + newline;
    txt += line + newline;

    txt += center(settings.workshopMotto || 'Terima Kasih atas Kepercayaan Anda', width) + newline;
    txt += newline;

    // Signature - Swapped & Simplified (No Underlines/Parentheses)
    // Left: Mekanik, Right: Hormat Kami
    txt += pad("     Mekanik", 45) + "Hormat Kami" + newline;
    txt += newline.repeat(3);
    // Names
    txt += pad(`     ${mechanicName.substring(0, 25)}`, 45) + "Admin" + newline;

    txt += newline.repeat(4);
    return txt;
};
