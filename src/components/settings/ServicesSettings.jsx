import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ServicesSettings({
    servicesList,
    newService,
    setNewService,
    handleAddService,
    handleDeleteService
}) {
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

            {/* Daftar Jasa */}
            <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                    Daftar Jasa ({servicesList.length})
                </h4>
                {servicesList.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Belum ada jasa. Tambahkan jasa baru di atas.
                    </p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '0.75rem' }}>Nama Jasa</th>
                                <th style={{ padding: '0.75rem' }}>Group</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Harga</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center', width: '100px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servicesList.map((service) => (
                                <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
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
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                            onClick={() => handleDeleteService(service.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
