import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ServicesSettings({
    servicesList,
    newService,
    setNewService,
    handleAddService,
    handleDeleteService,
    handleUpdateService
}) {
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editingServiceData, setEditingServiceData] = useState({});

    // Search and Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const handleEditService = (service) => {
        setEditingServiceId(service.id);
        setEditingServiceData({
            name: service.name || '',
            group: service.group_type || '',
            price: service.price || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingServiceId(null);
        setEditingServiceData({});
    };

    const handleSaveEdit = async () => {
        if (!editingServiceData.name?.trim() || !editingServiceData.price) {
            alert('Nama dan Harga harus diisi!');
            return;
        }
        await handleUpdateService(editingServiceId, editingServiceData);
        setEditingServiceId(null);
        setEditingServiceData({});
    };

    // Filter and Pagination Logic
    const filteredServices = servicesList.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.group_type && service.group_type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedServices = filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset page on search
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Daftar Harga Jasa</h3>

            {/* Form Tambah Jasa */}
            <div style={{
                backgroundColor: 'var(--bg-hover)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                marginBottom: '2rem'
            }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Tambah Jasa Baru</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group">
                        <label>Nama Jasa <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Servis Berkala, Ganti Oli, dll"
                            value={newService.name || ''}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Group</label>
                        <select
                            className="input"
                            value={newService.group || ''}
                            onChange={(e) => setNewService({ ...newService, group: e.target.value })}
                        >
                            <option value="">-- Pilih Group --</option>
                            <option value="ASS I">ASS I</option>
                            <option value="ASS II">ASS II</option>
                            <option value="ASS III">ASS III</option>
                            <option value="ASS IV">ASS IV</option>
                            <option value="Servis Lengkap">Servis Lengkap</option>
                            <option value="Fast Pit">Fast Pit</option>
                            <option value="Perbaikan Berat">Perbaikan Berat</option>
                            <option value="Job Return">Job Return</option>
                            <option value="Lain-lain">Lain-lain</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Harga Jual <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            type="number"
                            className="input"
                            placeholder="50000"
                            value={newService.price || ''}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                            min="0"
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleAddService}>
                    <Plus size={18} /> Tambah Jasa
                </button>
            </div>

            {/* Daftar Jasa Search & Table */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
                        Daftar Jasa ({filteredServices.length} found)
                    </h4>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Cari nama jasa atau grup..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{ paddingLeft: '35px' }}
                        />
                    </div>
                </div>

                {filteredServices.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {searchQuery ? `Tidak ada jasa yang cocok dengan "${searchQuery}"` : 'Belum ada jasa.'}
                    </p>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.75rem' }}>Nama Jasa</th>
                                    <th style={{ padding: '0.75rem' }}>Group</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Harga</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '150px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedServices.map((service) => (
                                    <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        {editingServiceId === service.id ? (
                                            // Edit Mode
                                            <>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={editingServiceData.name}
                                                        onChange={(e) => setEditingServiceData({ ...editingServiceData, name: e.target.value })}
                                                        style={{ padding: '0.5rem', width: '100%' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <select
                                                        className="input"
                                                        value={editingServiceData.group}
                                                        onChange={(e) => setEditingServiceData({ ...editingServiceData, group: e.target.value })}
                                                        style={{ padding: '0.5rem', width: '100%' }}
                                                    >
                                                        <option value="">-- Pilih Group --</option>
                                                        <option value="ASS I">ASS I</option>
                                                        <option value="ASS II">ASS II</option>
                                                        <option value="ASS III">ASS III</option>
                                                        <option value="ASS IV">ASS IV</option>
                                                        <option value="Servis Lengkap">Servis Lengkap</option>
                                                        <option value="Fast Pit">Fast Pit</option>
                                                        <option value="Perbaikan Berat">Perbaikan Berat</option>
                                                        <option value="Job Return">Job Return</option>
                                                        <option value="Lain-lain">Lain-lain</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        value={editingServiceData.price}
                                                        onChange={(e) => setEditingServiceData({ ...editingServiceData, price: e.target.value })}
                                                        style={{ padding: '0.5rem', width: '100%', textAlign: 'right' }}
                                                        min="0"
                                                    />
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                                            onClick={handleSaveEdit}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            // Display Mode
                                            <>
                                                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{service.name}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: 'var(--bg-hover)',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {service.group_type || '-'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                    Rp {service.price.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                                            onClick={() => handleEditService(service)}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                                            onClick={() => handleDeleteService(service.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '0.5rem' }}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '0.5rem' }}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
