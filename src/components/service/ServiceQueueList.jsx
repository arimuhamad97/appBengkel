import React from 'react';
import { Clock, User, Wrench, AlertCircle } from 'lucide-react';



export default function ServiceQueueList({ queue, onSelect }) {
    if (queue.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p className="text-muted">Tidak ada antrian saat ini.</p>
            </div>
        );
    }

    return (
        <div className="no-scrollbar" style={{ display: 'grid', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem', flex: 1 }}>
            {queue.map((item) => (
                <div
                    key={item.id}
                    className="card"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                    onClick={() => onSelect(item)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '50%',
                            backgroundColor: item.status === 'In Progress' ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-hover)',
                            color: item.status === 'In Progress' ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 'bold'
                        }}>
                            {/* Display large Queue Number in icon circle */}
                            {item.queueNumber}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                {item.plateNumber} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {item.bikeModel}</span>
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={14} /> {item.customerName}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Masuk: {item.entryTime}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span style={{ marginRight: '0.5rem' }}>Klik untuk detail</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
