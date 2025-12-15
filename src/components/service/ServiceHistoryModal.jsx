import React, { useState, useEffect } from 'react';
import { X, Calendar, Wrench, DollarSign, FileText, User, Gauge } from 'lucide-react';
import { api } from '../../services/api';

export default function ServiceHistoryModal({ plateNumber, customerName, onClose }) {
    const [history, setHistory] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        loadData();
    }, [plateNumber]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [historyData, mechanicsData] = await Promise.all([
                api.getServiceHistory(plateNumber),
                api.getMechanics()
            ]);
            setHistory(historyData);
            setMechanics(mechanicsData);
        } catch (error) {
            console.error('Failed to load service history:', error);
            alert('Gagal memuat riwayat servis');
        } finally {
            setLoading(false);
        }
    };

    const getMechanicName = (mechanicId) => {
        const mechanic = mechanics.find(m => m.id === parseInt(mechanicId));
        return mechanic ? mechanic.name : 'Tidak diketahui';
    };

    const calculateTotal = (items) => {
        if (!items || items.length === 0) return 0;
        return items.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '1200px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Riwayat Servis
                        </h2>
                        <div style={{ color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {plateNumber}
                            </span>
                            {customerName && ` • ${customerName}`}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading...
                    </div>
                ) : history.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>Belum ada riwayat servis untuk kendaraan ini</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {history.map((service, idx) => (
                            <div
                                key={service.id}
                                style={{
                                    backgroundColor: 'var(--bg-dark)',
                                    borderRadius: 'var(--radius)',
                                    padding: '1rem',
                                    border: selectedService?.id === service.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setSelectedService(selectedService?.id === service.id ? null : service)}
                            >
                                {/* Service Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius)',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            #{service.queueNumber}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                            <Calendar size={16} />
                                            <span>{service.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                            <Wrench size={16} />
                                            <span>{service.serviceType}</span>
                                        </div>
                                        {service.mechanicId && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                                <User size={16} />
                                                <span>{getMechanicName(service.mechanicId)}</span>
                                            </div>
                                        )}
                                        {service.kilometer && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                                <Gauge size={16} />
                                                <span>{parseInt(service.kilometer).toLocaleString()} KM</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        <DollarSign size={18} />
                                        <span>Rp {calculateTotal(service.items).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Service Details (Expanded) */}
                                {selectedService?.id === service.id && (
                                    <div style={{
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--border)'
                                    }}>
                                        {/* Complaint */}
                                        {service.complaint && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Keluhan:
                                                </label>
                                                <div style={{ fontStyle: 'italic' }}>"{service.complaint}"</div>
                                            </div>
                                        )}

                                        {/* Kilometer */}
                                        {service.kilometer && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                    Kilometer:
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Gauge size={18} />
                                                    <span style={{ fontWeight: 'bold' }}>{parseInt(service.kilometer).toLocaleString()} KM</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        {service.items && service.items.length > 0 && (
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                                    Detail Pekerjaan:
                                                </label>
                                                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th>
                                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Tipe</th>
                                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Diskon</th>
                                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {service.items.map((item, itemIdx) => (
                                                            <tr key={itemIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <td style={{ padding: '0.5rem' }}>{item.name}</td>
                                                                <td style={{ padding: '0.5rem' }}>
                                                                    <span style={{
                                                                        padding: '0.15rem 0.5rem',
                                                                        borderRadius: 'var(--radius)',
                                                                        fontSize: '0.75rem',
                                                                        backgroundColor: item.type === 'Service' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                                        color: item.type === 'Service' ? '#60a5fa' : '#34d399'
                                                                    }}>
                                                                        {item.type}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.price.toLocaleString()}</td>
                                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.q}</td>
                                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{(item.discount || 0).toLocaleString()}</td>
                                                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                                    {((item.price - (item.discount || 0)) * item.q).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                                                            <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right' }}>Total:</td>
                                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--primary)', fontSize: '1.1rem' }}>
                                                                Rp {calculateTotal(service.items).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
