import React, { useState, useEffect } from 'react';
import { Printer, Wrench, Download } from 'lucide-react';
import { api } from '../../services/api';

export default function ServiceSalesReport() {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [data, setData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [startDate, endDate, selectedGroup]);

    const loadData = async () => {
        setLoading(true);
        try {
            const queue = await api.getQueue();

            // Filter by date and status
            const filtered = queue.filter(q => {
                const qDate = new Date(q.date).toISOString().split('T')[0];
                return qDate >= startDate && qDate <= endDate && (q.status === 'Done' || q.status === 'Paid');
            });

            // Collect all services with group
            const allServices = [];
            const groupSet = new Set();

            filtered.forEach(service => {
                try {
                    const items = typeof service.items === 'string' ? JSON.parse(service.items) : service.items;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            // Only include items with type 'Service' or 'service'
                            if (item.type && item.type.toLowerCase() === 'service') {
                                const group = item.group_type || 'Lainnya';
                                groupSet.add(group);

                                allServices.push({
                                    name: item.name,
                                    group: group,
                                    price: item.price || 0,
                                    qty: item.q || 1,
                                    revenue: (item.price || 0) * (item.q || 1),
                                    queueNumber: service.queueNumber,
                                    customerName: service.customerName,
                                    date: service.date
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing service items:', e);
                }
            });

            // Set groups for filter
            setGroups(['all', ...Array.from(groupSet).sort()]);

            // Filter by group
            const filteredByGroup = selectedGroup === 'all'
                ? allServices
                : allServices.filter(s => s.group === selectedGroup);

            // Group by service name
            const grouped = filteredByGroup.reduce((acc, svc) => {
                const name = svc.name || 'Unknown';
                if (!acc[name]) {
                    acc[name] = {
                        name: name,
                        group: svc.group,
                        totalQty: 0,
                        totalRevenue: 0,
                        transactions: 0,
                        avgPrice: 0
                    };
                }
                acc[name].totalQty += svc.qty;
                acc[name].totalRevenue += svc.revenue;
                acc[name].transactions += 1;
                return acc;
            }, {});

            // Calculate average price
            const result = Object.values(grouped).map(item => ({
                ...item,
                avgPrice: item.totalRevenue / item.totalQty
            })).sort((a, b) => b.totalRevenue - a.totalRevenue);

            setData(result);
        } catch (error) {
            console.error('Failed to load service sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const html = `
            <html>
            <head>
                <title>Laporan Jasa Terjual</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; }
                    .period { text-align: center; margin-bottom: 30px; color: #666; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>LAPORAN JASA TERJUAL</h1>
                <div class="period">${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}</div>
                
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Jasa</th>
                            <th style="text-align: center">Qty Terjual</th>
                            <th style="text-align: center">Transaksi</th>
                            <th style="text-align: right">Harga Rata-rata</th>
                            <th style="text-align: right">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${item.name}</td>
                                <td style="text-align: center">${item.totalQty}</td>
                                <td style="text-align: center">${item.transactions}</td>
                                <td style="text-align: right">Rp ${item.avgPrice.toLocaleString('id-ID')}</td>
                                <td style="text-align: right">Rp ${item.totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="2">TOTAL</td>
                            <td style="text-align: center">${data.reduce((sum, item) => sum + item.totalQty, 0)}</td>
                            <td style="text-align: center">${data.reduce((sum, item) => sum + item.transactions, 0)}</td>
                            <td></td>
                            <td style="text-align: right">Rp ${data.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString('id-ID')}</td>
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

    const totalQty = data.reduce((sum, item) => sum + item.totalQty, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

    const handleExport = () => {
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
                <div class="header">LAPORAN JASA TERJUAL</div>
                <div class="info">
                    Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
                    Group: ${selectedGroup === 'all' ? 'Semua Group' : selectedGroup}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Jasa</th>
                            <th>Group</th>
                            <th class="center">Qty</th>
                            <th class="center">Transaksi</th>
                            <th class="right">Harga Rata-rata</th>
                            <th class="right">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item, i) => `
                            <tr>
                                <td class="center">${i + 1}</td>
                                <td>${item.name}</td>
                                <td>${item.group}</td>
                                <td class="center">${item.totalQty}</td>
                                <td class="center">${item.transactions}</td>
                                <td class="right">${item.avgPrice.toLocaleString('id-ID')}</td>
                                <td class="right">${item.totalRevenue.toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="3">TOTAL</td>
                            <td class="center">${totalQty}</td>
                            <td class="center">${totalTransactions}</td>
                            <td></td>
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
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Jasa_${startDate}_${endDate}.xls`;
        link.click();
    };

    return (
        <div>
            {/* Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Dari:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sampai:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Group Jasa:</label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="input"
                            style={{ minWidth: '150px' }}
                        >
                            <option value="all">Semua Group</option>
                            {groups.filter(g => g !== 'all').map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
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

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Total Pendapatan</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                Rp {totalRevenue.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <Wrench size={36} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Jasa Dilakukan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalQty}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Transaksi</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalTransactions}</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>
                    Detail Jasa Terjual
                    {selectedGroup !== 'all' && <span style={{ color: 'var(--primary)', fontWeight: 'normal', fontSize: '0.9rem' }}> - {selectedGroup}</span>}
                </h3>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Memuat data...</p>
                ) : data.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada jasa terjual pada periode ini</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama Jasa</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Group</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty Terjual</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Transaksi</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Harga Rata-rata</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                backgroundColor: 'var(--bg-hover)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                {item.group}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{item.totalQty}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.transactions}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            Rp {item.avgPrice.toLocaleString('id-ID')}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                            Rp {item.totalRevenue.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: 'var(--bg-hover)', fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
                                    <td colSpan="2" style={{ padding: '0.75rem' }}>TOTAL</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{totalQty}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{totalTransactions}</td>
                                    <td style={{ padding: '0.75rem' }}></td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        Rp {totalRevenue.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}
