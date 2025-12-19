import React, { useState, useEffect } from 'react';
import { Printer, DollarSign, Wrench, Package, Calendar, TrendingDown, Wallet } from 'lucide-react';
import { api } from '../../services/api';

export default function RevenueReport() {
    // Helper to formatting local date YYYY-MM-DD safely
    const toLocalYMD = (d = new Date()) => {
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    };

    const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
    const [selectedDate, setSelectedDate] = useState(toLocalYMD());
    const [data, setData] = useState({
        services: [],
        sales: [],
        expenses: [],
        grossRevenue: 0,
        voucherDiscount: 0,
        netRevenue: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalServices: 0,
        totalSales: 0,
        totalSparepartRevenue: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [period, selectedDate]);

    const getDateRange = () => {
        const date = new Date(selectedDate);
        let startDate, endDate;

        // Helper to formatting local date YYYY-MM-DD safely
        const toLocalYMD = (d) => {
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
        };

        if (period === 'daily') {
            startDate = endDate = selectedDate;
        } else if (period === 'weekly') {
            // Get start of week (Monday)
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);

            const start = new Date(date);
            start.setDate(diff);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            startDate = toLocalYMD(start);
            endDate = toLocalYMD(end);
        } else if (period === 'monthly') {
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            startDate = toLocalYMD(start);
            endDate = toLocalYMD(end);
        }

        return { startDate, endDate };
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();

            const [queue, sales, expensesData] = await Promise.all([
                api.getQueue(),
                api.getSales(),
                api.getExpenses({ startDate, endDate })
            ]);

            // Filter by date range - HANYA yang sudah dibayar (Paid)
            // Gunakan payment_date untuk filtering (tanggal pembayaran), fallback ke date jika payment_date kosong
            const servicesInRange = queue.filter(q => {
                const qDate = (q.payment_date || q.date || '').split('T')[0].split(' ')[0];
                return qDate >= startDate && qDate <= endDate && q.status === 'Paid';
            });

            const salesInRange = sales.filter(s => {
                const sDate = s.date ? s.date.split('T')[0].split(' ')[0] : '';
                return sDate >= startDate && sDate <= endDate;
            });

            // Calculate totals - NEW LOGIC:
            // 1. Gross Revenue = semua item (termasuk gratis pakai originalPrice)
            // 2. Voucher Discount = total nilai item gratis
            // 3. Net Revenue = Gross - Voucher Discount

            let grossServiceRevenue = 0;
            let voucherDiscount = 0;

            servicesInRange.forEach(s => {
                try {
                    const items = typeof s.items === 'string' ? JSON.parse(s.items) : s.items;
                    if (!Array.isArray(items)) return;

                    items.forEach(item => {
                        if (item.isFreeVoucher && item.originalPrice) {
                            // Item gratis: tambah ke gross, tambah ke voucher discount
                            const voucherValue = item.originalPrice * (item.q || 0);
                            grossServiceRevenue += voucherValue;
                            voucherDiscount += voucherValue;
                        } else {
                            // Item normal: tambah ke gross saja
                            const price = item.price || 0;
                            const discount = item.discount || 0;
                            const quantity = item.q || 0;
                            grossServiceRevenue += ((price - discount) * quantity);
                        }
                    });
                } catch (e) {
                    console.error('Failed to parse service items:', e);
                }
            });

            const salesRevenue = salesInRange.reduce((sum, s) => sum + (s.total || 0), 0);

            // Calculate Total Expenses
            const totalExpenses = Array.isArray(expensesData)
                ? expensesData.reduce((sum, e) => sum + (e.amount || 0), 0)
                : 0;

            const grossRevenue = grossServiceRevenue + salesRevenue;
            const netRevenue = grossRevenue - voucherDiscount;
            const netProfit = netRevenue - totalExpenses;

            // Combine sales from direct sales and spareparts used in services (for detail view only, not gross calc)
            const directSales = salesInRange.map(s => {
                // Use pre-parsed items from backend
                const items = s.items_detail_parsed || [];
                return {
                    ...s,
                    items: JSON.stringify(items), // Convert back to string for consistency
                    total_price: s.total,
                    source: 'direct',
                    date: s.date || s.created_at
                };
            });

            // Extract spareparts from services
            const serviceSales = [];
            servicesInRange.forEach(service => {
                try {
                    const items = typeof service.items === 'string' ? JSON.parse(service.items) : service.items;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            // Check for both 'part' and 'Part' (case-insensitive)
                            if (item.type && item.type.toLowerCase() === 'part') {
                                // Hitung total_price: untuk item gratis = 0 (tidak dihitung), untuk normal gunakan (price - discount)
                                let totalPrice;
                                if (item.isFreeVoucher) {
                                    totalPrice = 0; // Item gratis tidak dihitung dalam pendapatan
                                } else {
                                    const price = item.price || 0;
                                    const discount = item.discount || 0;
                                    totalPrice = (price - discount) * (item.q || 0);
                                }

                                serviceSales.push({
                                    date: service.date,
                                    items: JSON.stringify([item]),
                                    total_price: totalPrice,
                                    source: 'service',
                                    queueNumber: service.queueNumber,
                                    customerName: service.customerName
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Failed to parse service items:', e);
                }
            });

            // Combine and sort by date
            const allSales = [...directSales, ...serviceSales].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            // Calculate total sparepart revenue
            const totalSparepartRevenue = allSales.reduce((sum, s) => sum + (s.total_price || 0), 0);

            setData({
                services: servicesInRange,
                sales: allSales,
                expenses: expensesData,
                grossRevenue,
                voucherDiscount,
                netRevenue,
                totalRevenue: netRevenue, // For backward compatibility
                totalExpenses,
                netProfit,
                totalServices: servicesInRange.length,
                totalSales: directSales.length + serviceSales.length,
                totalSparepartRevenue: totalSparepartRevenue
            });
        } catch (error) {
            console.error('Failed to load revenue report:', error);
            alert('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    // Aggregate Sales Data Helper
    const aggregatedSales = React.useMemo(() => {
        const itemMap = {};
        data.sales.forEach(sale => {
            let items = [];
            try {
                items = sale.items ? (typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items) : [];
                if (!Array.isArray(items)) items = [];
            } catch (e) { console.error(e); }

            items.forEach(item => {
                const name = item.name || 'Unknown Item';
                if (!itemMap[name]) {
                    itemMap[name] = { name, qty: 0, total: 0 };
                }
                itemMap[name].qty += (item.q || 0);

                // Hitung total value (gunakan originalPrice untuk item gratis agar muncul nilainya di tabel)
                let itemTotal;
                if (item.isFreeVoucher) {
                    // Use originalPrice (or price if originalPrice not set) for free items
                    itemTotal = (item.originalPrice || item.price || 0) * (item.q || 0);
                } else {
                    const price = item.price || 0;
                    const discount = item.discount || 0;
                    itemTotal = (price - discount) * (item.q || 0);
                }
                itemMap[name].total += itemTotal;
            });
        });
        return Object.values(itemMap).sort((a, b) => b.qty - a.qty);
    }, [data.sales]);

    const aggregatedServices = React.useMemo(() => {
        const serviceMap = {};
        data.services.forEach(service => {
            let items = [];
            try {
                items = typeof service.items === 'string' ? JSON.parse(service.items) : service.items;
                if (!Array.isArray(items)) items = [];
            } catch (e) { console.error(e); }

            items.forEach(item => {
                // Only process Service type items
                if (item.type && item.type.toLowerCase() === 'service') {
                    const name = item.name || 'Unknown Service';
                    if (!serviceMap[name]) {
                        serviceMap[name] = { name, count: 0, total: 0 };
                    }
                    serviceMap[name].count += (item.q || 1); // Count occurrences

                    // Calculate total value (use originalPrice for free vouchers to show value in table)
                    let itemTotal;
                    if (item.isFreeVoucher) {
                        // Use originalPrice (or price if originalPrice not set) for free items
                        itemTotal = (item.originalPrice || item.price || 0) * (item.q || 1);
                    } else {
                        const price = item.price || 0;
                        const discount = item.discount || 0;
                        itemTotal = (price - discount) * (item.q || 1);
                    }
                    serviceMap[name].total += itemTotal;
                }
            });
        });
        return Object.values(serviceMap).sort((a, b) => b.count - a.count);
    }, [data.services]);

    // Aggregate Vouchers Data Helper (For Detailed Coupon Breakdown)
    const aggregatedVouchers = React.useMemo(() => {
        const voucherMap = {};
        data.services.forEach(service => {
            let items = [];
            try {
                items = typeof service.items === 'string' ? JSON.parse(service.items) : service.items;
                if (!Array.isArray(items)) items = [];
            } catch (e) { console.error(e); }

            items.forEach(item => {
                if (item.isFreeVoucher) {
                    const name = item.name || 'Unknown Voucher';
                    if (!voucherMap[name]) {
                        voucherMap[name] = { name, count: 0, total: 0 };
                    }
                    // Use q if available, otherwise 1
                    const qty = item.q || 1;
                    voucherMap[name].count += qty;
                    // Calculate value using originalPrice
                    const val = (item.originalPrice || item.price || 0) * qty;
                    voucherMap[name].total += val;
                }
            });
        });
        return Object.values(voucherMap).sort((a, b) => b.total - a.total);
    }, [data.services]);



    const handlePrint = () => {
        const { startDate, endDate } = getDateRange();
        const periodLabel = period === 'daily' ? 'Harian' : period === 'weekly' ? 'Mingguan' : 'Bulanan';
        const dateLabel = period === 'daily'
            ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;

        const printWindow = window.open('', '_blank');
        const html = `
            <html>
            <head>
                <title>Laporan ${periodLabel} - ${dateLabel}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; margin-bottom: 10px; }
                    .period { text-align: center; margin-bottom: 30px; color: #666; }
                    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                    .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
                    .summary-card .value { font-size: 24px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; background-color: #f9f9f9; }
                    @media print { @page { margin: 1cm; } }
                </style>
            </head>
            <body>
                <h1>LAPORAN ${periodLabel.toUpperCase()}</h1>
                <div class="period">${dateLabel}</div>
                
                <div class="summary">
                    <div class="summary-card">
                        <h3>Penjualan</h3>
                        <div class="value">Rp ${data.grossRevenue.toLocaleString('id-ID')}</div>
                    </div>
                    ${data.voucherDiscount > 0 ? `
                    <div class="summary-card">
                        <h3>Potongan Kupon</h3>
                        <div class="value" style="color: orange;">Rp ${data.voucherDiscount.toLocaleString('id-ID')}</div>
                    </div>
                    ` : ''}
                    <div class="summary-card">
                        <h3>Total</h3>
                        <div class="value" style="color: green;">Rp ${data.netRevenue.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Pengeluaran</h3>
                        <div class="value" style="color: red;">Rp ${data.totalExpenses.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Laba Bersih</h3>
                        <div class="value" style="color: ${data.netProfit >= 0 ? 'green' : 'red'};">Rp ${data.netProfit.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Total Servis</h3>
                        <div class="value">${data.totalServices} Unit</div>
                    </div>
                    <div class="summary-card">
                        <h3>Item Sparepart Terjual</h3>
                        <div class="value">${aggregatedSales.reduce((sum, i) => sum + i.qty, 0)} Pcs</div>
                    </div>
                </div>



                <h2>Detail Jasa Servis</h2>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Jenis Jasa</th>
                            <th style="text-align: center;">Jumlah</th>
                            <th style="text-align: right;">Total Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aggregatedServices.map((s, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${s.name}</td>
                                <td style="text-align: center;">${s.count}</td>
                                <td style="text-align: right;">Rp ${s.total.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="2">TOTAL</td>
                            <td style="text-align: center;">${aggregatedServices.reduce((sum, s) => sum + s.count, 0)}</td>
                            <td style="text-align: right;">Rp ${aggregatedServices.reduce((sum, s) => sum + s.total, 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                ${aggregatedVouchers.length > 0 ? `
                <h2>Rincian Potongan Kupon</h2>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Kupon / Item</th>
                            <th style="text-align: center;">Jumlah</th>
                            <th style="text-align: right;">Total Potongan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aggregatedVouchers.map((v, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${v.name}</td>
                                <td style="text-align: center;">${v.count}</td>
                                <td style="text-align: right;">Rp ${v.total.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="2">TOTAL POTONGAN</td>
                            <td style="text-align: center;">${aggregatedVouchers.reduce((sum, v) => sum + v.count, 0)}</td>
                            <td style="text-align: right;">Rp ${aggregatedVouchers.reduce((sum, v) => sum + v.total, 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>
                ` : ''}

                <h2>Ringkasan Penjualan Sparepart</h2>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Sparepart</th>
                            <th style="text-align: center;">Terjual</th>
                            <th style="text-align: right;">Total Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aggregatedSales.map((item, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${item.name}</td>
                                <td style="text-align: center;">${item.qty}</td>
                                <td style="text-align: right;">Rp ${item.total.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="2">TOTAL</td>
                            <td style="text-align: center;">${aggregatedSales.reduce((sum, i) => sum + i.qty, 0)}</td>
                            <td style="text-align: right;">Rp ${aggregatedSales.reduce((sum, i) => sum + i.total, 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                <h2>Detail Pengeluaran</h2>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tanggal</th>
                            <th>Kategori</th>
                            <th>Deskripsi</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.expenses.map((e, i) => `
                            <tr>
                                <td style="text-align: center;">${i + 1}</td>
                                <td>${new Date(e.date).toLocaleDateString('id-ID')}</td>
                                <td>${e.category}</td>
                                <td>${e.description} ${e.notes ? `(${e.notes})` : ''}</td>
                                <td style="text-align: right;">Rp ${(e.amount || 0).toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="4">TOTAL PENGELUARAN</td>
                            <td style="text-align: right;">Rp ${data.totalExpenses.toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 50px; text-align: right;">
                    <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    const { startDate, endDate } = getDateRange();

    const handleExportPreview = () => {
        const previewWindow = window.open('', '_blank');
        if (!previewWindow) {
            alert('Popup blocked! Please allow popups for this site.');
            return;
        }

        const htmlContent = `
            <html>
            <head>
                <title>Preview Laporan Excel - ${period.toUpperCase()}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h2 { margin-top: 0; color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; font-size: clamp(1.2rem, 4vw, 1.5rem); }
                    p { color: #666; font-size: clamp(0.9rem, 3vw, 1rem); }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: clamp(0.75rem, 2.5vw, 0.875rem); }
                    th, td { border: 1px solid #ccc; padding: clamp(6px, 2vw, 8px); text-align: left; }
                    th { background-color: #f0f9ff; font-weight: bold; }
                    .header-section { margin-bottom: 30px; }
                    .summary-table { width: 100%; max-width: 500px; margin-bottom: 30px; }
                    .summary-table td:first-child { font-weight: bold; width: 60%; }
                    .amount { text-align: right; font-family: 'Courier New', monospace; }
                    .section-title { margin-top: 30px; font-size: clamp(1rem, 3.5vw, 1.125rem); font-weight: bold; color: #444; border-left: 4px solid #0ea5e9; padding-left: 10px; }
                    .actions { position: sticky; top: 0; background: #fff; padding: 15px 0; border-bottom: 1px solid #ddd; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 100; flex-wrap: wrap; gap: 10px; }
                    .btn { padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px); border-radius: 4px; border: none; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; text-decoration: none; font-size: clamp(0.8rem, 2.5vw, 0.9rem); }
                    .btn-primary { background-color: #0ea5e9; color: white; }
                    .btn-secondary { background-color: #e2e8f0; color: #333; }
                    .success { color: green; }
                    .danger { color: red; }
                    /* Excel-specific generic styles */
                    .xl-text { mso-number-format:"\\@"; } 
                    .xl-num { mso-number-format:"0"; }
                    
                    /* Mobile Responsive */
                    @media (max-width: 768px) {
                        body { padding: 10px; }
                        .container { padding: 15px; border-radius: 4px; }
                        h2 { font-size: 1.2rem; }
                        .section-title { font-size: 1rem; margin-top: 20px; }
                        table { font-size: 0.75rem; }
                        th, td { padding: 6px 4px; }
                        .summary-table { width: 100%; }
                        .actions { padding: 10px 0; }
                        .btn { padding: 8px 12px; font-size: 0.8rem; }
                        /* Stack buttons on mobile */
                        .actions > div { display: flex; flex-direction: column; gap: 8px; width: 100%; }
                        .actions > div .btn { width: 100%; justify-content: center; }
                    }
                    
                    @media (max-width: 480px) {
                        body { padding: 5px; }
                        .container { padding: 10px; }
                        h2 { font-size: 1rem; }
                        table { font-size: 0.7rem; }
                        th, td { padding: 4px 2px; }
                        .amount { font-size: 0.7rem; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="actions">
                        <span style="font-weight: bold; color: #666;">Preview Laporan</span>
                        <div>
                            <button onclick="window.close()" class="btn btn-secondary">Tutup Preview</button>
                            <button onclick="downloadExcel()" class="btn btn-primary" style="margin-left: 10px;">Download Laporan (HTML)</button>
                        </div>
                    </div>

                    <div id="report-content">
                        <h2>LAPORAN PENDAPATAN</h2>
                        <p>Periode: ${period.toUpperCase()} (${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')})</p>

                        <div class="section-title">RINGKASAN KEUANGAN</div>
                        <table class="summary-table">
                            <tr><td>Penjualan</td><td class="amount">Rp ${data.grossRevenue.toLocaleString('id-ID')}</td></tr>
                            ${data.voucherDiscount > 0 ? `<tr><td>Potongan Kupon</td><td class="amount" style="color: #f59e0b;">-Rp ${data.voucherDiscount.toLocaleString('id-ID')}</td></tr>` : ''}
                            <tr style="border-top: 2px solid #0ea5e9;"><td><strong>Total</strong></td><td class="amount success" style="font-weight: bold;">Rp ${data.netRevenue.toLocaleString('id-ID')}</td></tr>
                            <tr><td>Pengeluaran</td><td class="amount danger">Rp ${data.totalExpenses.toLocaleString('id-ID')}</td></tr>
                            <tr style="border-top: 2px solid #059669;"><td><strong>Laba Bersih</strong></td><td class="amount ${data.netProfit >= 0 ? 'success' : 'danger'}" style="font-weight: bold;">Rp ${data.netProfit.toLocaleString('id-ID')}</td></tr>
                            <tr><td>Total Servis</td><td class="amount">${data.totalServices} Unit</td></tr>
                            <tr><td>Item Sparepart Terjual</td><td class="amount">${aggregatedSales.reduce((sum, i) => sum + i.qty, 0)} Pcs</td></tr>
                        </table>



                        <div class="section-title">DETAIL JASA SERVIS</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Jenis Jasa</th>
                                    <th style="text-align: center;">Jumlah</th>
                                    <th style="text-align: right;">Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${aggregatedServices.map(s => `
                                    <tr>
                                        <td>${s.name}</td>
                                        <td style="text-align: center;">${s.count}</td>
                                        <td class="amount">Rp ${s.total.toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                                ${aggregatedServices.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #999;">Tidak ada data servis</td></tr>' : ''}
                                <tr style="background-color: #f1f5f9; font-weight: bold;">
                                    <td>TOTAL</td>
                                    <td style="text-align: center;">${aggregatedServices.reduce((sum, s) => sum + s.count, 0)}</td>
                                    <td class="amount">Rp ${aggregatedServices.reduce((sum, s) => sum + s.total, 0).toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="section-title">RINCIAN POTONGAN KUPON</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Kupon / Item</th>
                                    <th style="text-align: center;">Jumlah</th>
                                    <th style="text-align: right;">Total Potongan</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${aggregatedVouchers.map(v => `
                                    <tr>
                                        <td>${v.name}</td>
                                        <td style="text-align: center;">${v.count}</td>
                                        <td class="amount">Rp ${v.total.toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                                ${aggregatedVouchers.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #999;">Tidak ada potongan kupon</td></tr>' : ''}
                                <tr style="background-color: #f1f5f9; font-weight: bold;">
                                    <td>TOTAL POTONGAN</td>
                                    <td style="text-align: center;">${aggregatedVouchers.reduce((sum, v) => sum + v.count, 0)}</td>
                                    <td class="amount">Rp ${aggregatedVouchers.reduce((sum, v) => sum + v.total, 0).toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="section-title">RINGKASAN PENJUALAN SPAREPART</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Sparepart</th>
                                    <th style="text-align: center;">Terjual</th>
                                    <th style="text-align: right;">Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${aggregatedSales.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td style="text-align: center;" class="xl-num">${item.qty}</td>
                                        <td class="amount">Rp ${item.total.toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                                ${aggregatedSales.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #999;">Tidak ada data penjualan</td></tr>' : ''}
                                <tr style="background-color: #f1f5f9; font-weight: bold;">
                                    <td>TOTAL</td>
                                    <td style="text-align: center;" class="xl-num">${aggregatedSales.reduce((sum, i) => sum + i.qty, 0)}</td>
                                    <td class="amount">Rp ${aggregatedSales.reduce((sum, i) => sum + i.total, 0).toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="section-title">DETAIL PENGELUARAN</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Kategori</th>
                                    <th>Deskripsi</th>
                                    <th>Catatan</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.expenses.map(e => `
                                    <tr>
                                        <td>${new Date(e.date).toLocaleDateString('id-ID')}</td>
                                        <td>${e.category}</td>
                                        <td>${e.description}</td>
                                        <td>${e.notes || '-'}</td>
                                        <td class="amount danger">Rp ${(e.amount || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                                ${data.expenses.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: #999;">Tidak ada data pengeluaran</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>

                <script>
                    function downloadExcel() {
                        const content = document.getElementById('report-content').innerHTML;
                        const template = \`
                            <!DOCTYPE html>
                            <html lang="id">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Laporan Pendapatan - ${new Date().toLocaleDateString('id-ID')}</title>
                                <style>
                                    /* Base styles */
                                    * {
                                        margin: 0;
                                        padding: 0;
                                        box-sizing: border-box;
                                    }
                                    
                                    body { 
                                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                                        padding: 20px;
                                        background-color: #f4f4f4;
                                        font-size: 14px;
                                        line-height: 1.6;
                                    }
                                    
                                    .container {
                                        max-width: 1000px;
                                        margin: 0 auto;
                                        background: white;
                                        padding: 30px;
                                        border-radius: 8px;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    }
                                    
                                    h2 { 
                                        color: #333; 
                                        border-bottom: 3px solid #0ea5e9; 
                                        padding-bottom: 10px;
                                        margin-bottom: 15px;
                                        font-size: 24px;
                                    }
                                    
                                    p { 
                                        color: #666; 
                                        margin: 8px 0;
                                        font-size: 14px;
                                    }
                                    
                                    /* Table styles */
                                    table { 
                                        border-collapse: collapse; 
                                        width: 100%; 
                                        margin: 15px 0;
                                        font-size: 13px;
                                        background: white;
                                    }
                                    
                                    td, th { 
                                        border: 1px solid #ddd; 
                                        padding: 10px 8px; 
                                        vertical-align: top;
                                    }
                                    
                                    th { 
                                        background-color: #0ea5e9; 
                                        color: white;
                                        font-weight: 600;
                                        text-align: left;
                                    }
                                    
                                    tr:nth-child(even) {
                                        background-color: #f9fafb;
                                    }
                                    
                                    tr:hover {
                                        background-color: #f0f9ff;
                                    }
                                    
                                    .amount { 
                                        text-align: right;
                                        font-family: 'Courier New', monospace;
                                        font-weight: 500;
                                    }
                                    
                                    .success { 
                                        color: #059669; 
                                        font-weight: bold; 
                                    }
                                    
                                    .danger { 
                                        color: #dc2626; 
                                    }
                                    
                                    .section-title { 
                                        margin-top: 25px; 
                                        margin-bottom: 10px;
                                        font-size: 18px; 
                                        font-weight: bold; 
                                        color: #1f2937; 
                                        border-left: 4px solid #0ea5e9; 
                                        padding-left: 12px; 
                                        background: #f0f9ff;
                                        padding: 8px 12px;
                                        border-radius: 4px;
                                    }
                                    
                                    .summary-table {
                                        width: 100%;
                                        max-width: 500px;
                                        margin-bottom: 20px;
                                    }
                                    
                                    .summary-table td:first-child {
                                        font-weight: 600;
                                        width: 60%;
                                        color: #374151;
                                    }
                                    
                                    .summary-table td:last-child {
                                        font-weight: 600;
                                    }
                                    
                                    /* Print styles */
                                    @media print {
                                        body { 
                                            background: white; 
                                            padding: 0;
                                        }
                                        .container {
                                            box-shadow: none;
                                            padding: 20px;
                                        }
                                        tr:hover {
                                            background-color: transparent;
                                        }
                                    }
                                    
                                    /* Mobile responsive */
                                    @media (max-width: 768px) {
                                        body { 
                                            padding: 10px; 
                                            font-size: 12px;
                                        }
                                        .container {
                                            padding: 15px;
                                            border-radius: 4px;
                                        }
                                        h2 { 
                                            font-size: 18px; 
                                        }
                                        .section-title { 
                                            font-size: 14px; 
                                            margin-top: 15px;
                                        }
                                        table { 
                                            font-size: 11px; 
                                        }
                                        td, th { 
                                            padding: 6px 4px; 
                                        }
                                        .summary-table {
                                            width: 100%;
                                        }
                                    }
                                    
                                    @media (max-width: 480px) {
                                        body { 
                                            padding: 5px; 
                                            font-size: 11px;
                                        }
                                        .container { 
                                            padding: 10px; 
                                        }
                                        h2 { 
                                            font-size: 16px; 
                                        }
                                        table { 
                                            font-size: 10px; 
                                        }
                                        td, th { 
                                            padding: 4px 2px; 
                                        }
                                        .amount { 
                                            font-size: 10px; 
                                        }
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    \${content}
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
                                        <p>Laporan ini dibuat otomatis oleh sistem</p>
                                        <p>Dicetak pada: ${new Date().toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        \`;
                        
                        const blob = new Blob([template], { type: 'text/html;charset=utf-8' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'Laporan_Pendapatan_${new Date().toISOString().slice(0, 10)}.html';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                </script>
            </body>
            </html>
        `;

        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
    };

    return (
        <div>
            {/* Filter Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Period Selector */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                            { value: 'daily', label: 'Harian' },
                            { value: 'weekly', label: 'Mingguan' },
                            { value: 'monthly', label: 'Bulanan' }
                        ].map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius)',
                                    border: period === p.value ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    backgroundColor: period === p.value ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-card)',
                                    color: period === p.value ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: period === p.value ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Picker */}
                    <input
                        type={period === 'monthly' ? "month" : "date"}
                        value={period === 'monthly' ? selectedDate.slice(0, 7) : selectedDate}
                        onChange={(e) => {
                            let val = e.target.value; // YYYY-MM for month, YYYY-MM-DD for date
                            if (period === 'monthly') {
                                val += '-01'; // Append day to make valid date
                            }
                            setSelectedDate(val);
                        }}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-main)'
                        }}
                    />

                    {/* Date Range Display */}
                    {period !== 'daily' && (
                        <div style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--bg-hover)',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)'
                        }}>
                            <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={handleExportPreview} style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-main)' }}>
                        <Package size={18} style={{ marginRight: '0.5rem' }} /> Export HTML
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <Printer size={18} style={{ marginRight: '0.5rem' }} /> Cetak Laporan
                    </button>
                </div>
            </div>





            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>

                {/* 1. PENJUALAN (Gross Revenue) */}
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Penjualan</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                Rp {data.grossRevenue.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <DollarSign size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                </div>

                {/* 2. POTONGAN KUPON (if any) */}
                {data.voucherDiscount > 0 && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Potongan Kupon</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                    Rp {data.voucherDiscount.toLocaleString('id-ID')}
                                </div>
                            </div>
                            <TrendingDown size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        </div>
                    </div>
                )}

                {/* 2. EXPENSES */}
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Pengeluaran</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                Rp {data.totalExpenses.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <TrendingDown size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                </div>

                {/* 3. TOTAL (Net Revenue after Voucher Discount) */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Total</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                Rp {data.netRevenue.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <Wallet size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                </div>

                {/* 4. TOTAL SERVICES */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Servis</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.totalServices}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unit kendaraan</div>
                        </div>
                        <Wrench size={32} style={{ color: 'var(--primary)', opacity: 0.2 }} />
                    </div>
                </div>

                {/* 5. SPAREPART SALES (Replaced old one with simpler count) */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Item Terjual</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{aggregatedSales.reduce((sum, i) => sum + i.qty, 0)}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pcs Sparepart</div>
                        </div>
                        <Package size={32} style={{ color: 'var(--success)', opacity: 0.2 }} />
                    </div>
                </div>

                {/* 6. Sparepart Revenue (Optional breakdown) */}
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Nilai Sparepart</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                Rp {(data.totalSparepartRevenue || 0).toLocaleString('id-ID')}
                            </div>
                        </div>
                        <Package size={24} style={{ color: 'var(--success)', opacity: 0.2 }} />
                    </div>
                </div>
            </div>



            {/* Services Table - Aggregated by Service Name */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Detail Servis</h3>
                {aggregatedServices.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        Belum ada servis yang selesai pada periode ini
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Jenis Jasa</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Jumlah</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aggregatedServices.map((service, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{service.name}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>
                                            {service.count}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                            Rp {service.total.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: 'var(--bg-hover)', borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                                    <td style={{ padding: '0.75rem' }}>TOTAL</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        {aggregatedServices.reduce((sum, s) => sum + s.count, 0)}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        Rp {aggregatedServices.reduce((sum, s) => sum + s.total, 0).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Sales Table Replaced with Aggregated */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Ringkasan Penjualan Sparepart</h3>
                {aggregatedSales.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        Belum ada penjualan sparepart pada periode ini
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama Sparepart</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Terjual</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aggregatedSales.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                            Rp {item.total.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: 'var(--bg-hover)', fontWeight: 'bold' }}>
                                    <td style={{ padding: '0.75rem' }}>TOTAL</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{aggregatedSales.reduce((sum, i) => sum + i.qty, 0)}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        Rp {aggregatedSales.reduce((sum, i) => sum + i.total, 0).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Expenses Table */}

            {/* Expenses Table */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Detail Pengeluaran Operasional</h3>
                {data.expenses.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        Belum ada pengeluaran pada periode ini
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kategori</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Deskripsi</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.expenses.map((expense, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{new Date(expense.date).toLocaleDateString('id-ID')}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--danger)',
                                                fontSize: '0.85rem'
                                            }}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div>{expense.description}</div>
                                            {expense.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expense.notes}</div>}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: 'var(--danger)' }}>
                                            Rp {expense.amount.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
