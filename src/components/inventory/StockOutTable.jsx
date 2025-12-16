import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function StockOutTable({ items }) {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when items change
    useEffect(() => {
        setCurrentPage(1);
    }, [items?.length]);

    if (!items || items.length === 0) {
        return (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Belum ada data stok keluar.
            </p>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--bg-hover)' }}>
                            <th style={{ padding: '1rem' }}>Tanggal</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Ref ID</th>
                            <th style={{ padding: '1rem' }}>Kode Part</th>
                            <th style={{ padding: '1rem' }}>Nama Part</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.8rem 1rem' }}>{item.date && new Date(item.date).toLocaleDateString('id-ID')}</td>
                                <td style={{ padding: '0.8rem 1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: item.type === 'Service' ? 'rgba(59, 130, 246, 0.1)' : item.type === 'Opname' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        color: item.type === 'Service' ? '#3b82f6' : item.type === 'Opname' ? '#ef4444' : '#eab308',
                                        fontSize: '0.8rem'
                                    }}>
                                        {item.type || 'Unknown'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace' }}>{item.reference_id || '-'}</td>
                                <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace' }}>{item.code}</td>
                                <td style={{ padding: '0.8rem 1rem' }}>{item.name}</td>
                                <td style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--danger)' }}>
                                    -{item.qty} {item.unit}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderTop: '1px solid var(--border)',
                    marginTop: 'auto',
                    backgroundColor: 'var(--bg-card)'
                }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Menampilkan {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, items.length)} dari {items.length} data
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.4rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: currentPage === 1 ? 'var(--bg-sub)' : 'var(--bg-card)',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                                display: 'flex'
                            }}
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.4rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: currentPage === 1 ? 'var(--bg-sub)' : 'var(--bg-card)',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                                display: 'flex'
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span style={{ margin: '0 0.5rem', fontSize: '0.9rem' }}>
                            Halaman {currentPage} dari {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.4rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: currentPage === totalPages ? 'var(--bg-sub)' : 'var(--bg-card)',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                                display: 'flex'
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.4rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: currentPage === totalPages ? 'var(--bg-sub)' : 'var(--bg-card)',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                                display: 'flex'
                            }}
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
