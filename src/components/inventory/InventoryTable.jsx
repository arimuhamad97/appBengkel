import React, { useState } from 'react';
import { Package, AlertTriangle, Edit2, PackageX, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InventoryTable({ items, onAction }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Filter logic
    const filteredItems = items ? items.filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            (item.name && item.name.toLowerCase().includes(search)) ||
            (item.id && item.id.toLowerCase().includes(search)) ||
            (item.category && item.category.toLowerCase().includes(search))
        );
    }) : [];

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Empty state
    if (!items || items.length === 0) {
        return (
            <div style={{
                backgroundColor: 'var(--bg-dark)',
                borderRadius: 'var(--radius)',
                padding: '4rem 2rem',
                textAlign: 'center'
            }}>
                <PackageX size={64} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Belum Ada Data Sparepart</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Klik tombol "STOK MASUK" untuk menambahkan sparepart pertama Anda.
                </p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-dark)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

            {/* Search Bar */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'stretch'
            }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <input
                        type="text"
                        placeholder="Cari sparepart..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                        }}
                    />
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {filteredItems.length > 0 ? (
                        <>Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} dari {filteredItems.length} barang</>
                    ) : (
                        <>Tidak ada data</>
                    )}
                </div>
            </div>

            {/* Table Wrapper - Scrollable on mobile */}
            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{
                            borderBottom: '2px solid var(--border)',
                            textAlign: 'left',
                            backgroundColor: 'var(--bg-hover)',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <th style={{ padding: '1rem 1.25rem' }}>Kode</th>
                            <th style={{ padding: '1rem 1.25rem' }}>Nama Sparepart</th>
                            <th style={{ padding: '1rem 1.25rem' }}>Group</th>
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Harga Jual</th>
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>Stok</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Tidak ada data'}
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr
                                    key={item.id}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <td style={{
                                        padding: '1rem 1.25rem',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        color: 'var(--primary)',
                                        fontWeight: '600'
                                    }}>
                                        {item.id}
                                    </td>
                                    <td style={{
                                        padding: '1rem 1.25rem',
                                        fontWeight: '500',
                                        fontSize: '0.95rem'
                                    }}>
                                        {item.name}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.3rem 0.75rem',
                                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                            color: 'var(--primary)',
                                            borderRadius: '99px',
                                            fontWeight: '500',
                                            border: '1px solid rgba(249, 115, 22, 0.2)'
                                        }}>
                                            {item.category || 'Umum'}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: '1rem 1.25rem',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        fontSize: '0.95rem'
                                    }}>
                                        Rp {(item.price || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td style={{
                                        padding: '1rem 1.25rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '0.95rem'
                                    }}>
                                        {item.stock || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{item.unit || ''}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderTop: '1px solid var(--border)'
                }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                            // Show first page, last page, current page, and pages around current
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        className={`btn ${pageNum === currentPage ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={{ padding: '0.4rem 0.8rem', minWidth: '36px', fontSize: '0.875rem' }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 ||
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} style={{ padding: '0 0.25rem', fontSize: '0.875rem' }}>...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        className="btn btn-outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                    >
                        <ChevronRight size={16} />
                    </button>

                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
                        Halaman {currentPage} dari {totalPages}
                    </span>
                </div>
            )}
        </div>
    );
}
