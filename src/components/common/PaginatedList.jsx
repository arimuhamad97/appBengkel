
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginatedList({ items = [], renderItem, itemsPerPage = 5, emptyMessage = "Tidak ada data." }) {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset ke page 1 jika items berubah totalnya (misal ganti filter tanggal)
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

    if (items.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p className="text-muted">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Scrollable Item List */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {currentItems.map((item, index) => renderItem(item, startIndex + index))}
                </div>
            </div>

            {/* Fixed Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingTop: '1rem',
                    marginTop: '1rem',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-main)', // Ensure valid background
                    flexShrink: 0  // Don't shrink
                }}>
                    <button
                        className="btn btn-outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span style={{ color: 'var(--text-muted)' }}>
                        Halaman {currentPage} dari {totalPages}
                    </span>

                    <button
                        className="btn btn-outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
