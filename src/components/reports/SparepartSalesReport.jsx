import React, { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import { api } from '../../services/api';

export default function SparepartSalesReport() {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [startDate, endDate, selectedCategory]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [queue, sales] = await Promise.all([
                api.getQueue(),
                api.getSales()
            ]);

            const { startDate: start, endDate: end } = { startDate, endDate };

            // Filter by date
            const salesFiltered = sales.filter(s => {
                const sDate = new Date(s.date).toISOString().split('T')[0];
                return sDate >= start && sDate <= end;
            });

            // Collect all parts with category
            const allParts = [];
            const categorySet = new Set();

            // From sales
            salesFiltered.forEach(sale => {
                const items = sale.items_detail_parsed || [];
                if (items.length > 0) {
                    items.forEach(item => {
                        const category = item.category || 'Lainnya';
                        categorySet.add(category);
                        allParts.push({
                            code: item.id || 'UNKNOWN',
                            name: item.name || 'Unknown',
                            category: category,
                            qty: item.q || 0,
                            revenue: (item.price || 0) * (item.q || 0),
                            source: 'direct_sale'
                        });
                    });
                } else {
                    categorySet.add('Lainnya');
                    allParts.push({
                        code: 'MIXED',
                        name: `Penjualan ${sale.buyer}`,
                        category: 'Lainnya',
                        qty: sale.items || 1,
                        revenue: sale.total || 0,
                        source: 'fallback'
                    });
                }
            });

            // From services
            const queueFiltered = queue.filter(q => {
                const qDate = new Date(q.date).toISOString().split('T')[0];
                return qDate >= start && qDate <= end && (q.status === 'Done' || q.status === 'Paid');
            });

            queueFiltered.forEach(service => {
                try {
                    const items = typeof service.items === 'string' ? JSON.parse(service.items) : service.items;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            if (item.type && item.type.toLowerCase() === 'part') {
                                const category = item.category || 'Lainnya';
                                categorySet.add(category);
                                allParts.push({
                                    code: item.id || item.code,
                                    name: item.name,
                                    category: category,
                                    qty: item.q || 0,
                                    revenue: (item.price || 0) * (item.q || 0),
                                    source: 'service'
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing service items:', e);
                }
            });

            // Set categories
            setCategories(['all', ...Array.from(categorySet).sort()]);

            // Filter by category
            const filteredByCategory = selectedCategory === 'all'
                ? allParts
                : allParts.filter(p => p.category === selectedCategory);

            // Group by code
            const grouped = filteredByCategory.reduce((acc, part) => {
                const code = part.code || 'UNKNOWN';
                if (!acc[code]) {
                    acc[code] = {
                        code,
                        name: part.name,
                        category: part.category,
                        totalQty: 0,
                        totalRevenue: 0,
                        transactions: 0
                    };
                }
                acc[code].totalQty += part.qty;
                acc[code].totalRevenue += part.revenue;
                acc[code].transactions += 1;
                return acc;
            }, {});

            const result = Object.values(grouped).sort((a, b) => b.totalRevenue - a.totalRevenue);
            setData(result);
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalQty = data.reduce((sum, item) => sum + item.totalQty, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

    const handleExport = () => {
        // Create Excel-compatible HTML
        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #4472C4; color: white; font-weight: bold; }
                    .total { background-color: #D9E1F2; font-weight: bold; }
                    .right { text-align: right; }
                    .center { text-align: center; }
                    .header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                    .info { text-align: center; margin-bottom: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">LAPORAN PENJUALAN SPAREPART</div>
                <div class="info">
                    Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
                    Kategori: ${selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Kode</th>
                            <th>Nama Sparepart</th>
                            <th>Kategori</th>
                            <th class="center">Qty Terjual</th>
                            <th class="center">Transaksi</th>
                            <th class="right">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, i) => `
                            <tr>
                                <td class="center">${i + 1}</td>
                                <td>${item.code}</td>
                                <td>${item.name}</td>
                                <td>${item.category}</td>
                                <td class="center">${item.totalQty}</td>
                                <td class="center">${item.transactions}</td>
                                <td class="right">${item.totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="4">TOTAL</td>
                            <td class="center">${totalQty}</td>
                            <td class="center">${totalTransactions}</td>
                            <td class="right">${totalRevenue.toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Diekspor: ${new Date().toLocaleString('id-ID')}
                </p>
            </body>
            </html>
        `;

        // Download as Excel file
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Sparepart_${startDate}_${endDate}.xls`;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const html = `
            <html>
            <head>
                <title>Laporan Penjualan Sparepart</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; margin-bottom: 10px; }
                    .info { text-align: center; margin-bottom: 30px; color: #666; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .total { font-weight: bold; background-color: #f9f9f9; }
                    .right { text-align: right; }
                    .center { text-align: center; }
                </style>
            </head>
            <body>
                <h1>LAPORAN PENJUALAN SPAREPART</h1>
                <div class="info">
                    Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
                    Kategori: ${selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Kode</th>
                            <th>Nama Sparepart</th>
                            <th>Kategori</th>
                            <th class="center">Qty</th>
                            <th class="center">Transaksi</th>
                            <th class="right">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, i) => `
                            <tr>
                                <td class="center">${i + 1}</td>
                                <td>${item.code}</td>
                                <td>${item.name}</td>
                                <td>${item.category}</td>
                                <td class="center">${item.totalQty}</td>
                                <td class="center">${item.transactions}</td>
                                <td class="right">Rp ${item.totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="4">TOTAL</td>
                            <td class="center">${totalQty}</td>
                            <td class="center">${totalTransactions}</td>
                            <td class="right">Rp ${totalRevenue.toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="text-align: right; margin-top: 50px;">Dicetak: ${new Date().toLocaleString('id-ID')}</p>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div>
            {/* Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dari:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sampai:</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Kategori:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input"
                            style={{ minWidth: '150px' }}
                        >
                            <option value="all">Semua Kategori</option>
                            <option value="HGP">HGP</option>
                            <option value="non HGP">non HGP</option>
                            <option value="Oli">Oli</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success" onClick={handleExport}>
                        <Download size={18} /> Export Excel
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <Printer size={18} /> Cetak
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--success) 0%, #16a34a 100%)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Pendapatan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                        Rp {totalRevenue.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Qty</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalQty}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transaksi</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalTransactions}</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>
                    Detail Sparepart Terjual
                    {selectedCategory !== 'all' && <span style={{ color: 'var(--primary)', fontWeight: 'normal', fontSize: '0.9rem' }}> - {selectedCategory}</span>}
                </h3>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat...</p>
                ) : data.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Tidak ada data</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kode</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kategori</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Transaksi</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.code}</td>
                                    <td style={{ padding: '0.75rem' }}>{item.name}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            backgroundColor: 'var(--bg-hover)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{item.totalQty}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.transactions}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                        Rp {item.totalRevenue.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ backgroundColor: 'var(--bg-hover)', fontWeight: 'bold' }}>
                                <td colSpan="3" style={{ padding: '0.75rem' }}>TOTAL</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{totalQty}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{totalTransactions}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>Rp {totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
