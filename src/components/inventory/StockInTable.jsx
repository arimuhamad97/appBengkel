import React, { useState } from 'react';
import { Edit2, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api';

export default function StockInTable({ items, onRefresh }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [editData, setEditData] = useState(null);

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setEditData({ ...item });
    };

    const handleClose = () => {
        setSelectedItem(null);
        setEditData(null);
    };

    const handleChange = (field, value) => {
        setEditData(prev => {
            const updated = { ...prev, [field]: value };
            // Auto-calculate total
            if (field === 'qty' || field === 'price') {
                updated.total = (parseInt(updated.qty) || 0) * (parseInt(updated.price) || 0);
            }
            return updated;
        });
    };

    const handleUpdate = async () => {
        if (!editData.code || !editData.name || !editData.qty || !editData.price) {
            alert('Kode, Nama, Qty, dan Harga harus diisi!');
            return;
        }

        try {
            await api.updateStockIn(editData.id, {
                code: editData.code,
                name: editData.name,
                qty: parseInt(editData.qty),
                unit: editData.unit || 'Pcs',
                price: parseInt(editData.price),
                total: editData.total,
                date: editData.date
            });
            alert('Data berhasil diupdate!');
            handleClose();
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Failed to update', err);
            alert('Gagal mengupdate data: ' + err.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Hapus riwayat stok masuk ini?\n\n${selectedItem.name}\nQty: ${selectedItem.qty}\n\nStok di gudang akan dikurangi ${selectedItem.qty} unit.`)) {
            return;
        }

        try {
            const result = await api.deleteStockIn(selectedItem.id);
            alert(`Riwayat berhasil dihapus!\n\nStok ${result.code} dikurangi ${result.deletedQty} unit.`);
            handleClose();
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Failed to delete', err);
            alert('Gagal menghapus data: ' + err.message);
        }
    };

    if (!items || items.length === 0) {
        return (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Belum ada riwayat stok masuk.
            </p>
        );
    }

    return (
        <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Tanggal</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Kode</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Nama Part</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Harga</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => handleRowClick(item)}
                            style={{
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                                {new Date(item.date).toLocaleDateString('id-ID')}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{item.code}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>{item.name}</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                {item.qty} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                Rp {(item.price || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                Rp {(item.total || 0).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit/Delete Modal */}
            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="card" style={{ width: '600px', maxWidth: '100%' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            borderBottom: '2px solid var(--primary)',
                            paddingBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Edit2 size={24} color="var(--primary)" />
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
                                    Edit Riwayat Stok Masuk
                                </h2>
                            </div>
                            <button onClick={handleClose} style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Kode Part</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editData.code || ''}
                                        onChange={(e) => handleChange('code', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Nama Part</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editData.name || ''}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Qty</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={editData.qty || ''}
                                        onChange={(e) => handleChange('qty', e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Satuan</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editData.unit || 'Pcs'}
                                        onChange={(e) => handleChange('unit', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Harga</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={editData.price || ''}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Total</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={`Rp ${(editData.total || 0).toLocaleString()}`}
                                    readOnly
                                    style={{ fontWeight: 'bold', color: 'var(--primary)' }}
                                />
                            </div>

                            <div className="input-group">
                                <label>Tanggal</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={editData.date || ''}
                                    onChange={(e) => handleChange('date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '1rem'
                        }}>
                            <button
                                className="btn btn-outline"
                                onClick={handleDelete}
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                                <Trash2 size={18} /> Hapus
                            </button>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-outline" onClick={handleClose}>
                                    Batal
                                </button>
                                <button className="btn btn-primary" onClick={handleUpdate}>
                                    <Save size={18} /> Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
