import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, User, Clock, CheckCircle, XCircle, LogIn, LogOut, ChevronLeft, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';

export default function AttendancePage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mechanics, setMechanics] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allMechanics, attendanceData] = await Promise.all([
                api.getMechanics(),
                api.getAttendance(date)
            ]);

            setMechanics(allMechanics);
            setAttendance(attendanceData);

            // Calculate summary
            const presentCount = attendanceData.filter(a => a.status === 'Hadir').length;
            setSummary({
                present: presentCount,
                absent: allMechanics.length - presentCount,
                total: allMechanics.length
            });
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Auto refresh every 1 minute to update time display if needed involved
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [date]);

    const handleCheckIn = async (mechanicId) => {
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

            await api.checkIn({
                mechanic_id: mechanicId,
                date: date,
                time: timeString,
                status: 'Hadir',
                notes: ''
            });
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCheckOut = async (attendanceId) => {
        if (!confirm('Konfirmasi Pulang?')) return;
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

            await api.checkOut({
                id: attendanceId,
                time: timeString
            });
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (attendanceId) => {
        if (!confirm('Hapus data absensi ini?')) return;
        try {
            await api.deleteAttendance(attendanceId);
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleStatusUpdate = async (mechanicId, status) => {
        const notes = prompt('Catatan (opsional):', '');
        if (notes === null) return;

        try {
            await api.updateAttendanceStatus({
                mechanic_id: mechanicId,
                date: date,
                status: status,
                notes: notes
            });
            fetchData();
        } catch (error) {
            alert(error.message);
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

    // Combine mechanics with their attendance status
    const combinedList = mechanics.map(m => {
        const att = attendance.find(a => a.mechanic_id === m.id);
        return { ...m, attendance: att };
    });

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Absensi Karyawan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Kelola kehadiran harian karyawan.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => {
                        const d = new Date(date);
                        d.setDate(d.getDate() - 1);
                        setDate(d.toISOString().split('T')[0]);
                    }}>
                        <ChevronLeft size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', fontWeight: 'bold' }}>
                        <Calendar size={18} />
                        {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>

                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => {
                        const d = new Date(date);
                        d.setDate(d.getDate() + 1);
                        setDate(d.toISOString().split('T')[0]);
                    }}>
                        <ChevronRight size={18} />
                    </button>

                    {date !== new Date().toISOString().split('T')[0] && (
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', marginLeft: '0.5rem' }} onClick={() => setDate(new Date().toISOString().split('T')[0])}>
                            Hari Ini
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.8rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hadir</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.present}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.8rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                        <XCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Belum Hadir / Absen</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.absent}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.8rem', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Karyawan</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.total}</div>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Nama Karyawan</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Jam Masuk</th>
                                <th style={{ padding: '1rem' }}>Jam Pulang</th>
                                <th style={{ padding: '1rem' }}>Catatan</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                                </tr>
                            ) : combinedList.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data karyawan.</td>
                                </tr>
                            ) : (
                                combinedList.map((item) => {
                                    const isPresent = item.attendance?.status === 'Hadir';
                                    const isCheckedIn = !!item.attendance?.check_in_time;
                                    const isCheckedOut = !!item.attendance?.check_out_time;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.name}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '12px',
                                                    backgroundColor: getRoleBadgeColor(item.role),
                                                    color: 'white'
                                                }}>
                                                    {item.role === 'Gudang Management' ? 'Gudang' : (item.role || 'Mekanik')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {item.attendance ? (
                                                    <span style={{
                                                        color: item.attendance.status === 'Hadir' ? 'var(--success)' :
                                                            item.attendance.status === 'Sakit' ? 'var(--warning)' :
                                                                item.attendance.status === 'Ijin' ? 'var(--primary)' : 'var(--danger)',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {item.attendance.status}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>Belum Absen</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {item.attendance?.check_in_time ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Clock size={16} color="var(--success)" />
                                                        {item.attendance.check_in_time}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {item.attendance?.check_out_time ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Clock size={16} color="var(--danger)" />
                                                        {item.attendance.check_out_time}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                {item.attendance?.notes || '-'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    {!item.attendance ? (
                                                        <>
                                                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleCheckIn(item.id)}>
                                                                <LogIn size={16} style={{ marginRight: '0.3rem' }} /> Masuk
                                                            </button>
                                                            <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--warning)', borderColor: 'var(--warning)' }} title="Tandai Sakit" onClick={() => handleStatusUpdate(item.id, 'Sakit')}>
                                                                Sakit
                                                            </button>
                                                            <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--text-muted)' }} title="Tandai Ijin" onClick={() => handleStatusUpdate(item.id, 'Ijin')}>
                                                                Ijin
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {isPresent && !isCheckedOut && (
                                                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleCheckOut(item.attendance.id)}>
                                                                    <LogOut size={16} style={{ marginRight: '0.3rem' }} /> Pulang
                                                                </button>
                                                            )}
                                                            <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--text-muted)' }} onClick={() => handleDelete(item.attendance.id)} title="Reset / Hapus Absensi">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
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
