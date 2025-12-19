import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Save, Search, Printer, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export default function SalesPOS({ onSave, onCancel }) {
    // Helper for local date
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [items, setItems] = useState([]);
    const [buyerName, setBuyerName] = useState('Umum');
    const [saleDate, setSaleDate] = useState(getLocalDate());
    const [selectedPartId, setSelectedPartId] = useState('');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partSearch, setPartSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await api.getInventory();
            setInventory(data);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            alert('Gagal memuat data inventory');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + ((item.price || 0) * (item.q || 0)), 0);
    };

    const handleAddItem = () => {
        if (!selectedPartId) return;

        console.log('Adding item with ID:', selectedPartId);
        // Gunakan == agar cocok baik string maupun number
        const part = inventory.find(p => p.id == selectedPartId);

        if (part) {
            console.log('Found part:', part);
            console.log('Part price:', part.price);

            // Check stock logic with null safety
            const currentInCart = items.find(i => i.id === part.id)?.q || 0;
            const availableStock = part.stock || 0;

            if (currentInCart + 1 > availableStock) {
                alert(`Stok tidak mencukupi! Stok tersedia: ${availableStock}`);
                return;
            }

            // Check if already exists
            const existing = items.find(i => i.id === part.id);
            if (existing) {
                setItems(items.map(i => i.id === part.id ? { ...i, q: i.q + 1 } : i));
            } else {
                // Explicitly include all necessary fields
                const newItem = {
                    id: part.id,
                    name: part.name,
                    price: part.price || 0,
                    stock: part.stock,
                    category: part.category,
                    q: 1
                };
                console.log('Adding new item to cart:', newItem);
                setItems([...items, newItem]);
            }
            setSelectedPartId('');
        } else {
            console.error('Part not found via ID:', selectedPartId);
            // Coba debug inventory
            console.log('Available inventory IDs:', inventory.map(i => i.id));
        }
    };

    const updateQuantity = (index, delta) => {
        const newItems = [...items];
        const item = newItems[index];
        const part = inventory.find(p => p.id === item.id);

        // Cek stok sebelum nambah dengan null safety
        if (delta > 0 && part) {
            const availableStock = part.stock || 0;
            if (item.q + delta > availableStock) {
                alert(`Stok maksimal: ${availableStock}`);
                return;
            }
        }

        item.q += delta;
        if (item.q <= 0) {
            newItems.splice(index, 1);
        }
        setItems(newItems);
    };

    const handleProcessSale = () => {
        if (!buyerName) {
            alert('Mohon isi nama pembeli');
            return;
        }
        if (items.length === 0) return;

        setShowPreview(true);
    };

    const printReceipt = (data) => {
        const printWindow = window.open('', '_blank', 'width=300,height=600');
        if (!printWindow) return; // Blocked popup

        const html = `
    < html >
                <head>
                    <title>Nota Penjualan</title>
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
                        <span>${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>Pembeli: ${data.buyerName}</div>
                    <div class="border-top"></div>
                    
                    ${data.items.map(item => `
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
            </html >
    `;

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const handleConfirmPayment = async () => {
        try {
            const saleData = {
                buyerName,
                items,
                total: calculateTotal(),
                date: saleDate
            };

            await api.createSale(saleData);
            setShowPreview(false);
            onSave(saleData); // Callback to parent to update list
        } catch (error) {
            console.error('Failed to process sale:', error);
            alert('Gagal memproses penjualan: ' + error.message);
        }
    };

    const handleSaveAndPrint = async () => {
        try {
            const saleData = {
                buyerName,
                items,
                total: calculateTotal(),
                date: saleDate
            };

            await api.createSale(saleData);
            printReceipt(saleData);

            setShowPreview(false);
            onSave(saleData);
        } catch (error) {
            console.error('Failed to process sale:', error);
            alert('Gagal memproses penjualan: ' + error.message);
        }
    };

    // Filter inventory for dropdown
    const filteredInventory = inventory.filter(p =>
        (p.name && p.name.toLowerCase().includes(partSearch.toLowerCase())) ||
        (p.code && p.code.toLowerCase().includes(partSearch.toLowerCase()))
    );

    return (
        <div className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Kasir Penjualan</h2>
                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-hover)',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                    onClick={() => document.getElementById('pos-date-input').showPicker()}
                >
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>Tanggal Transaksi</span>
                        <span style={{ fontWeight: '600' }}>
                            {new Date(saleDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <input
                        id="pos-date-input"
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        style={{
                            position: 'absolute',
                            opacity: 0,
                            width: 0,
                            height: 0,
                            pointerEvents: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left: Cart */}
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nama Pembeli</label>
                        <input
                            type="text"
                            className="input"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Cari & Pilih Sparepart
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Ketik nama atau kode sparepart..."
                                value={partSearch}
                                onChange={(e) => {
                                    setPartSearch(e.target.value);
                                    setShowSuggestions(true);
                                    setSelectedPartId('');
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                style={{ width: '100%', paddingLeft: '2.5rem' }}
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && partSearch && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    marginTop: '0.25rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    zIndex: 1000,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    {inventory
                                        .filter(p => {
                                            const search = partSearch.toLowerCase();
                                            return (p.name && p.name.toLowerCase().includes(search)) ||
                                                (p.id && p.id.toLowerCase().includes(search));
                                        })
                                        .slice(0, 10)
                                        .map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    if (p.stock > 0) {
                                                        // Check if already in cart
                                                        const currentInCart = items.find(i => i.id === p.id)?.q || 0;
                                                        const availableStock = p.stock || 0;

                                                        if (currentInCart + 1 > availableStock) {
                                                            alert(`Stok tidak mencukupi! Stok tersedia: ${availableStock}`);
                                                            return;
                                                        }

                                                        // Add or update item
                                                        const existing = items.find(i => i.id === p.id);
                                                        if (existing) {
                                                            setItems(items.map(i => i.id === p.id ? { ...i, q: i.q + 1 } : i));
                                                        } else {
                                                            const newItem = {
                                                                id: p.id,
                                                                name: p.name,
                                                                price: p.price || 0,
                                                                stock: p.stock,
                                                                category: p.category,
                                                                q: 1
                                                            };
                                                            setItems([...items, newItem]);
                                                        }

                                                        // Clear search
                                                        setPartSearch('');
                                                        setShowSuggestions(false);
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                                                    borderBottom: '1px solid var(--border)',
                                                    opacity: p.stock > 0 ? 1 : 0.5,
                                                    backgroundColor: 'var(--bg-card)',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (p.stock > 0) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                                }}
                                            >
                                                <div style={{ fontWeight: '500' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {p.id} • Rp {(p.price || 0).toLocaleString()} • Stok: {p.stock || 0}
                                                </div>
                                            </div>
                                        ))
                                    }
                                    {inventory.filter(p => {
                                        const search = partSearch.toLowerCase();
                                        return (p.name && p.name.toLowerCase().includes(search)) ||
                                            (p.id && p.id.toLowerCase().includes(search));
                                    }).length === 0 && (
                                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Sparepart tidak ditemukan
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                        {partSearch && !showSuggestions && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Tekan untuk mencari lagi
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Item</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{item.name} <br /> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@ {item.price.toLocaleString()}</span></td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button onClick={() => updateQuantity(idx, -1)} style={{ padding: '0 5px', cursor: 'pointer', background: 'none', border: '1px solid var(--border)', color: 'white' }}>-</button>
                                            <span style={{ margin: '0 10px' }}>{item.q}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} style={{ padding: '0 5px', cursor: 'pointer', background: 'none', border: '1px solid var(--border)', color: 'white' }}>+</button>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>Rp {(item.price * item.q).toLocaleString()}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <button onClick={() => updateQuantity(idx, -item.q)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Keranjang kosong.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Payment */}
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Total Bayar</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--primary)' }}>
                        Rp {calculateTotal().toLocaleString()}
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                            onClick={handleProcessSale}
                            disabled={items.length === 0}
                        >
                            <ShoppingCart size={20} /> Proses Pembayaran
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%' }} onClick={onCancel}>
                            Batal
                        </button>
                    </div>
                </div>
            </div>

            {/* Receipt Preview Modal */}
            {showPreview && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Preview Nota</h3>

                        <div style={{ fontFamily: 'monospace', marginBottom: '1.5rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 'bold' }}>BENGKEL MOTOR</div>
                                <div>Jl. Contoh No. 123</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Tgl: {new Date().toLocaleDateString()}</span>
                                <span>{new Date().toLocaleTimeString()}</span>
                            </div>
                            <div>Pembeli: {buyerName}</div>
                            <hr style={{ border: 'none', borderTop: '1px dashed var(--text-muted)', margin: '0.5rem 0' }} />

                            {items.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '0.5rem' }}>
                                    <div>{item.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.q} x {item.price.toLocaleString()}</span>
                                        <span>{(item.q * item.price).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}

                            <hr style={{ border: 'none', borderTop: '1px dashed var(--text-muted)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                <span>Total</span>
                                <span>Rp {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr 1fr' }}>
                            <button className="btn btn-primary" onClick={handleSaveAndPrint} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Printer size={18} /> Cetak
                            </button>
                            <button className="btn btn-outline" onClick={handleConfirmPayment} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Save size={18} /> Simpan
                            </button>
                        </div>
                        <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowPreview(false)}>
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
