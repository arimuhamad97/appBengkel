import React, { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import { api } from '../../services/api';

export default function SparepartSalesReport() {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [data, setData] = useState([]);
    const [voucherData, setVoucherData] = useState([]);
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
            const voucherItems = [];
            const categorySet = new Set();

            // From sales
            salesFiltered.forEach(sale => {
                const items = sale.items_detail_parsed || [];
                if (items.length > 0) {
                    items.forEach(item => {
                        const category = item.category || 'Lainnya';
                        categorySet.add(category);
                        const price = item.price || 0;
                        const discount = item.discount || 0;
                        const q = item.q || 0;

                        let revenue;
                        if (item.isFreeVoucher) {
                            revenue = (item.originalPrice || item.price || 0) * q;
                            voucherItems.push({ name: item.name, qty: q, value: revenue, category });
                        } else {
                            revenue = (price - discount) * q;
                        }

                        allParts.push({
                            code: item.id || 'UNKNOWN',
                            name: item.name || 'Unknown',
                            category: category,
                            qty: q,
                            revenue: revenue,
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
                                const price = item.price || 0;
                                const discount = item.discount || 0;
                                const q = item.q || 0;

                                let revenue;
                                if (item.isFreeVoucher) {
                                    revenue = (item.originalPrice || item.price || 0) * q;
                                    voucherItems.push({ name: item.name, qty: q, value: revenue, category });
                                } else {
                                    revenue = (price - discount) * q;
                                }

                                allParts.push({
                                    code: item.id || item.code,
                                    name: item.name,
                                    category: category,
                                    qty: q,
                                    revenue: revenue,
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
                : allParts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

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

            const filteredVouchers = selectedCategory === 'all'
                ? voucherItems
                : voucherItems.filter(v => v.category?.toLowerCase() === selectedCategory.toLowerCase());

            const groupedVouchers = filteredVouchers.reduce((acc, v) => {
                const name = v.name || 'Unknown';
                if (!acc[name]) { acc[name] = { name, count: 0, total: 0 }; }
                acc[name].count += v.qty;
                acc[name].total += v.value;
                return acc;
            }, {});

            const result = Object.values(grouped).sort((a, b) => b.totalRevenue - a.totalRevenue);
            setData(result);
            setVoucherData(Object.values(groupedVouchers).sort((a, b) => b.total - a.total));
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalQty = data.reduce((sum, item) => sum + item.totalQty, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalVoucher = voucherData.reduce((sum, item) => sum + item.total, 0);
    const netRevenue = totalRevenue - totalVoucher;

    const handlePreview = () => {
        const previewWindow = window.open('', '_blank');
        if (!previewWindow) {
            alert('Popup blocked! Please allow popups for this site.');
            return;
        }

        // Clean Content for Report (Export/Print version)
        const reportContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Laporan Penjualan Sparepart</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: white; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #1f2937; font-size: 24px; padding-bottom: 10px; }
                    .info { text-align: center; color: #666; font-size: 14px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                    th, td { border: 1px solid #e5e7eb; padding: 10px 8px; }
                    th { background-color: #0ea5e9; color: white; font-weight: 600; text-align: left; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    
                    .total { font-weight: bold; background-color: #f1f5f9; }
                    .right { text-align: right; }
                    .center { text-align: center; }
                    .amount { font-family: 'Courier New', monospace; font-weight: 600; }
                    
                    .footer { margin-top: 40px; text-align: right; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }

                    @media print {
                        body { padding: 0; }
                        .no-print { display: none !important; }
                        th { background-color: #e5e7eb !important; color: #000 !important; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LAPORAN PENJUALAN SPAREPART</h1>
                    <div class="info">
                        Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
                        Kategori: ${selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                    </div>
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
                            <th class="right">Total Nilai</th>
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
                                <td class="right amount">Rp ${item.totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="4">TOTAL</td>
                            <td class="center">${totalQty}</td>
                            <td class="center">${totalTransactions}</td>
                            <td class="right amount">Rp ${totalRevenue.toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${voucherData.length > 0 ? `
                    <h3 style="margin-top: 30px; font-size: 16px; margin-bottom: 10px;">RINCIAN POTONGAN KUPON</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Kupon / Item</th>
                                <th class="center">Jumlah</th>
                                <th class="right">Total Potongan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${voucherData.map(v => `
                                <tr>
                                    <td>${v.name}</td>
                                    <td class="center">${v.count}</td>
                                    <td class="right amount">Rp ${v.total.toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('')}
                            <tr class="total">
                                <td colspan="2">TOTAL POTONGAN</td>
                                <td class="right amount">Rp ${totalVoucher.toLocaleString('id-ID')}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
                        <table style="width: auto; min-width: 300px;">
                            <tr>
                                <td style="border: none; padding: 5px;">Total Nilai Jual</td>
                                <td style="border: none; padding: 5px; text-align: right; font-weight: bold;">Rp ${totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 5px; color: #dc2626;">Potongan Kupon</td>
                                <td style="border: none; padding: 5px; text-align: right; font-weight: bold; color: #dc2626;">- Rp ${totalVoucher.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr style="border-top: 2px solid #000;">
                                <td style="border: none; padding: 10px 5px; font-size: 16px; font-weight: bold;">TOTAL BERSIH</td>
                                <td style="border: none; padding: 10px 5px; text-align: right; font-size: 16px; font-weight: bold;">Rp ${netRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        </table>
                    </div>
                ` : ''}

                <div class="footer">
                    <p>Laporan ini dibuat otomatis oleh sistem pada tanggal ${new Date().toLocaleString('id-ID')}</p>
                </div>
            </body>
            </html>
        `;

        // Preview Wrapper with Actions
        const previewHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview Laporan</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0; }
                    .wrapper { max-width: 1000px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden; }
                    .actions-bar { 
                        padding: 15px 20px; 
                        background-color: #1f2937; 
                        color: white; 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                    }
                    .actions-bar h3 { margin: 0; font-size: 16px; font-weight: 500; }
                    .btn-group { display: flex; gap: 10px; }
                    .btn { 
                        padding: 8px 16px; 
                        border-radius: 6px; 
                        border: none; 
                        cursor: pointer; 
                        font-weight: 500; 
                        display: flex; 
                        align-items: center; 
                        gap: 6px; 
                        font-size: 14px;
                    }
                    .btn-primary { background-color: #3b82f6; color: white; }
                    .btn-primary:hover { background-color: #2563eb; }
                    .btn-secondary { background-color: white; color: #1f2937; }
                    .btn-secondary:hover { background-color: #f3f4f6; }
                    .btn-close { background-color: #ef4444; color: white; }
                    .btn-close:hover { background-color: #dc2626; }
                    
                    .content-preview { padding: 40px; }

                    @media print {
                        body { background-color: white; padding: 0; }
                        .actions-bar, .wrapper { box-shadow: none; border-radius: 0; margin: 0; max-width: none; }
                        .actions-bar { display: none !important; }
                        .content-preview { padding: 0; }
                    }
                </style>
                <script>
                    function downloadReport() {
                        const content = \`${reportContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'Laporan_Sparepart_${new Date().toISOString().slice(0, 10)}.html';
                        link.click();
                    }
                </script>
            </head>
            <body>
                <div class="wrapper">
                    <div class="actions-bar no-print">
                        <h3>Preview Laporan</h3>
                        <div class="btn-group">
                            <button onclick="window.close()" class="btn btn-close">Tutup</button>
                            <button onclick="downloadReport()" class="btn btn-secondary">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download HTML
                            </button>
                            <button onclick="window.print()" class="btn btn-primary">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                Cetak
                            </button>
                        </div>
                    </div>
                    <div class="content-preview">
                        ${reportContent}
                    </div>
                </div>
            </body>
            </html>
        `;

        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
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
                            {categories.filter(c => c !== 'all').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={handlePreview} title="Preview & Export" style={{ backgroundColor: '#fff', color: '#0ea5e9', border: '1px solid #0ea5e9' }}>
                        <Download size={18} style={{ marginRight: '5px' }} /> Preview & Export
                    </button>
                    <button className="btn btn-primary" onClick={handlePreview} title="Pratinjau Cetak">
                        <Printer size={18} /> Cetak
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--success) 0%, #16a34a 100%)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Nilai Jual</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                        Rp {totalRevenue.toLocaleString('id-ID')}
                    </div>
                </div>

                {totalVoucher > 0 && (
                    <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
                        <div style={{ fontSize: '0.85rem', color: '#dc2626' }}>Potongan Kupon</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                            - Rp {totalVoucher.toLocaleString('id-ID')}
                        </div>
                    </div>
                )}

                {totalVoucher > 0 && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Pendapatan Bersih</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                            Rp {netRevenue.toLocaleString('id-ID')}
                        </div>
                    </div>
                )}

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
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Nilai</th>
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
