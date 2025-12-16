import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Search, FileText } from 'lucide-react';
import { api } from '../../services/api';

export default function ServiceProcessForm({ service, onSave, onCancel, onRevert, onUpdateProgress }) {
    const [items, setItems] = useState(service.items || []);
    const [note, setNote] = useState(service.complaint || '');
    const [mechanicId, setMechanicId] = useState(service.mechanicId || '');
    const [kilometer, setKilometer] = useState(service.kilometer || '');

    // Reference Data
    const [servicesList, setServicesList] = useState([]);
    const [partsList, setPartsList] = useState([]);
    const [mechanicsList, setMechanicsList] = useState([]);

    // Form states for adding new item
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    const [partSearch, setPartSearch] = useState('');

    useEffect(() => {
        const loadRefs = async () => {
            try {
                const [s, p, m] = await Promise.all([api.getServices(), api.getInventory(), api.getMechanics()]);
                setServicesList(s);
                setPartsList(p);
                setMechanicsList(m);
            } catch (e) {
                console.error("Failed to load reference data", e);
            }
        };
        loadRefs();
    }, []);

    // Discount Update Handler (supports both percent and nominal)
    const handleUpdateDiscount = (listId, value, mode = 'percent') => {
        const newItems = items.map(item => {
            if (item.listId === listId) {
                if (mode === 'percent') {
                    const percent = Math.min(100, Math.max(0, Number(value)));
                    const discount = Math.floor((item.price * percent) / 100);
                    return { ...item, discount, discountPercent: percent };
                } else {
                    const nominal = Number(value);
                    const discountPercent = item.price > 0 ? parseFloat(((nominal / item.price) * 100).toFixed(2)) : 0;
                    return { ...item, discount: nominal, discountPercent };
                }
            }
            return item;
        });
        setItems(newItems);
    };

    const handleUpdateQuantity = (listId, value) => {
        const newItems = items.map(item => {
            if (item.listId === listId) {
                return { ...item, q: Math.max(1, Number(value)) };
            }
            return item;
        });
        setItems(newItems);
    };

    const handleUpdatePrice = (listId, value) => {
        const price = Number(value);
        const newItems = items.map(item => {
            if (item.listId === listId) {
                // Recalculate discount if percent exists
                const discount = item.discountPercent !== undefined
                    ? Math.floor((price * item.discountPercent) / 100)
                    : (item.discount || 0);
                return { ...item, price, discount };
            }
            return item;
        });
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0);
    };

    const handleAddService = () => {
        if (!selectedServiceId) return;
        const serv = servicesList.find(s => s.id === parseInt(selectedServiceId));
        if (serv) {
            const newItem = {
                ...serv,
                type: 'Service',
                listId: Date.now() + Math.random(),
                q: 1,
                discount: 0
            };
            setItems([...items, newItem]);
            setSelectedServiceId('');
        }
    };

    const handleAddPart = () => {
        if (!selectedPartId) return;
        const part = partsList.find(p => p.id === selectedPartId);
        if (part) {
            const newItem = {
                ...part,
                type: 'Part',
                listId: Date.now() + Math.random(),
                q: 1,
                discount: 0
            };
            setItems([...items, newItem]);
            setSelectedPartId('');
        }
    };

    const handleRemoveItemItems = (itemToRemove) => {
        const newItems = items.filter(i => i !== itemToRemove);
        setItems(newItems);
    };

    const validateBeforeSave = () => {
        const errors = [];

        // Validasi mekanik
        if (!mechanicId) {
            errors.push('Mekanik belum dipilih');
        }

        // Validasi kilometer
        if (!kilometer || kilometer.trim() === '') {
            errors.push('Kilometer belum diisi');
        }

        // Validasi items dan total dihapus - boleh 0 atau kosong

        return errors;
    };

    const handleSaveAndComplete = () => {
        const errors = validateBeforeSave();

        if (errors.length > 0) {
            const errorMessage = 'Data belum lengkap:\n\n' + errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
            alert(errorMessage);
            return;
        }

        // Jika validasi lolos, lanjutkan save
        onSave({ ...service, items, complaint: note, mechanicId, kilometer });
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '80vh' }}>
            {/* --- TOP SECTION: HEADER & INFO --- */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Proses Pengerjaan</h2>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius)',
                                fontWeight: 'bold',
                                marginRight: '0.5rem'
                            }}>
                                Antrian #{service.queueNumber}
                            </span>
                            Entry: {service.entryTime} • {service.serviceType}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', display: 'block' }}>
                                {service.plateNumber}
                            </span>
                            <span className="text-muted">{service.customerName}</span>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await onUpdateProgress({ ...service, items, complaint: note, mechanicId, kilometer });
                                    onCancel();
                                } catch (e) {
                                    console.error('Failed to save draft:', e);
                                    onCancel(); // Tutup meskipun gagal save
                                }
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'var(--bg-hover)';
                                e.target.style.color = 'var(--danger)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = 'var(--text-muted)';
                            }}
                            title="Simpan draft & tutup"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Motor</label>
                        <div style={{ fontWeight: 'bold' }}>{service.bikeModel}</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Kilometer <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            type="number"
                            className="input"
                            style={{ padding: '0.2rem', fontSize: '0.9rem', width: '100%' }}
                            placeholder="KM"
                            value={kilometer}
                            onChange={(e) => setKilometer(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Mekanik <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select
                            className="input"
                            style={{ padding: '0.2rem', fontSize: '0.9rem', width: '100%' }}
                            value={mechanicId}
                            onChange={(e) => setMechanicId(e.target.value)}
                        >
                            <option value="">-- Pilih Mekanik --</option>
                            {mechanicsList
                                .filter(m => !m.role || m.role === 'Mekanik')
                                .map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.status})
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keluhan Awal</label>
                        <div style={{ fontStyle: 'italic' }}>"{service.complaint}"</div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM SECTION: DATA ENTRY (Split Service & Parts) --- */}
            <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <FileText size={18} /> Estimasi Biaya & Jasa
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* JASA SERVIS */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Jasa Servis</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', marginBottom: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Cari Jasa..."
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    style={{ paddingRight: '2rem', fontSize: '0.85rem', padding: '0.4rem' }}
                                />
                                <Search size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select className="input" style={{ flex: 1 }} value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                                    <option value="">+ Tambah Jasa</option>
                                    {servicesList
                                        .filter(s => s.name?.toLowerCase().includes(serviceSearch.toLowerCase()))
                                        .slice(0, 50)
                                        .map(s => (
                                            <option key={s.id} value={s.id}>{s.name} - Rp {s.price.toLocaleString()}</option>
                                        ))}
                                </select>
                                <button type="button" className="btn btn-primary" onClick={handleAddService} disabled={!selectedServiceId}><Plus size={18} /></button>
                            </div>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '0.5rem', marginBottom: '0.5rem', minHeight: '120px' }}>
                            {items.filter(i => i.type === 'Service').length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '2rem', fontStyle: 'italic' }}>Belum ada jasa dipilih.</p>
                            ) : (
                                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '0.5rem' }}>Item</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'center', width: '50px' }}>Qty</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right', width: '140px' }}>Diskon (% / Rp)</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                            <th style={{ width: '30px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => item.type === 'Service' ? (
                                            <tr key={item.listId || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '0.25rem' }}>{item.name}</td>
                                                <td style={{ padding: '0.25rem', textAlign: 'right', width: '120px' }}>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        style={{ padding: '0.1rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '100%' }}
                                                        value={item.price}
                                                        onChange={(e) => handleUpdatePrice(item.listId, e.target.value)}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="input"
                                                        style={{ padding: '0.1rem', fontSize: '0.8rem', textAlign: 'center', width: '40px' }}
                                                        value={item.q}
                                                        onChange={(e) => handleUpdateQuantity(item.listId, e.target.value)}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                        <div style={{ position: 'relative', width: '50px' }}>
                                                            <input
                                                                type="number"
                                                                className="input"
                                                                style={{ padding: '0.2rem 14px 0.2rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '100%' }}
                                                                placeholder="0"
                                                                min="0"
                                                                max="100"
                                                                value={item.discountPercent !== undefined ? item.discountPercent : ''}
                                                                onChange={(e) => handleUpdateDiscount(item.listId, e.target.value, 'percent')}
                                                            />
                                                            <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>%</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            className="input"
                                                            style={{ padding: '0.2rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '80px' }}
                                                            placeholder="Rp"
                                                            value={item.discount || ''}
                                                            onChange={(e) => handleUpdateDiscount(item.listId, e.target.value, 'nominal')}
                                                        />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.25rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                    Rp {((item.price - (item.discount || 0)) * item.q).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.25rem', textAlign: 'right', width: '20px' }}>
                                                    <button type="button" onClick={() => handleRemoveItemItems(item)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : null)}
                                    </tbody>
                                </table>
                            )}
                            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Total Jasa: Rp {items.filter(i => i.type === 'Service').reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* SPAREPARTS */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Suku Cadang</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', marginBottom: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Cari Part..."
                                    value={partSearch}
                                    onChange={(e) => setPartSearch(e.target.value)}
                                    style={{ paddingRight: '2rem', fontSize: '0.85rem', padding: '0.4rem' }}
                                />
                                <Search size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select className="input" style={{ flex: 1 }} value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)}>
                                    <option value="">+ Tambah Part</option>
                                    {partsList
                                        .filter(p => p.name?.toLowerCase().includes(partSearch.toLowerCase()))
                                        .slice(0, 50)
                                        .map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (S: {p.stock}) - Rp {p.price.toLocaleString()}
                                            </option>
                                        ))}
                                </select>
                                <button type="button" className="btn btn-primary" onClick={handleAddPart} disabled={!selectedPartId}><Plus size={18} /></button>
                            </div>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '0.5rem', marginBottom: '0.5rem', minHeight: '120px' }}>
                            {items.filter(i => i.type === 'Part').length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '2rem', fontStyle: 'italic' }}>Belum ada part dipilih.</p>
                            ) : (
                                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '0.5rem' }}>Item</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'center', width: '50px' }}>Qty</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right', width: '140px' }}>Diskon (% / Rp)</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                            <th style={{ width: '30px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => item.type === 'Part' ? (
                                            <tr key={item.listId || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '0.25rem' }}>{item.name}</td>
                                                <td style={{ padding: '0.25rem', textAlign: 'right', width: '120px' }}>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        style={{ padding: '0.1rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '100%' }}
                                                        value={item.price}
                                                        onChange={(e) => handleUpdatePrice(item.listId, e.target.value)}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="input"
                                                        style={{ padding: '0.1rem', fontSize: '0.8rem', textAlign: 'center', width: '40px' }}
                                                        value={item.q}
                                                        onChange={(e) => handleUpdateQuantity(item.listId, e.target.value)}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                        <div style={{ position: 'relative', width: '50px' }}>
                                                            <input
                                                                type="number"
                                                                className="input"
                                                                style={{ padding: '0.2rem 14px 0.2rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '100%' }}
                                                                placeholder="0"
                                                                min="0"
                                                                max="100"
                                                                value={item.discountPercent !== undefined ? item.discountPercent : ''}
                                                                onChange={(e) => handleUpdateDiscount(item.listId, e.target.value, 'percent')}
                                                            />
                                                            <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>%</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            className="input"
                                                            style={{ padding: '0.2rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '80px' }}
                                                            placeholder="Rp"
                                                            value={item.discount || ''}
                                                            onChange={(e) => handleUpdateDiscount(item.listId, e.target.value, 'nominal')}
                                                        />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.25rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                    Rp {((item.price - (item.discount || 0)) * item.q).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.25rem', textAlign: 'right', width: '20px' }}>
                                                    <button type="button" onClick={() => handleRemoveItemItems(item)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : null)}
                                    </tbody>
                                </table>
                            )}
                            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Total Sparepart: Rp {items.filter(i => i.type === 'Part').reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FOOTER: SUMMARY & ACTIONS --- */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Catatan Mekanik / Keluhan</label>
                    <textarea className="input" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan pengerjaan disini..."></textarea>
                </div>

                <div>
                    <div style={{ backgroundColor: 'var(--bg-hover)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Ringkasan Biaya</h4>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span>Total Jasa</span>
                            <span>Rp {items.filter(i => i.type === 'Service').reduce((sum, item) => sum + (item.price * item.q), 0).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span>Total Sparepart</span>
                            <span>Rp {items.filter(i => i.type === 'Part').reduce((sum, item) => sum + (item.price * item.q), 0).toLocaleString()}</span>
                        </div>

                        <div style={{ borderTop: '1px dashed var(--border)', margin: '0.75rem 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                            <span>Subtotal</span>
                            <span>Rp {items.reduce((sum, item) => sum + (item.price * item.q), 0).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--danger)' }}>
                            <span>Diskon / Potongan</span>
                            <span>- Rp {items.reduce((sum, item) => sum + ((item.discount || 0) * item.q), 0).toLocaleString()}</span>
                        </div>

                        <div style={{ borderTop: '2px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Biaya</span>
                            <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>Rp {calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} onClick={handleSaveAndComplete}>
                            <Save size={18} /> Simpan & Selesai
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={async () => {
                            try {
                                await onUpdateProgress({ ...service, items, complaint: note, mechanicId, kilometer });
                                alert('Draft berhasil disimpan.');
                                onCancel();
                            } catch (e) {
                                console.error(e);
                                alert('Gagal menyimpan draft: ' + (e.message || 'Unknown error'));
                            }
                        }}>
                            Simpan Draft
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => onRevert(service)}>
                            Batal
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
