import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Calendar, Wrench, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';

export default function MechanicReport() {
    const [mechanics, setMechanics] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        // Default to current month
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const toLocalYMD = (d) => {
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
        };

        setStartDate(toLocalYMD(firstDay));
        setEndDate(toLocalYMD(lastDay));
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            loadData();
        }
    }, [startDate, endDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mechanicsList, queueData] = await Promise.all([
                api.getMechanics(),
                api.getQueue()
            ]);

            // Filter queue by date and status (Done/Paid)
            const filteredQueue = queueData.filter(q => {
                // Check Status
                const isCompleted = q.status === 'Done' || q.status === 'Paid';
                if (!isCompleted) return false;

                // Check Date
                const qDate = q.date; // YYYY-MM-DD
                return qDate >= startDate && qDate <= endDate;
            });

            // Process Data
            const stats = {};

            // Initialize stats for all mechanics (including those with 0 work)
            mechanicsList.forEach(m => {
                stats[m.id] = {
                    mechanic: m,
                    totalUnits: 0,
                    totalServiceRevenue: 0, // Jasa
                    totalPartRevenue: 0,    // Sparepart
                    grandTotal: 0,
                    jobs: [] // List of jobs for detail view
                };
            });

            filteredQueue.forEach(job => {
                const mechId = job.mechanicId;
                if (!stats[mechId]) return; // Skip if mechanic not found or deleted

                let jobServiceRevenue = 0;
                let jobPartRevenue = 0;

                try {
                    const items = typeof job.items === 'string' ? JSON.parse(job.items) : job.items;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            const totalItemPrice = (item.price || 0) * (item.q || 1);

                            // Check Type
                            const type = item.type ? item.type.toLowerCase() : 'service';
                            if (type === 'part' || type === 'sparepart') {
                                jobPartRevenue += totalItemPrice;
                            } else {
                                jobServiceRevenue += totalItemPrice;
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing items for job:', job.id);
                }

                stats[mechId].totalUnits += 1;
                stats[mechId].totalServiceRevenue += jobServiceRevenue;
                stats[mechId].totalPartRevenue += jobPartRevenue;
                stats[mechId].grandTotal += (jobServiceRevenue + jobPartRevenue);

                stats[mechId].jobs.push({
                    ...job,
                    serviceRevenue: jobServiceRevenue,
                    partRevenue: jobPartRevenue
                });
            });

            // Convert to array and sort by Service Revenue DESC
            const result = Object.values(stats).sort((a, b) => b.totalServiceRevenue - a.totalServiceRevenue);
            setReportData(result);
            setMechanics(mechanicsList);

        } catch (error) {
            console.error('Failed to load mechanic report:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (mechId) => {
        if (expandedRow === mechId) {
            setExpandedRow(null);
        } else {
            setExpandedRow(mechId);
        }
    };

    return (
        <div className="fade-in">
            {/* Filter Section */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wrench size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Laporan Kinerja Mekanik (Komisi)</h3>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
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
                    <div>
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
                    <div>
                        {/* Placeholder for Export Button */}
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem', width: '40px' }}></th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nama Mekanik</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Total Unit</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>Total Jasa (Service)</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--warning)' }}>Sparepart</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Total Omset</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                            ) : reportData.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Tidak ada data pada periode ini.</td></tr>
                            ) : (
                                reportData.map((row) => (
                                    <React.Fragment key={row.mechanic.id}>
                                        <tr
                                            style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', backgroundColor: expandedRow === row.mechanic.id ? 'var(--bg-hover)' : 'transparent' }}
                                            onClick={() => toggleExpand(row.mechanic.id)}
                                        >
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {expandedRow === row.mechanic.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>{row.mechanic.name}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span className="badge badge-primary" style={{ fontSize: '0.9rem' }}>{row.totalUnits}</span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)', fontSize: '1rem' }}>
                                                Rp {row.totalServiceRevenue.toLocaleString('id-ID')}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                                                Rp {row.totalPartRevenue.toLocaleString('id-ID')}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                Rp {row.grandTotal.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                        {expandedRow === row.mechanic.id && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '0', backgroundColor: 'var(--bg-secondary)' }}>
                                                    <div style={{ padding: '1rem 2rem' }}>
                                                        <h5 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Detail Pekerjaan: {row.mechanic.name}</h5>
                                                        <table style={{ width: '100%', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tanggal</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Pelanggan</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Motor</th>
                                                                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Jasa</th>
                                                                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Part</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {row.jobs.map((job, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <td style={{ padding: '0.5rem' }}>{job.date}</td>
                                                                        <td style={{ padding: '0.5rem' }}>{job.customerName}</td>
                                                                        <td style={{ padding: '0.5rem' }}>{job.bikeModel}</td>
                                                                        <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--success)' }}>
                                                                            Rp {job.serviceRevenue.toLocaleString('id-ID')}
                                                                        </td>
                                                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                                            Rp {job.partRevenue.toLocaleString('id-ID')}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                        <tfoot style={{ backgroundColor: 'var(--bg-hover)', fontWeight: 'bold' }}>
                            <tr>
                                <td colSpan="2" style={{ padding: '1rem', textAlign: 'right' }}>Total Keseluruhan:</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {reportData.reduce((sum, r) => sum + r.totalUnits, 0)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>
                                    Rp {reportData.reduce((sum, r) => sum + r.totalServiceRevenue, 0).toLocaleString('id-ID')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    Rp {reportData.reduce((sum, r) => sum + r.totalPartRevenue, 0).toLocaleString('id-ID')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    Rp {reportData.reduce((sum, r) => sum + r.grandTotal, 0).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <p><strong>Catatan:</strong></p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    <li>Kolom <strong>Total Jasa</strong> menghitung item dengan tipe <em>Service</em>.</li>
                    <li>Kolom <strong>Sparepart</strong> menghitung item dengan tipe <em>Part</em>.</li>
                    <li>Gunakan angka pada kolom <strong>Total Jasa</strong> sebagai dasar perhitungan komisi mekanik.</li>
                </ul>
            </div>
        </div>
    );
}
