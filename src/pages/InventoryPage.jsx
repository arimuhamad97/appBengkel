import React, { useState, useEffect } from 'react';
import { Plus, Package, ArrowDownLeft, ArrowUpRight, ClipboardList, Printer, Filter, Calendar } from 'lucide-react';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryForm from '../components/inventory/InventoryForm';
import StockInTable from '../components/inventory/StockInTable';
import StockOutTable from '../components/inventory/StockOutTable';
import StockOpnameTable from '../components/inventory/StockOpnameTable';
import { api } from '../services/api';

export default function InventoryPage({ user }) {
    const isFrontdesk = user?.role === 'frontdesk';
    const [activeTab, setActiveTab] = useState('stock');
    const [items, setItems] = useState([]);
    const [stockInItems, setStockInItems] = useState([]);
    const [stockOutItems, setStockOutItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchItems = async () => {
        try {
            const data = await api.getInventory();
            setItems(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
            setLoading(false);
        }
    };

    const fetchStockIn = async () => {
        try {
            const data = await api.getStockIn();
            setStockInItems(data);
        } catch (err) {
            console.error("Failed to fetch stock in", err);
        }
    };

    const fetchStockOut = async () => {
        try {
            const data = await api.getStockOut();
            setStockOutItems(data);
        } catch (err) {
            console.error("Failed to fetch stock out", err);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchStockIn();
        fetchStockOut();
    }, []);

    const handleSaveItem = async () => {
        // InventoryForm handles the save logic internally
        // This function just refreshes the data and closes the form
        setShowForm(false);
        setEditingItem(null);
        fetchItems();
        fetchStockIn();
        fetchStockOut();
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };


    const handlePrintStockOut = () => {
        const filteredItems = stockOutItems.filter(item => {
            const itemDate = new Date(item.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && itemDate < start) return false;
            // Set end date to end of day to include items on that day
            if (end) {
                const endOfDay = new Date(end);
                // Assuming item.date is YYYY-MM-DD, simple string comparison works too usually 
                // but let's be safe. Wait, item.date from DB is typically YYYY-MM-DD string.
                if (item.date > endDate) return false;
            }

            if (filterType === 'All') return true;
            if (filterType === 'Opname') return item.type === 'Opname';
            if (filterType === 'Service') return item.type === 'Service';
            if (filterType === 'Sales') return item.type === 'Direct';
            return true;
        });

        const printWindow = window.open('', '_blank');
        const html = `
            <html>
            <head>
                <title>Laporan Stok Keluar</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 5px; text-align: left; }
                    th { background-color: #f2f2f2; text-align: center; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .date { margin-bottom: 1px; }
                    .total { margin-top: 20px; font-weight: bold; text-align: right; }
                    @media print {
                        @page { size: landscape; margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2 style="margin: 0; font-size: 16px;">LAPORAN STOK KELUAR (${filterType.toUpperCase()})</h2>
                    <p style="margin: 5px 0;">Bengkel MMC Motor</p>
                    ${startDate || endDate ? `<p style="margin: 2px 0; font-size: 11px;">Periode: ${startDate ? startDate.split('-').reverse().join('-') : 'Awal'} s/d ${endDate ? endDate.split('-').reverse().join('-') : 'Sekarang'}</p>` : ''}
                </div>
                <div class="date">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%">No</th>
                            <th style="width: 15%">Tanggal</th>
                            <th style="width: 10%">Tipe</th>
                            <th style="width: 20%">Ref ID / Keterangan</th>
                            <th style="width: 15%">Kode Part</th>
                            <th style="width: 25%">Nama Part</th>
                            <th style="width: 10%">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredItems.map((item, index) => `
                            <tr>
                                <td style="text-align: center">${index + 1}</td>
                                <td>${item.date.split('-').reverse().join('-')}</td>
                                <td>${item.type || '-'}</td>
                                <td>${item.reference_id || '-'}</td>
                                <td>${item.code}</td>
                                <td>${item.name}</td>
                                <td style="text-align: center">-${item.qty} ${item.unit}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">
                    Total Item Keluar: ${filteredItems.reduce((acc, item) => acc + item.qty, 0)} Pcs
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div>
            {showForm && (
                <InventoryForm
                    initialData={editingItem}
                    onSave={handleSaveItem}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingItem(null);
                    }}
                />
            )}

            <div style={{ marginBottom: '2rem' }}>
                <div className="service-header-wrapper">
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Persediaan Sparepart</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            {activeTab === 'stock' && 'Daftar semua sparepart dan stok saat ini.'}
                            {activeTab === 'in' && 'Riwayat pembelian dan penambahan stok.'}
                            {activeTab === 'out' && 'Riwayat penggunaan barang untuk servis dan penjualan.'}
                            {activeTab === 'opname' && 'Penyesuaian stok manual (Stock Opname).'}
                        </p>
                    </div>

                    {!isFrontdesk && (
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <Plus size={18} /> <span className="hide-mobile">STOK MASUK</span>
                        </button>
                    )}
                </div>

                {/* Inline Tabs Navigation */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                    <button
                        onClick={() => setActiveTab('stock')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 0.25rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'stock' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'stock' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'stock' ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        <Package size={18} /> Total Item
                    </button>

                    {!isFrontdesk && (
                        <button
                            onClick={() => setActiveTab('in')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 0.25rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'in' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'in' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'in' ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                marginBottom: '-1px'
                            }}
                        >
                            <ArrowDownLeft size={18} /> Stok Masuk
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('out')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 0.25rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'out' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'out' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'out' ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        <ArrowUpRight size={18} /> Stok Keluar
                    </button>

                    {!isFrontdesk && (
                        <button
                            onClick={() => setActiveTab('opname')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 0.25rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'opname' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'opname' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'opname' ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                marginBottom: '-1px'
                            }}
                        >
                            <ClipboardList size={18} /> Opname
                        </button>
                    )}
                </div>
            </div>

            <div className="card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', boxShadow: 'none' }}>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</div>
                ) : activeTab === 'stock' ? (
                    <InventoryTable items={items} onAction={handleEditItem} />
                ) : activeTab === 'in' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                            <div
                                onClick={() => document.getElementById('date-start-in').showPicker()}
                                style={{
                                    position: 'relative',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 0.8rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-hover)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    minWidth: '140px'
                                }}
                            >
                                <input
                                    id="date-start-in"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        position: 'absolute',
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        bottom: 0,
                                        left: '50%',
                                        width: 0,
                                        height: 0
                                    }}
                                />
                                <Calendar size={16} color="var(--text-muted)" />
                                <span>{startDate ? startDate.split('-').reverse().join('-') : <span style={{ color: 'var(--text-muted)' }}>Mulai...</span>}</span>
                            </div>

                            <span style={{ color: 'var(--text-muted)' }}>-</span>

                            <div
                                onClick={() => document.getElementById('date-end-in').showPicker()}
                                style={{
                                    position: 'relative',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 0.8rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-hover)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    minWidth: '140px'
                                }}
                            >
                                <input
                                    id="date-end-in"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        position: 'absolute',
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        bottom: 0,
                                        left: '50%',
                                        width: 0,
                                        height: 0
                                    }}
                                />
                                <Calendar size={16} color="var(--text-muted)" />
                                <span>{endDate ? endDate.split('-').reverse().join('-') : <span style={{ color: 'var(--text-muted)' }}>Sampai...</span>}</span>
                            </div>
                        </div>

                        <StockInTable
                            items={stockInItems.filter(item => {
                                if (startDate && item.date < startDate) return false;
                                if (endDate && item.date > endDate) return false;
                                return true;
                            })}
                            onRefresh={() => { fetchItems(); fetchStockIn(); }}
                        />
                    </div>
                ) : activeTab === 'out' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={18} color="var(--text-muted)" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-hover)',
                                        color: 'var(--text-main)',
                                        minWidth: '150px'
                                    }}
                                >
                                    <option value="All">Semua Tipe</option>
                                    <option value="Opname">Opname / Adjustment</option>
                                    <option value="Service">Service (Bengkel)</option>
                                    <option value="Direct">Penjualan Langsung</option>
                                </select>
                                <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>|</span>

                                {/* Start Date Custom Input */}
                                {/* Start Date Custom Input */}
                                <div
                                    onClick={() => document.getElementById('date-start').showPicker()}
                                    style={{
                                        position: 'relative',
                                        height: '38px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 0.8rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-hover)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        minWidth: '140px'
                                    }}
                                >
                                    <input
                                        id="date-start"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{
                                            position: 'absolute',
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            bottom: 0,
                                            left: '50%',
                                            width: 0,
                                            height: 0
                                        }}
                                    />
                                    <Calendar size={16} color="var(--text-muted)" />
                                    <span>{startDate ? startDate.split('-').reverse().join('-') : <span style={{ color: 'var(--text-muted)' }}>Mulai...</span>}</span>
                                </div>

                                <span style={{ color: 'var(--text-muted)' }}>-</span>

                                {/* End Date Custom Input */}
                                <div
                                    onClick={() => document.getElementById('date-end').showPicker()}
                                    style={{
                                        position: 'relative',
                                        height: '38px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 0.8rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-hover)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        minWidth: '140px'
                                    }}
                                >
                                    <input
                                        id="date-end"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{
                                            position: 'absolute',
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            bottom: 0,
                                            left: '50%',
                                            width: 0,
                                            height: 0
                                        }}
                                    />
                                    <Calendar size={16} color="var(--text-muted)" />
                                    <span>{endDate ? endDate.split('-').reverse().join('-') : <span style={{ color: 'var(--text-muted)' }}>Sampai...</span>}</span>
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={handlePrintStockOut}>
                                <Printer size={18} style={{ marginRight: '0.5rem' }} /> Cetak Laporan
                            </button>
                        </div>

                        <StockOutTable
                            items={stockOutItems.filter(item => {
                                if (startDate && item.date < startDate) return false;
                                if (endDate && item.date > endDate) return false;
                                if (filterType === 'All') return true;
                                if (filterType === 'Opname') return item.type === 'Opname';
                                if (filterType === 'Service') return item.type === 'Service';
                                if (filterType === 'Direct') return item.type === 'Direct';
                                return true;
                            })}
                        />
                    </div>
                ) : activeTab === 'opname' ? (
                    <StockOpnameTable onRefresh={() => { fetchItems(); fetchStockIn(); fetchStockOut(); }} />
                ) : null}
            </div>
        </div >
    );
}
