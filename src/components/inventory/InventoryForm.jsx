import React, { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import { api } from '../../services/api';

export default function InventoryForm({ onSave, onCancel, initialData = null }) {
    const [partTypes, setPartTypes] = useState([]);
    const [codeFilteredParts, setCodeFilteredParts] = useState([]);
    const [nameFilteredParts, setNameFilteredParts] = useState([]);
    const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [formData, setFormData] = useState({
        code: initialData?.id || '',
        name: initialData?.name || '',
        qty: '',
        unit: '',
        price: '',
        group: '',
        total: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Auto calculate total
        const qty = parseInt(formData.qty) || 0;
        const price = parseInt(formData.price) || 0;
        setFormData(prev => ({ ...prev, total: qty * price }));
    }, [formData.qty, formData.price]);

    const fetchData = async () => {
        try {
            const inventoryData = await api.getInventory();
            const formattedItems = inventoryData.map(item => ({
                id: item.id,
                code: item.id,
                name: item.name,
                unit: item.unit || 'Pcs',
                sell_price: item.price,
                group_type: item.category
            }));
            setPartTypes(formattedItems);
        } catch (err) {
            console.error("Failed to fetch inventory for suggestions", err);
        }
    };

    const handleCodeChange = (value) => {
        setFormData({ ...formData, code: value });

        if (value && value.trim()) {
            const searchTerm = value.toLowerCase();
            const filtered = partTypes.filter(p =>
                p.code && p.code.toString().toLowerCase().includes(searchTerm)
            );
            setCodeFilteredParts(filtered);
            setShowCodeSuggestions(true);
            setShowNameSuggestions(false);
        } else {
            setShowCodeSuggestions(false);
        }
    };

    const handleNameChange = (value) => {
        setFormData({ ...formData, name: value });

        if (value && value.trim()) {
            const searchTerm = value.toLowerCase();
            const filtered = partTypes.filter(p =>
                p.name && p.name.toString().toLowerCase().includes(searchTerm)
            );
            setNameFilteredParts(filtered);
            setShowNameSuggestions(true);
            setShowCodeSuggestions(false);
        } else {
            setShowNameSuggestions(false);
        }
    };

    const selectPart = (part) => {
        setFormData({
            ...formData,
            code: part.code || '',
            name: part.name || '',
            unit: part.unit || '',
            price: part.sell_price || '',
            group: part.group_type || ''
        });
        setShowCodeSuggestions(false);
        setShowNameSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.name || !formData.qty || !formData.price) {
            alert('Kode Part, Nama, Qty, dan Harga harus diisi!');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Save to stock_in history
            await api.createStockIn({
                code: formData.code,
                name: formData.name,
                qty: parseInt(formData.qty),
                unit: formData.unit || 'Pcs',
                price: parseInt(formData.price),
                total: formData.total,
                date: today
            });

            // 2. Check and update inventory
            const allInventory = await api.getInventory();
            const existingItem = allInventory.find(item => item.id === formData.code);

            if (existingItem) {
                // Item exists - UPDATE stock
                const oldStock = existingItem.stock || 0;
                const updatedStock = oldStock + parseInt(formData.qty);

                await api.updateInventoryItem(formData.code, {
                    name: formData.name,
                    price: parseInt(formData.price),
                    stock: updatedStock,
                    category: formData.group || existingItem.category || 'Umum'
                });

                alert(`✅ Stok berhasil ditambahkan!\n\n${formData.name}\nStok lama: ${oldStock}\nTambah: ${formData.qty}\nStok baru: ${updatedStock}`);
            } else {
                // Item doesn't exist - CREATE new
                await api.createInventoryItem({
                    id: formData.code,
                    name: formData.name,
                    price: parseInt(formData.price),
                    stock: parseInt(formData.qty),
                    category: formData.group || 'Umum'
                });

                alert(`✅ Item baru berhasil ditambahkan!\n\n${formData.name}\nStok awal: ${formData.qty}`);
            }

            onSave();
        } catch (err) {
            console.error("Failed to save stock in", err);
            alert('❌ Gagal menyimpan data:\n' + err.message);
        }
    };

    const renderSuggestions = (parts, show) => {
        if (!show || parts.length === 0) return null;

        return (
            <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                marginTop: '0.25rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                {/* Counter */}
                <div style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--bg-hover)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontWeight: '500',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                }}>
                    {parts.length} hasil ditemukan {parts.length > 20 && '(menampilkan 20 teratas)'}
                </div>

                {/* Results */}
                {parts.slice(0, 20).map((part) => (
                    <div
                        key={part.id}
                        onClick={() => selectPart(part)}
                        style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border)',
                            transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    color: 'var(--primary)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {part.code}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                    {part.name}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {part.group_type && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.2rem 0.5rem',
                                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                            color: 'var(--primary)',
                                            borderRadius: '4px',
                                            fontWeight: '500'
                                        }}>
                                            {part.group_type}
                                        </span>
                                    )}
                                    {part.sell_price && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Rp {part.sell_price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
        }}>
            <div className="card modal-content" style={{ width: '700px', maxWidth: '100%', margin: '2rem auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                        Stok Masuk - Tambah Barang
                    </h2>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                        {/* Search Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        }}>
                            {/* Kode Part with Autocomplete */}
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label>Kode Part <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Cari kode..."
                                        value={formData.code}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        onFocus={() => formData.code && setShowCodeSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowCodeSuggestions(false), 200)}
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    <Search size={16} style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                </div>
                                {renderSuggestions(codeFilteredParts, showCodeSuggestions)}
                            </div>

                            {/* Nama Part with Autocomplete */}
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label>Nama Part <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Cari nama..."
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        onFocus={() => formData.name && setShowNameSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    <Search size={16} style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                </div>
                                {renderSuggestions(nameFilteredParts, showNameSuggestions)}
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem'
                        }}>
                            <div className="input-group">
                                <label>Qty <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="10"
                                    value={formData.qty}
                                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                                    min="1"
                                />
                            </div>

                            <div className="input-group">
                                <label>Satuan</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Pcs"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    readOnly
                                    style={{ backgroundColor: 'var(--bg-hover)' }}
                                />
                            </div>

                            <div className="input-group">
                                <label>Harga Satuan <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="50000"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Total Harga</label>
                            <input
                                type="text"
                                className="input"
                                value={`Rp ${formData.total.toLocaleString()}`}
                                readOnly
                                style={{
                                    backgroundColor: 'var(--bg-hover)',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    color: 'var(--primary)'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-outline" onClick={onCancel}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} /> Simpan Stok Masuk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
