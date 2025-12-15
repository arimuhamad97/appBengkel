import React, { useState, useEffect } from 'react';
import { Save, Search, RefreshCw, List, X, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export default function StockOpnameTable({ onRefresh }) {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [opnameHistory, setOpnameHistory] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // State untuk menyimpan input fisik. Format: { itemId: physicalQty }
    const [physicalStocks, setPhysicalStocks] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getInventory();
            setItems(data);

            // Inisialisasi stok fisik sama dengan stok sistem
            const initialPhysical = {};
            data.forEach(item => {
                initialPhysical[item.id] = item.stock;
            });
            setPhysicalStocks(initialPhysical);
        } catch (error) {
            console.error('Failed to load inventory for opname:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhysicalChange = (id, value) => {
        if (value === '') {
            setPhysicalStocks(prev => ({ ...prev, [id]: '' }));
            return;
        }
        const val = parseInt(value);
        if (!isNaN(val)) {
            setPhysicalStocks(prev => ({ ...prev, [id]: val }));
        }
    };

    const handleSaveOpname = async () => {
        // Cari item yang ada selisih saja
        const adjustments = items.filter(item => {
            const physical = physicalStocks[item.id];
            return physical !== undefined && physical !== '' && parseInt(physical) !== item.stock;
        }).map(item => ({
            id: item.id,
            name: item.name,
            systemStock: item.stock,
            physicalStock: parseInt(physicalStocks[item.id]),
            diff: parseInt(physicalStocks[item.id]) - item.stock,
            price: item.price
        }));

        if (adjustments.length === 0) {
            alert('Tidak ada perubahan stok (selisih) untuk disimpan.');
            return;
        }

        if (!window.confirm(`Simpan penyesuaian stok untuk ${adjustments.length} item?`)) return;

        try {
            const res = await api.saveOpname({ items: adjustments });
            if (res.success) {
                alert('Stok Opname Berhasil Disimpan!');
                loadData(); // Reload
                if (onRefresh) onRefresh();
            } else {
                alert('Gagal: ' + res.error);
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menyimpan opname.');
        }
    };

    const filteredItems = items.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Hitung total selisih
    const totalDiffItems = items.reduce((acc, item) => {
        const physical = physicalStocks[item.id];
        if (physical !== undefined && physical !== item.stock) return acc + 1;
        return acc;
    }, 0);


    const handleViewHistory = async () => {
        try {
            // Load stock_in and stock_out records that are opname adjustments
            const [stockIn, stockOut] = await Promise.all([
                api.getStockIn(),
                api.getStockOut()
            ]);

            // Filter opname records - preserve original data
            const opnameIn = stockIn
                .filter(item => item.name && item.name.includes('(Opname Adjustment)'))
                .map(item => ({
                    ...item, // Keep all original fields including 'name'
                    type: 'Surplus',
                    displayName: item.name.replace(' (Opname Adjustment)', ''),
                    source: 'stock_in' // Add source identifier
                }));

            const opnameOut = stockOut
                .filter(item => item.type === 'Opname')
                .map(item => ({
                    ...item, // Keep all original fields
                    type: item.reference_id?.startsWith('TRANSFER') ? 'Transfer' : 'Loss',
                    displayName: item.name.replace(' (Opname Adjustment)', ''),
                    source: 'stock_out' // Add source identifier
                }));

            // Combine and sort by date
            const combined = [...opnameIn, ...opnameOut].sort((a, b) => {
                const dateA = new Date(a.date || a.created_at);
                const dateB = new Date(b.date || b.created_at);
                return dateB - dateA; // Newest first
            });

            setOpnameHistory(combined);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('Failed to load opname history:', error);
            alert('Gagal memuat riwayat opname');
        }
    };

    const handleDeleteOpname = async (record) => {
        const confirmMsg = `Hapus record opname ini?\n\nBarang: ${record.displayName}\nQty: ${record.qty}\nTipe: ${record.type}\n\nStok akan dikembalikan ke kondisi sebelum opname.`;

        if (!window.confirm(confirmMsg)) return;

        try {
            let response;
            let source = record.source;

            // Fallback: determine source if not set (for old cached data)
            if (!source) {
                console.log('Source undefined, determining from record properties...');
                if (record.name && record.name.includes('(Opname Adjustment)')) {
                    source = 'stock_in';
                } else if (record.type === 'Loss' || record.type === 'Transfer' || record.type === 'Surplus') {
                    // Check if it's actually from stock_out by looking at other fields
                    if (record.price_sell !== undefined) {
                        source = 'stock_out';
                    } else if (record.price !== undefined) {
                        source = 'stock_in';
                    } else {
                        // Last resort: use type
                        source = record.type === 'Surplus' ? 'stock_in' : 'stock_out';
                    }
                }
            }

            console.log('Deleting record:', { id: record.id, type: record.type, source });

            // Use source to determine which API to call
            if (source === 'stock_in') {
                console.log('Calling deleteStockIn for ID:', record.id);
                response = await api.deleteStockIn(record.id);
            } else if (source === 'stock_out') {
                console.log('Calling deleteStockOut for ID:', record.id);
                response = await api.deleteStockOut(record.id);
            } else {
                alert('Tidak dapat menentukan sumber record.\n\nSilakan tutup modal dan buka kembali untuk refresh data.');
                console.error('Cannot determine source:', record);
                return;
            }

            const deleteSuccess = response && !response.error;

            if (deleteSuccess) {
                alert('Record opname berhasil dihapus dan stok telah dikembalikan!');
                // Reload history
                await handleViewHistory();
                // Reload inventory
                await loadData();
                if (onRefresh) onRefresh();
            } else {
                alert('Gagal menghapus record opname: ' + (response?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to delete opname record:', error);
            alert('Terjadi kesalahan saat menghapus record opname: ' + error.message);
        }
    };


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Cari Barang..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-main)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} dari {filteredItems.length} barang
                    </span>
                    {totalDiffItems > 0 && (
                        <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                            {totalDiffItems} item selisih
                        </span>
                    )}
                    <button className="btn btn-outline" onClick={handleViewHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <List size={18} /> Lihat Riwayat Opname
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveOpname}>
                        <Save size={18} style={{ marginRight: '0.5rem' }} /> Simpan Penyesuaian
                    </button>
                </div>
            </div>

            <div className="card table-responsive" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-hover)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem' }}>Kode</th>
                            <th style={{ padding: '1rem' }}>Nama Barang</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Stok Sistem</th>
                            <th style={{ padding: '1rem', textAlign: 'center', width: '150px' }}>Stok Fisik</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Selisih</th>
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
                            paginatedItems.map(item => {
                                const physical = physicalStocks[item.id] !== undefined ? physicalStocks[item.id] : item.stock;
                                const diff = physical - item.stock;
                                const diffColor = diff === 0 ? 'var(--text-muted)' : diff > 0 ? 'var(--success)' : 'var(--danger)';

                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{item.id}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{item.stock}</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                value={physical}
                                                onChange={(e) => handlePhysicalChange(item.id, e.target.value)}
                                                style={{
                                                    width: '80px',
                                                    textAlign: 'center',
                                                    padding: '0.25rem',
                                                    border: diff !== 0 ? '2px solid var(--warning)' : '1px solid var(--border)',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'var(--bg-main)',
                                                    color: 'var(--text-main)',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold', color: diffColor }}>
                                            {diff > 0 ? `+${diff}` : diff}
                                        </td>
                                    </tr>
                                );
                            })
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
                    marginTop: '1rem'
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

            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                * Masukkan jumlah stok fisik (real) di kolom "Stok Fisik". Sistem akan otomatis menghitung selisih.
                Klik "Simpan Penyesuaian" untuk mengupdate stok sistem agar sesuai dengan fisik.
            </p>

            {/* Modal Riwayat Opname */}
            {showHistoryModal && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 999,
                            backdropFilter: 'blur(4px)'
                        }}
                        onClick={() => setShowHistoryModal(false)}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius)',
                        padding: '2rem',
                        maxWidth: '900px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        zIndex: 1000,
                        border: '1px solid var(--border)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Riwayat Stock Opname</h2>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Date Filter */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            backgroundColor: 'var(--bg-hover)',
                            borderRadius: 'var(--radius)',
                            alignItems: 'center'
                        }}>
                            <Calendar size={20} style={{ color: 'var(--text-muted)' }} />
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dari:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sampai:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--bg-card)',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {opnameHistory.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                Belum ada riwayat opname
                            </p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kode</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama Barang</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Tipe</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Keterangan</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '100px' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opnameHistory
                                        .filter(record => {
                                            const recordDate = new Date(record.date || record.created_at);
                                            const start = startDate ? new Date(startDate) : null;
                                            const end = endDate ? new Date(endDate) : null;

                                            if (start && recordDate < start) return false;
                                            if (end && recordDate > end) return false;
                                            return true;
                                        })
                                        .map((record, index) => {
                                            const typeColor =
                                                record.type === 'Surplus' ? 'var(--success)' :
                                                    record.type === 'Transfer' ? 'var(--primary)' :
                                                        'var(--danger)';

                                            return (
                                                <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {new Date(record.date || record.created_at).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                                                        {record.code}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {record.displayName}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                                                        {record.qty} {record.unit || 'Pcs'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '99px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            backgroundColor: typeColor + '20',
                                                            color: typeColor,
                                                            border: `1px solid ${typeColor}40`
                                                        }}>
                                                            {record.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {record.reference_id || '-'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleDeleteOpname(record)}
                                                            style={{
                                                                background: 'none',
                                                                border: '1px solid var(--danger)',
                                                                borderRadius: '4px',
                                                                padding: '0.4rem 0.6rem',
                                                                cursor: 'pointer',
                                                                color: 'var(--danger)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                                fontSize: '0.85rem',
                                                                transition: 'all 0.2s',
                                                                margin: '0 auto'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'var(--danger)';
                                                                e.currentTarget.style.color = 'white';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.color = 'var(--danger)';
                                                            }}
                                                            title="Hapus dan kembalikan stok"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
