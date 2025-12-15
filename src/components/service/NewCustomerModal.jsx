import React, { useState, useEffect } from 'react';
import { X, Save, User, Search } from 'lucide-react';
import { api } from '../../services/api';

export default function NewCustomerModal({ plateNumber, onSave, onCancel }) {
    const [bikeTypesList, setBikeTypesList] = useState([]);
    const [filteredBikeTypes, setFilteredBikeTypes] = useState([]);
    const [bikeSearchTerm, setBikeSearchTerm] = useState('');
    const [showBikeDropdown, setShowBikeDropdown] = useState(false);

    const [customerData, setCustomerData] = useState({
        customerName: '',
        bikeModel: '',
        plateNumber: plateNumber || '',
        engineNumber: '',
        frameNumber: '',
        year: '',
        color: '',
        phoneNumber: '',
        address: '',
        kilometer: ''
    });

    useEffect(() => {
        fetchBikeTypes();
    }, []);

    useEffect(() => {
        if (bikeSearchTerm) {
            const filtered = bikeTypesList.filter(bike =>
                bike.type?.toLowerCase().includes(bikeSearchTerm.toLowerCase()) ||
                bike.code?.toLowerCase().includes(bikeSearchTerm.toLowerCase()) ||
                bike.category?.toLowerCase().includes(bikeSearchTerm.toLowerCase())
            );
            setFilteredBikeTypes(filtered);
        } else {
            setFilteredBikeTypes(bikeTypesList);
        }
    }, [bikeSearchTerm, bikeTypesList]);

    const fetchBikeTypes = async () => {
        try {
            const data = await api.getBikeTypes();
            setBikeTypesList(data);
            setFilteredBikeTypes(data);
        } catch (err) {
            console.error("Failed to fetch bike types", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData({ ...customerData, [name]: value });
    };

    const handleBikeSearch = (value) => {
        setBikeSearchTerm(value);
        setCustomerData({ ...customerData, bikeModel: value });
        setShowBikeDropdown(true);
    };

    const handleSelectBike = (bike) => {
        const bikeDisplay = `${bike.type}${bike.code ? ' (' + bike.code + ')' : ''}`;
        setCustomerData({ ...customerData, bikeModel: bikeDisplay });
        setBikeSearchTerm(bikeDisplay);
        setShowBikeDropdown(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!customerData.customerName || !customerData.bikeModel || !customerData.phoneNumber) {
            alert('Nama, Type Motor, dan No. HP harus diisi!');
            return;
        }

        onSave(customerData);
    };

    return (
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
            <div className="card" style={{ width: '800px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    borderBottom: '2px solid var(--primary)',
                    paddingBottom: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            color: 'var(--primary)'
                        }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
                                Data Konsumen Baru
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                Nomor polisi <strong>{plateNumber}</strong> belum terdaftar
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                        {/* Row 1: Nama & No HP */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Nama Pemilik <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="text"
                                    name="customerName"
                                    className="input"
                                    placeholder="Nama lengkap"
                                    value={customerData.customerName}
                                    onChange={handleChange}
                                    autoFocus
                                />
                            </div>
                            <div className="input-group">
                                <label>No. HP <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    className="input"
                                    placeholder="08123456789"
                                    value={customerData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Row 2: Type Motor (Searchable) & No Polisi */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label>Type Motor <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Cari type motor..."
                                        value={bikeSearchTerm}
                                        onChange={(e) => handleBikeSearch(e.target.value)}
                                        onFocus={() => setShowBikeDropdown(true)}
                                        style={{ paddingRight: '2rem' }}
                                    />
                                    <Search size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
                                </div>

                                {showBikeDropdown && filteredBikeTypes.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'var(--bg-dark)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        zIndex: 1000,
                                        marginTop: '0.25rem'
                                    }}>
                                        {filteredBikeTypes.map((bike) => (
                                            <div
                                                key={bike.id}
                                                onClick={() => handleSelectBike(bike)}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border)'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ fontWeight: 'bold' }}>
                                                    {bike.type} {bike.code && `(${bike.code})`}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {bike.category && `${bike.category} • `}
                                                    {(bike.year_from || bike.year_to) && `${bike.year_from || '?'}-${bike.year_to || '?'}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="input-group">
                                <label>No. Polisi</label>
                                <input
                                    type="text"
                                    name="plateNumber"
                                    className="input"
                                    value={customerData.plateNumber}
                                    onChange={handleChange}
                                    style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Row 3: Alamat */}
                        <div className="input-group">
                            <label>Alamat</label>
                            <textarea
                                name="address"
                                className="input"
                                placeholder="Alamat lengkap"
                                value={customerData.address}
                                onChange={handleChange}
                                rows="2"
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {/* Row 4: No Mesin, No Rangka, Tahun */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>No. Mesin</label>
                                <input
                                    type="text"
                                    name="engineNumber"
                                    className="input"
                                    placeholder="JF51E1234567"
                                    value={customerData.engineNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>No. Rangka</label>
                                <input
                                    type="text"
                                    name="frameNumber"
                                    className="input"
                                    placeholder="MH1JF511234567"
                                    value={customerData.frameNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>Tahun Rakit</label>
                                <input
                                    type="number"
                                    name="year"
                                    className="input"
                                    placeholder="2020"
                                    value={customerData.year}
                                    onChange={handleChange}
                                    min="1900"
                                    max="2099"
                                />
                            </div>
                        </div>

                        {/* Row 5: Warna & Kilometer */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Warna</label>
                                <input
                                    type="text"
                                    name="color"
                                    className="input"
                                    placeholder="Hitam, Merah, dll"
                                    value={customerData.color}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>Kilometer</label>
                                <input
                                    type="number"
                                    name="kilometer"
                                    className="input"
                                    placeholder="10000"
                                    value={customerData.kilometer}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '1rem'
                    }}>
                        <button type="button" className="btn btn-outline" onClick={onCancel}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} /> Simpan & Lanjutkan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
