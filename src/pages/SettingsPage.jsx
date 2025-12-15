import React, { useState, useEffect } from 'react';
import { Save, User, Settings as SettingsIcon, Plus, Trash2, Search, ChevronLeft, ChevronRight, Edit2, X, Check } from 'lucide-react';
import { mockMechanics, mockServices } from '../data/mockData';
import { api } from '../services/api';
import ServicesSettings from '../components/settings/ServicesSettings';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('workshop');
    const [workshopName, setWorkshopName] = useState('Bengkel Motor Pro');
    const [mechanics, setMechanics] = useState([]);
    const [services, setServices] = useState(mockServices);

    const [bikeTypes, setBikeTypes] = useState([]);
    const [partTypes, setPartTypes] = useState([]);
    const [newBikeType, setNewBikeType] = useState({
        type: '',
        code: '',
        year_from: '',
        year_to: '',
        engine_serial: '',
        frame_serial: '',
        category: ''
    });
    const [newPartType, setNewPartType] = useState({
        code: '',
        name: '',
        group_type: '',
        unit: '',
        sell_price: '',
        cost_price: ''
    });
    const [newService, setNewService] = useState({
        name: '',
        group: '',
        price: ''
    });
    const [servicesList, setServicesList] = useState([]);
    const [newMechanic, setNewMechanic] = useState({
        name: '',
        phone: '',
        address: '',
        role: 'Mekanik'
    });

    // Pagination and search state for part types
    const [partSearchQuery, setPartSearchQuery] = useState('');
    const [partCurrentPage, setPartCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Edit state for part types
    const [editingPartId, setEditingPartId] = useState(null);
    const [editingPartData, setEditingPartData] = useState({});

    useEffect(() => {
        if (activeTab === 'bikeTypes') {
            fetchBikeTypes();
        } else if (activeTab === 'partTypes') {
            fetchPartTypes();
            // Reset search and pagination when switching to part types tab
            setPartSearchQuery('');
            setPartCurrentPage(1);
        } else if (activeTab === 'services') {
            fetchServices();
        } else if (activeTab === 'mechanics') {
            fetchMechanics();
        }
    }, [activeTab]);

    const fetchBikeTypes = async () => {
        try {
            const data = await api.getBikeTypes();
            setBikeTypes(data);
        } catch (err) {
            console.error("Failed to fetch bike types", err);
        }
    };

    const fetchPartTypes = async () => {
        try {
            const data = await api.getPartTypes();
            setPartTypes(data);
        } catch (err) {
            console.error("Failed to fetch part types", err);
        }
    };

    const fetchServices = async () => {
        try {
            const data = await api.getServices();
            setServicesList(data);
        } catch (err) {
            console.error("Failed to fetch services", err);
        }
    };

    const fetchMechanics = async () => {
        try {
            const data = await api.getMechanics();
            setMechanics(data);
        } catch (err) {
            console.error("Failed to fetch mechanics", err);
        }
    };

    const handleAddBikeType = async () => {
        if (!newBikeType.type?.trim()) {
            alert('Tipe Motor harus diisi!');
            return;
        }
        try {
            const dataToSend = {
                type: newBikeType.type.trim(),
                code: newBikeType.code?.trim() || null,
                year_from: newBikeType.year_from ? parseInt(newBikeType.year_from) : null,
                year_to: newBikeType.year_to ? parseInt(newBikeType.year_to) : null,
                engine_serial: newBikeType.engine_serial?.trim() || null,
                frame_serial: newBikeType.frame_serial?.trim() || null,
                category: newBikeType.category || null
            };
            await api.createBikeType(dataToSend);
            setNewBikeType({ type: '', code: '', year_from: '', year_to: '', engine_serial: '', frame_serial: '', category: '' });
            fetchBikeTypes();
            alert('Type motor berhasil ditambahkan!');
        } catch (err) {
            console.error("Failed to add bike type", err);
            alert('Gagal menambahkan type motor');
        }
    };

    const handleDeleteBikeType = async (id) => {
        if (!confirm('Hapus type motor ini?')) return;
        try {
            await api.deleteBikeType(id);
            fetchBikeTypes();
            alert('Type motor berhasil dihapus!');
        } catch (err) {
            console.error("Failed to delete bike type", err);
            alert('Gagal menghapus type motor');
        }
    };

    const handleAddPartType = async () => {
        if (!newPartType.name?.trim()) {
            alert('Nama sparepart harus diisi!');
            return;
        }
        try {
            const dataToSend = {
                code: newPartType.code?.trim() || null,
                name: newPartType.name.trim(),
                group_type: newPartType.group_type || null,
                unit: newPartType.unit || null,
                sell_price: newPartType.sell_price ? parseInt(newPartType.sell_price) : null,
                cost_price: newPartType.cost_price ? parseInt(newPartType.cost_price) : null
            };
            await api.createPartType(dataToSend);
            setNewPartType({ code: '', name: '', group_type: '', unit: '', sell_price: '', cost_price: '' });
            fetchPartTypes();
            alert('Jenis sparepart berhasil ditambahkan!');
        } catch (err) {
            console.error("Failed to add part type", err);
            alert('Gagal menambahkan jenis sparepart');
        }
    };

    const handleDeletePartType = async (id) => {
        if (!confirm('Hapus jenis sparepart ini?')) return;
        try {
            await api.deletePartType(id);
            fetchPartTypes();
            alert('Jenis sparepart berhasil dihapus!');
        } catch (err) {
            console.error("Failed to delete part type", err);
            alert('Gagal menghapus jenis sparepart');
        }
    };

    const handleEditPartType = (part) => {
        setEditingPartId(part.id);
        setEditingPartData({
            code: part.code || '',
            name: part.name || '',
            group_type: part.group_type || '',
            unit: part.unit || '',
            sell_price: part.sell_price || '',
            cost_price: part.cost_price || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingPartId(null);
        setEditingPartData({});
    };

    const handleUpdatePartType = async () => {
        if (!editingPartData.name?.trim()) {
            alert('Nama harus diisi!');
            return;
        }
        try {
            const dataToSend = {
                code: editingPartData.code?.trim() || null,
                name: editingPartData.name.trim(),
                group_type: editingPartData.group_type || null,
                unit: editingPartData.unit || null,
                sell_price: editingPartData.sell_price ? parseInt(editingPartData.sell_price) : null,
                cost_price: editingPartData.cost_price ? parseInt(editingPartData.cost_price) : null
            };
            await api.updatePartType(editingPartId, dataToSend);
            setEditingPartId(null);
            setEditingPartData({});
            fetchPartTypes();
            alert('✅ Jenis sparepart berhasil diupdate!');
        } catch (err) {
            console.error("Failed to update part type", err);
            alert('❌ Gagal mengupdate jenis sparepart');
        }
    };

    const handleAddService = async () => {
        if (!newService.name?.trim() || !newService.price) {
            alert('Nama dan Harga harus diisi!');
            return;
        }
        try {
            const dataToSend = {
                name: newService.name.trim(),
                group: newService.group || null,
                price: parseInt(newService.price)
            };
            await api.createService(dataToSend);
            setNewService({ name: '', group: '', price: '' });
            fetchServices();
            alert('Jasa berhasil ditambahkan!');
        } catch (err) {
            console.error("Failed to add service", err);
            alert('Gagal menambahkan jasa');
        }
    };

    const handleDeleteService = async (id) => {
        if (!confirm('Hapus jasa ini?')) return;
        try {
            await api.deleteService(id);
            fetchServices();
            alert('Jasa berhasil dihapus!');
        } catch (err) {
            console.error("Failed to delete service", err);
            alert('Gagal menghapus jasa');
        }
    };

    const handleAddMechanic = async () => {
        if (!newMechanic.name?.trim()) {
            alert('Nama karyawan harus diisi!');
            return;
        }
        try {
            const dataToSend = {
                name: newMechanic.name.trim(),
                phone: newMechanic.phone?.trim() || null,
                address: newMechanic.address?.trim() || null,
                role: newMechanic.role || 'Mekanik',
                status: 'Available'
            };
            await api.createMechanic(dataToSend);
            setNewMechanic({ name: '', phone: '', address: '', role: 'Mekanik' });
            fetchMechanics();
            alert('Karyawan berhasil ditambahkan!');
        } catch (err) {
            console.error("Failed to add mechanic", err);
            alert('Gagal menambahkan karyawan');
        }
    };

    const handleDeleteMechanic = async (id) => {
        if (!confirm('Hapus mekanik ini?')) return;
        try {
            await api.deleteMechanic(id);
            fetchMechanics();
            alert('Mekanik berhasil dihapus!');
        } catch (err) {
            console.error("Failed to delete mechanic", err);
            alert('Gagal menghapus mekanik');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Pengaturan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Kelola data bengkel dan master data.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${activeTab === 'workshop' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('workshop')}
                >
                    Profil Bengkel
                </button>
                <button
                    className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('services')}
                >
                    Daftar Jasa (Harga)
                </button>
                <button
                    className={`btn ${activeTab === 'mechanics' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('mechanics')}
                >
                    Karyawan
                </button>
                <button
                    className={`btn ${activeTab === 'bikeTypes' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('bikeTypes')}
                >
                    Type Motor
                </button>
                <button
                    className={`btn ${activeTab === 'partTypes' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('partTypes')}
                >
                    Jenis Sparepart
                </button>
            </div>

            <div className="card">
                {activeTab === 'workshop' && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>Informasi Bengkel</h3>
                        <div style={{ maxWidth: '500px' }}>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nama Bengkel</label>
                                <input type="text" className="input" value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} />
                            </div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Alamat</label>
                                <textarea className="input" rows="3" defaultValue="Jl. Raya Otomotif No. 1, Jakarta Selatan"></textarea>
                            </div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Motto / Pesan Struk</label>
                                <input type="text" className="input" defaultValue="Terima kasih telah mempercayakan kendaraan Anda pada kami." />
                            </div>
                            <button className="btn btn-primary" onClick={() => alert('Pengaturan Disimpan!')}>
                                <Save size={18} /> Simpan Perubahan
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <ServicesSettings
                        servicesList={servicesList}
                        newService={newService}
                        setNewService={setNewService}
                        handleAddService={handleAddService}
                        handleDeleteService={handleDeleteService}
                    />
                )}

                {activeTab === 'mechanics' && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>Karyawan</h3>
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-dark)' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Tambah Karyawan Baru</h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1.5fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Nama Karyawan <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="text" className="input" placeholder="Nama lengkap" value={newMechanic.name || ''} onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>No. Telepon</label>
                                        <input type="text" className="input" placeholder="08123456789" value={newMechanic.phone || ''} onChange={(e) => setNewMechanic({ ...newMechanic, phone: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Alamat</label>
                                        <input type="text" className="input" placeholder="Alamat lengkap" value={newMechanic.address || ''} onChange={(e) => setNewMechanic({ ...newMechanic, address: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Role <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <select className="input" value={newMechanic.role || 'Mekanik'} onChange={(e) => setNewMechanic({ ...newMechanic, role: e.target.value })}>
                                            <option value="Mekanik">🔧 Mekanik</option>
                                            <option value="Front Desk">💼 Front Desk</option>
                                            <option value="Gudang">📦 Gudang</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={handleAddMechanic}>
                                    <Plus size={18} /> Tambah Karyawan
                                </button>
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '1rem' }}>Daftar Karyawan</h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {mechanics.length === 0 && (
                                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Belum ada karyawan. Tambahkan karyawan di atas.
                                </p>
                            )}
                            {mechanics.map((m) => {
                                const getRoleBadgeColor = (role) => {
                                    switch (role) {
                                        case 'Mekanik': return '#0ea5e9';
                                        case 'Front Desk': return '#10b981';
                                        case 'Gudang':
                                        case 'Gudang Management': return '#f97316';
                                        default: return '#6b7280';
                                    }
                                };

                                const getRoleIcon = (role) => {
                                    switch (role) {
                                        case 'Mekanik': return '🔧';
                                        case 'Front Desk': return '💼';
                                        case 'Gudang':
                                        case 'Gudang Management': return '📦';
                                        default: return '👤';
                                    }
                                };

                                const displayRole = m.role === 'Gudang Management' ? 'Gudang' : (m.role || 'Mekanik');

                                return (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-dark)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{m.name}</div>
                                                    <span style={{
                                                        padding: '0.35rem 0.85rem',
                                                        borderRadius: '16px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        backgroundColor: getRoleBadgeColor(m.role),
                                                        color: 'white',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <span>{getRoleIcon(m.role)}</span>
                                                        <span>{displayRole}</span>
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    {m.phone && <span>📞 {m.phone}</span>}
                                                    {m.address && <span>📍 {m.address}</span>}
                                                    <span style={{ color: m.status === 'Available' ? 'var(--success)' : 'var(--primary)' }}>
                                                        ● {m.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteMechanic(m.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'bikeTypes' && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>Type Motor</h3>
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-dark)' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Tambah Type Motor Baru</h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Tipe Motor <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="text" className="input" placeholder="Contoh: Honda Beat" value={newBikeType.type || ''} onChange={(e) => setNewBikeType({ ...newBikeType, type: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Kode Motor</label>
                                        <input type="text" className="input" placeholder="BT110" value={newBikeType.code || ''} onChange={(e) => setNewBikeType({ ...newBikeType, code: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Jenis</label>
                                        <select className="input" value={newBikeType.category || ''} onChange={(e) => setNewBikeType({ ...newBikeType, category: e.target.value })}>
                                            <option value="">-- Pilih --</option>
                                            <option value="CUB">CUB</option>
                                            <option value="Matic">Matic</option>
                                            <option value="CBU">CBU</option>
                                            <option value="Sport">Sport</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Tahun Dari</label>
                                        <input type="number" className="input" placeholder="2020" value={newBikeType.year_from || ''} onChange={(e) => setNewBikeType({ ...newBikeType, year_from: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Sampai Tahun</label>
                                        <input type="number" className="input" placeholder="2024" value={newBikeType.year_to || ''} onChange={(e) => setNewBikeType({ ...newBikeType, year_to: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>No Seri Mesin</label>
                                        <input type="text" className="input" placeholder="JF51E" value={newBikeType.engine_serial || ''} onChange={(e) => setNewBikeType({ ...newBikeType, engine_serial: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>No Seri Rangka</label>
                                        <input type="text" className="input" placeholder="MH1JF51" value={newBikeType.frame_serial || ''} onChange={(e) => setNewBikeType({ ...newBikeType, frame_serial: e.target.value })} />
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={handleAddBikeType}>
                                    <Plus size={18} /> Tambah
                                </button>
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '1rem' }}>Daftar Type Motor</h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {bikeTypes.length === 0 && (
                                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Belum ada type motor. Tambahkan type motor di atas.
                                </p>
                            )}
                            {bikeTypes.map((type) => (
                                <div key={type.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-dark)' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {type.type} {type.code && `(${type.code})`}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            {type.category && <span>Jenis: {type.category}</span>}
                                            {(type.year_from || type.year_to) && (
                                                <span>Tahun: {type.year_from || '?'} - {type.year_to || '?'}</span>
                                            )}
                                            {type.engine_serial && <span>Mesin: {type.engine_serial}</span>}
                                            {type.frame_serial && <span>Rangka: {type.frame_serial}</span>}
                                        </div>
                                    </div>
                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteBikeType(type.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'partTypes' && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>Jenis Sparepart</h3>
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-dark)' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Tambah Jenis Sparepart Baru</h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Kode Sparepart</label>
                                        <input type="text" className="input" placeholder="SP001" value={newPartType.code || ''} onChange={(e) => setNewPartType({ ...newPartType, code: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Nama <span style={{ color: 'var(--danger)' }}>*</span></label>
                                        <input type="text" className="input" placeholder="Oli Mesin" value={newPartType.name || ''} onChange={(e) => setNewPartType({ ...newPartType, name: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Group</label>
                                        <select className="input" value={newPartType.group_type || ''} onChange={(e) => setNewPartType({ ...newPartType, group_type: e.target.value })}>
                                            <option value="">-- Pilih --</option>
                                            <option value="HGP">HGP</option>
                                            <option value="Oli">Oli</option>
                                            <option value="Non HGP">Non HGP</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Satuan</label>
                                        <select className="input" value={newPartType.unit || ''} onChange={(e) => setNewPartType({ ...newPartType, unit: e.target.value })}>
                                            <option value="">-- Pilih --</option>
                                            <option value="Set">Set</option>
                                            <option value="Pcs">Pcs</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Harga Jual</label>
                                        <input type="number" className="input" placeholder="50000" value={newPartType.sell_price || ''} onChange={(e) => setNewPartType({ ...newPartType, sell_price: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Harga Pokok</label>
                                        <input type="number" className="input" placeholder="40000" value={newPartType.cost_price || ''} onChange={(e) => setNewPartType({ ...newPartType, cost_price: e.target.value })} />
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={handleAddPartType}>
                                    <Plus size={18} /> Tambah
                                </button>
                            </div>
                        </div>

                        {/* Search Box */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', maxWidth: '400px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Cari berdasarkan kode atau nama sparepart..."
                                    value={partSearchQuery}
                                    onChange={(e) => {
                                        setPartSearchQuery(e.target.value);
                                        setPartCurrentPage(1); // Reset to first page on search
                                    }}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '1rem' }}>
                            Daftar Jenis Sparepart
                            {(() => {
                                // Filter logic
                                const filteredParts = partTypes.filter(type => {
                                    if (!partSearchQuery) return true;
                                    const search = partSearchQuery.toLowerCase();
                                    const code = type.code?.toLowerCase() || '';
                                    const name = type.name?.toLowerCase() || '';
                                    return code.includes(search) || name.includes(search);
                                });

                                return filteredParts.length > 0 ? (
                                    <span style={{ fontWeight: 'normal', fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                                        ({filteredParts.length} {partSearchQuery ? 'hasil ditemukan' : 'total'})
                                    </span>
                                ) : null;
                            })()}
                        </h4>

                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {(() => {
                                // Filter parts based on search query
                                const filteredParts = partTypes.filter(type => {
                                    if (!partSearchQuery) return true;
                                    const search = partSearchQuery.toLowerCase();
                                    const code = type.code?.toLowerCase() || '';
                                    const name = type.name?.toLowerCase() || '';
                                    return code.includes(search) || name.includes(search);
                                });

                                if (filteredParts.length === 0) {
                                    return (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                                            {partSearchQuery
                                                ? `Tidak ada sparepart yang cocok dengan "${partSearchQuery}"`
                                                : 'Belum ada jenis sparepart. Tambahkan jenis sparepart di atas.'}
                                        </p>
                                    );
                                }

                                // Pagination logic
                                const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE);
                                const startIndex = (partCurrentPage - 1) * ITEMS_PER_PAGE;
                                const endIndex = startIndex + ITEMS_PER_PAGE;
                                const paginatedParts = filteredParts.slice(startIndex, endIndex);

                                return (
                                    <>
                                        {paginatedParts.map((type) => (
                                            <div key={type.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-dark)' }}>
                                                {editingPartId === type.id ? (
                                                    // Edit Mode
                                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                            <div className="input-group">
                                                                <label>Kode Sparepart</label>
                                                                <input
                                                                    type="text"
                                                                    className="input"
                                                                    value={editingPartData.code}
                                                                    onChange={(e) => setEditingPartData({ ...editingPartData, code: e.target.value })}
                                                                    style={{ padding: '0.5rem' }}
                                                                />
                                                            </div>
                                                            <div className="input-group">
                                                                <label>Nama <span style={{ color: 'var(--danger)' }}>*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="input"
                                                                    value={editingPartData.name}
                                                                    onChange={(e) => setEditingPartData({ ...editingPartData, name: e.target.value })}
                                                                    style={{ padding: '0.5rem' }}
                                                                />
                                                            </div>
                                                            <div className="input-group">
                                                                <label>Group</label>
                                                                <select
                                                                    className="input"
                                                                    value={editingPartData.group_type}
                                                                    onChange={(e) => setEditingPartData({ ...editingPartData, group_type: e.target.value })}
                                                                    style={{ padding: '0.5rem' }}
                                                                >
                                                                    <option value="">-- Pilih --</option>
                                                                    <option value="HGP">HGP</option>
                                                                    <option value="Oli">Oli</option>
                                                                    <option value="Non HGP">Non HGP</option>
                                                                </select>
                                                            </div>
                                                            <div className="input-group">
                                                                <label>Satuan</label>
                                                                <select
                                                                    className="input"
                                                                    value={editingPartData.unit}
                                                                    onChange={(e) => setEditingPartData({ ...editingPartData, unit: e.target.value })}
                                                                    style={{ padding: '0.5rem' }}
                                                                >
                                                                    <option value="">-- Pilih --</option>
                                                                    <option value="Set">Set</option>
                                                                    <option value="Pcs">Pcs</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                            <div className="input-group">
                                                                <label>Harga Jual</label>
                                                                <input
                                                                    type="number"
                                                                    className="input"
                                                                    value={editingPartData.sell_price}
                                                                    onChange={(e) => setEditingPartData({ ...editingPartData, sell_price: e.target.value })}
                                                                    style={{ padding: '0.5rem' }}
                                                                />
                                                            </div>
                                                            <div className="input-group">
                                                                <label>Harga Pokok</label>
                                                                <input
                                                                    type="number"
                                                                    className="input"
                                                                    value={editingPartData.cost_price}
                                                                    onChange={(e) => setEditingPartData({ ...editingPartData, cost_price: e.target.value })}
                                                                    style={{ padding: '0.5rem' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                            <button className="btn btn-outline" onClick={handleCancelEdit} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <X size={16} /> Batal
                                                            </button>
                                                            <button className="btn btn-primary" onClick={handleUpdatePartType} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Check size={16} /> Simpan
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Display Mode
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                                {type.code && `[${type.code}] `}{type.name}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                                {type.group_type && <span>Group: {type.group_type}</span>}
                                                                {type.unit && <span>Satuan: {type.unit}</span>}
                                                                {type.sell_price && <span>Harga Jual: Rp {type.sell_price.toLocaleString()}</span>}
                                                                {type.cost_price && <span>Harga Pokok: Rp {type.cost_price.toLocaleString()}</span>}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleEditPartType(type)}>
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeletePartType(type.id)}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setPartCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={partCurrentPage === 1}
                                                    style={{ padding: '0.5rem 1rem' }}
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>

                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                                        // Show first page, last page, current page, and pages around current
                                                        if (
                                                            pageNum === 1 ||
                                                            pageNum === totalPages ||
                                                            (pageNum >= partCurrentPage - 1 && pageNum <= partCurrentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    className={`btn ${pageNum === partCurrentPage ? 'btn-primary' : 'btn-outline'}`}
                                                                    onClick={() => setPartCurrentPage(pageNum)}
                                                                    style={{ padding: '0.5rem 1rem', minWidth: '40px' }}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        } else if (
                                                            pageNum === partCurrentPage - 2 ||
                                                            pageNum === partCurrentPage + 2
                                                        ) {
                                                            return <span key={pageNum} style={{ padding: '0 0.5rem' }}>...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>

                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setPartCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={partCurrentPage === totalPages}
                                                    style={{ padding: '0.5rem 1rem' }}
                                                >
                                                    <ChevronRight size={18} />
                                                </button>

                                                <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    Halaman {partCurrentPage} dari {totalPages}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
