import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Calendar, Filter, Users, UserMinus, Crown } from 'lucide-react';

export default function CustomerReport() {
    const [customers, setCustomers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterType, setFilterType] = useState('all'); // all, top, inactive
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Set default month range (current month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Use local time for input values
        const toLocalYMD = (d) => {
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
        };

        setStartDate(toLocalYMD(firstDay));
        setEndDate(toLocalYMD(lastDay));

        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [customers, filterType, startDate, endDate, searchTerm]);

    const loadData = async () => {
        setLoading(true);
        try {
            const queue = await api.getQueue();

            // 1. Process Raw Data into Customer Profiles
            const customerMap = {};

            queue.forEach(q => {
                // Skip if no plate number
                if (!q.plateNumber) return;

                // key by plateNumber (normalized)
                const key = q.plateNumber.toUpperCase().replace(/\s/g, '');

                if (!customerMap[key]) {
                    customerMap[key] = {
                        id: key,
                        plateNumber: q.plateNumber,
                        customerName: q.customerName,
                        phoneNumber: q.phoneNumber,
                        bikeModel: q.bikeModel,
                        totalVisits: 0,
                        lastVisit: q.date, // YYYY-MM-DD
                        visits: [] // Store visit dates
                    };
                }

                customerMap[key].totalVisits += 1;
                customerMap[key].visits.push({
                    date: q.date,
                    service: q.serviceType,
                    status: q.status
                });

                // Update last visit if newer
                if (new Date(q.date) > new Date(customerMap[key].lastVisit)) {
                    customerMap[key].lastVisit = q.date;
                    // Update profile info from latest visit (as it's likely most current)
                    customerMap[key].customerName = q.customerName;
                    customerMap[key].phoneNumber = q.phoneNumber || customerMap[key].phoneNumber;
                }
            });

            setCustomers(Object.values(customerMap));
        } catch (error) {
            console.error('Failed to load customer report:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...customers];

        // 1. Filter Date Range (Berlaku untuk 'Semua' dan 'Terbanyak' - mencari yg datang di rentang ini)
        // Untuk 'Inactive', logic tanggal beda (karena mencari yg TIDAK datang).

        if (filterType !== 'inactive') {
            if (startDate && endDate) {
                result = result.filter(c => {
                    // Cek apakah customer punya kunjungan di rentang ini
                    return c.visits.some(v => v.date >= startDate && v.date <= endDate);
                });
            }
        }

        // 2. Filter Type Logic
        if (filterType === 'top') {
            // Sort by visits DESC
            result.sort((a, b) => b.totalVisits - a.totalVisits);
        } else if (filterType === 'inactive') {
            // Logic: Terakhir datang > 3 bulan yang lalu
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const cutoffDate = threeMonthsAgo.toISOString().split('T')[0];

            result = result.filter(c => {
                // Last visit must be BEFORE cutoff date
                return c.lastVisit < cutoffDate;
            });

            // Sort by last visit ASC (yg paling lama tidak datang di atas)
            result.sort((a, b) => new Date(a.lastVisit) - new Date(b.lastVisit));
        } else {
            // Default sort: Last visit DESC (terbaru diatas)
            result.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
        }

        // 3. Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.customerName?.toLowerCase().includes(term) ||
                c.plateNumber?.toLowerCase().includes(term) ||
                c.bikeModel?.toLowerCase().includes(term)
            );
        }

        setFilteredData(result);
    };

    // Aggregate Bike Models based on FILTERED data
    const aggregatedBikes = React.useMemo(() => {
        const bikeMap = {};
        filteredData.forEach(c => {
            const model = (c.bikeModel || 'Lainnya').trim().toUpperCase();
            if (!bikeMap[model]) {
                bikeMap[model] = { name: model, count: 0 };
            }
            bikeMap[model].count += 1;
        });
        return Object.values(bikeMap).sort((a, b) => b.count - a.count);
    }, [filteredData]);

    return (
        <div className="fade-in">
            {/* Control Panel */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>

                {/* 1. Filter Type Selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter Data</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: 'Semua Data', icon: Users },
                            { id: 'top', label: 'Kunjungan Terbanyak', icon: Crown },
                            { id: 'inactive', label: 'Customer Pasif (>3 Bulan)', icon: UserMinus },
                        ].map((type) => {
                            const Icon = type.icon;
                            const isActive = filterType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setFilterType(type.id)}
                                    className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Icon size={16} /> {type.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Date Range & Search */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: filterType !== 'inactive' ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
                    gap: '1rem',
                    alignItems: 'end',
                    backgroundColor: 'var(--bg-hover)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)'
                }}>

                    {/* Date Inputs (Hidden for Inactive) */}
                    {filterType !== 'inactive' && (
                        <>
                            <div style={{ display: 'flex', gap: '1rem', flex: 2 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dari Tanggal</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            className="input"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{ paddingLeft: '2.2rem' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sampai Tanggal</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            className="input"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ paddingLeft: '2.2rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Search Box - Always Visible */}
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pencarian</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Cari Nama, Plat Nomor, atau Motor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>
                </div>

                {filterType === 'inactive' && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={14} />
                        Status <strong>Pasif</strong> mendeteksi konsumen yang terakhir kali melakukan servis lebih dari 3 bulan yang lalu.
                    </div>
                )}
            </div>

            {/* 3. Bike Model Analysis (Moved from Revenue Report) */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Statistik Tipe Motor (Top 5 Populer)</h3>

                {aggregatedBikes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Tidak ada data untuk ditampilkan.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        {aggregatedBikes.slice(0, 5).map((b, i) => (
                            <div key={i} style={{
                                backgroundColor: 'var(--bg-hover)',
                                padding: '1rem',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{b.name}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{b.count}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    {filteredData.length > 0 ? ((b.count / filteredData.length) * 100).toFixed(1) : 0}% Populasi
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 'bold' }}>
                        {filterType === 'all' && 'Semua Data Konsumen'}
                        {filterType === 'top' && 'Kunjungan Terbanyak'}
                        {filterType === 'inactive' && 'Konsumen Pasif (> 3 Bulan)'}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total: <strong>{filteredData.length}</strong> Konsumen</div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nama Pelanggan</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Plat Nomor</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Motor</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>No. HP</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Total Kunjungan</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Terakhir Datang</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading data...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data yang cocok.</td>
                                </tr>
                            ) : (
                                filteredData.map((customer, index) => {
                                    // Calculate retention status
                                    const lastDate = new Date(customer.lastVisit);
                                    const now = new Date();
                                    const diffMonths = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth());

                                    let statusBadge = <span className="badge badge-success">Aktif</span>;
                                    if (diffMonths >= 3) statusBadge = <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Pasif ({diffMonths} bln)</span>;
                                    else if (diffMonths >= 1) statusBadge = <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Jarang ({diffMonths} bln)</span>;
                                    else statusBadge = <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Baru Saja</span>;

                                    return (
                                        <tr key={customer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                {filterType === 'top' && index < 3 && (
                                                    <Crown size={14} color="gold" style={{ marginRight: '5px', display: 'inline' }} />
                                                )}
                                                {customer.customerName}
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                                {customer.plateNumber}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{customer.bikeModel}</td>
                                            <td style={{ padding: '1rem' }}>{customer.phoneNumber || '-'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {customer.totalVisits}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(customer.lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{statusBadge}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
