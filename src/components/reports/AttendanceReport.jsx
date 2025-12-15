import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

export default function AttendanceReport() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [daysInMonth, setDaysInMonth] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [selectedMonth]);


    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [mechanics, attendanceData] = await Promise.all([
                api.getMechanics(),
                api.getAttendance({ month: selectedMonth })
            ]);

            // Calculate days in selected month
            const year = parseInt(selectedMonth.split('-')[0]);
            const month = parseInt(selectedMonth.split('-')[1]);
            const days = new Date(year, month, 0).getDate();
            setDaysInMonth(days);

            // Process data per mechanic
            if (attendanceData.error) throw new Error(attendanceData.error);
            if (!Array.isArray(attendanceData)) throw new Error("Data absensi tidak valid");

            const processed = mechanics.map(mech => {
                const myAttendance = Array.isArray(attendanceData) ? attendanceData.filter(a => a.mechanic_id === mech.id) : [];

                const stats = {
                    Hadir: 0,
                    Sakit: 0,
                    Ijin: 0,
                    Alpa: 0
                };

                myAttendance.forEach(a => {
                    if (stats[a.status] !== undefined) {
                        stats[a.status]++;
                    } else {
                        // Fallback logic if status is weird
                        stats.Hadir++;
                    }
                });

                // Calculate Alpa (Absent without notice) logic is tricky without work schedule
                // For now, we only count explicit statuses. 
                // Alternatively, we can assume working days = days - sundays?
                // Let's keep it simple: Show recorded stats.

                return {
                    ...mech,
                    stats,
                    history: myAttendance
                };
            });


            if (!Array.isArray(mechanics)) throw new Error("Gagal memuat data karyawan");

            setReportData(processed);
        } catch (error) {
            console.error('Failed to load report:', error);
            setError(error.message || 'Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Mekanik': return '#0ea5e9';
            case 'Front Desk': return '#10b981';
            case 'Gudang':
            case 'Gudang Management': return '#f97316';
            default: return '#6b7280';
        }
    };

    return (
        <div className="fade-in">
            {/* Filter Section */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Calendar size={20} color="var(--primary)" />
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Periode Laporan</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="input"
                            style={{ fontWeight: 'bold' }}
                        />
                    </div>

                    <button
                        onClick={loadData}
                        className="btn btn-outline"
                        style={{ marginLeft: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh Data'}
                    </button>
                </div>
                <div>
                    {/* Export Button could go here */}
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Report Table */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Rekap Absensi Karyawan</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Nama Karyawan</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--success)' }}>Hadir</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--warning)' }}>Sakit</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)' }}>Ijin</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Total Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading data...</td>
                                </tr>
                            ) : reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data karyawan.</td>
                                </tr>
                            ) : (
                                reportData.map((emp) => (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--bg-hover)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={16} />
                                                </div>
                                                {emp.name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '12px',
                                                backgroundColor: getRoleBadgeColor(emp.role),
                                                color: 'white'
                                            }}>
                                                {emp.role === 'Gudang Management' ? 'Gudang' : (emp.role || 'Mekanik')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                                            {emp.stats.Hadir > 0 ? emp.stats.Hadir : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {emp.stats.Sakit > 0 ? (
                                                <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{emp.stats.Sakit}</span>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {emp.stats.Ijin > 0 ? (
                                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{emp.stats.Ijin}</span>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                                            {((emp.stats.Hadir / daysInMonth) * 100).toFixed(0)}%
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem', fontWeight: 'normal' }}>
                                                ({emp.stats.Hadir + emp.stats.Sakit + emp.stats.Ijin} records)
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                * Persentase kehadiran dihitung berdasarkan total hari dalam bulan ({daysInMonth} hari).
            </div>
        </div>
    );
}
