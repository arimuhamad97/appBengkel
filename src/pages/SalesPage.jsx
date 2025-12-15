import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Calendar, Trash2, Eye, X, Printer } from 'lucide-react';
import SalesPOS from '../components/sales/SalesPOS';
import { api } from '../services/api';

export default function SalesPage() {
    const [view, setView] = useState('list'); // list, pos
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await api.getSales();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load sales history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSale = (saleData) => {
        // Data sudah disimpan di backend via SalesPOS logic, kita tinggal refresh list
        loadHistory();
        alert('Penjualan Berhasil Disimpan!');
        setView('list');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus penjualan ini? Stok barang akan dikembalikan.')) {
            try {
                await api.deleteSale(id);
                loadHistory();
            } catch (error) {
                console.error('Failed to delete sale:', error);
                alert('Gagal menghapus penjualan: ' + error.message);
            }
        }
    };

    const printReceipt = (data) => {
        let items = [];
        try {
            items = typeof data.items_detail === 'string'
                ? JSON.parse(data.items_detail)
                : (data.items_detail || []);
        } catch (e) { console.error(e); }

        const printWindow = window.open('', '_blank', 'width=300,height=600');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Nota Penjualan #${data.id}</title>
                    <style>
                        body { font-family: monospace; padding: 10px; font-size: 12px; max-width: 300px; margin: 0 auto; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .flex { display: flex; justify-content: space-between; }
                        .bold { font-weight: bold; }
                        .border-top { border-top: 1px dashed black; margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <div class="text-center bold" style="font-size: 14px; margin-bottom: 5px;">BENGKEL MOTOR</div>
                    <div class="text-center">Jl. Contoh No. 123</div>
                    <div class="border-top"></div>
                    
                    <div class="flex">
                        <span>${new Date(data.date).toLocaleDateString('id-ID')}</span>
                        <span>#${data.id}</span>
                    </div>
                    <div>Pembeli: ${data.buyer}</div>
                    <div class="border-top"></div>
                    
                    ${items.map(item => `
                        <div style="margin-bottom: 2px;">
                            <div>${item.name}</div>
                            <div class="flex">
                                <span>${item.q} x ${item.price.toLocaleString('id-ID')}</span>
                                <span>${(item.q * item.price).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="border-top"></div>
                    <div class="flex bold" style="font-size: 14px;">
                        <span>TOTAL</span>
                        <span>Rp ${data.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="border-top"></div>
                    <div class="text-center" style="margin-top: 10px;">Terima Kasih</div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    if (view === 'pos') {
        return <SalesPOS onSave={handleSaveSale} onCancel={() => setView('list')} />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Penjualan Langsung</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Penjualan sparepart tanpa jasa servis.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setView('pos')}>
                    <Plus size={18} /> Transaksi Baru
                </button>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Tanggal</th>
                            <th style={{ padding: '1rem' }}>Pembeli</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Jml Item</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((sale) => (
                            <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>#{sale.id}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} /> {sale.date}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>{sale.buyer}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>{sale.items}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    Rp {sale.total.toLocaleString()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                            title="Lihat Detail"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sale.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                            title="Hapus/Batalkan Transaksi"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail Penjualan */}
            {selectedSale && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Detail Penjualan #{selectedSale.id}</h2>
                            <button onClick={() => setSelectedSale(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Pembeli</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{selectedSale.buyer}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tanggal & Waktu</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{selectedSale.created_at || selectedSale.date}</div>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.75rem' }}>Item</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Harga</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let items = [];
                                    try {
                                        items = typeof selectedSale.items_detail === 'string'
                                            ? JSON.parse(selectedSale.items_detail)
                                            : (selectedSale.items_detail || []);
                                    } catch (e) { console.error('Error parsing itemsDetail:', e); }

                                    return items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ fontWeight: '500' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {item.id}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.q}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>Rp {item.price.toLocaleString()}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>Rp {(item.q * item.price).toLocaleString()}</td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Total Transaksi</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>
                                        Rp {selectedSale.total.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => printReceipt(selectedSale)} style={{ display: 'flex', alignItems: 'center' }}>
                                <Printer size={18} style={{ marginRight: '0.5rem' }} /> Cetak Nota
                            </button>
                            <button className="btn btn-primary" onClick={() => setSelectedSale(null)}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
