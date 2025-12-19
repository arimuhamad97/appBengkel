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
            <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                <h1 style={{
                    fontSize: 'clamp(1.3rem, 5vw, 1.8rem)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                }}>Absensi Karyawan</h1>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: 'clamp(0.85rem, 3vw, 1rem)'
                }}>Kelola kehadiran harian karyawan.</p>
            </div>

            {/* Date Navigator - Improved */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                borderRadius: 'var(--radius)',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <button
                    className="btn btn-outline"
                    style={{
                        padding: '0.5rem',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={() => {
                        const d = new Date(date);
                        d.setDate(d.getDate() - 1);
                        setDate(d.toISOString().split('T')[0]);
                    }}
                    aria-label="Previous day"
                >
                    <ChevronLeft size={20} />
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0 clamp(0.75rem, 2vw, 1rem)',
                    fontWeight: '600',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                    flex: '1 1 auto',
                    minWidth: '0'
                }}>
                    <Calendar size={20} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                    <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {new Date(date).toLocaleDateString('id-ID', {
                            weekday: window.innerWidth < 640 ? 'short' : 'long',
                            day: 'numeric',
                            month: window.innerWidth < 640 ? 'short' : 'long',
                            year: 'numeric'
                        })}
                    </span>
                </div>

                <button
                    className="btn btn-outline"
                    style={{
                        padding: '0.5rem',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={() => {
                        const d = new Date(date);
                        d.setDate(d.getDate() + 1);
                        setDate(d.toISOString().split('T')[0]);
                    }}
                    aria-label="Next day"
                >
                    <ChevronRight size={20} />
                </button>

                {date !== new Date().toISOString().split('T')[0] && (
                    <button
                        className="btn btn-primary"
                        style={{
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            padding: '0.5rem 1rem',
                            minHeight: '44px',
                            whiteSpace: 'nowrap',
                            fontWeight: '600'
                        }}
                        onClick={() => setDate(new Date().toISOString().split('T')[0])}
                    >
                        Hari Ini
                    </button>
                )}
            </div>

            {/* Summary Cards - Improved */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
            }}>
                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(0.75rem, 2vw, 1rem)',
                    padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}>
                    <div style={{
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        flexShrink: 0
                    }}>
                        <CheckCircle size={28} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            color: 'var(--text-muted)',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                        }}>Hadir</div>
                        <div style={{
                            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                            fontWeight: 'bold',
                            color: '#10b981'
                        }}>{summary.present}</div>
                    </div>
                </div>

                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(0.75rem, 2vw, 1rem)',
                    padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}>
                    <div style={{
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        flexShrink: 0
                    }}>
                        <XCircle size={28} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            color: 'var(--text-muted)',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                        }}>Belum/Absen</div>
                        <div style={{
                            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                            fontWeight: 'bold',
                            color: '#ef4444'
                        }}>{summary.absent}</div>
                    </div>
                </div>

                <div className="card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(0.75rem, 2vw, 1rem)',
                    padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}>
                    <div style={{
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        flexShrink: 0
                    }}>
                        <User size={28} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            color: 'var(--text-muted)',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                        }}>Total Karyawan</div>
                        <div style={{
                            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                            fontWeight: 'bold',
                            color: '#3b82f6'
                        }}>{summary.total}</div>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Desktop Table View */}
                <div className="desktop-only" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderBottom: '2px solid var(--border)'
                            }}>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Nama</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Role</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Status</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Jam Masuk</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Jam Pulang</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '150px'
                                }}>Catatan</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '200px'
                                }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div className="spinner"></div>
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : combinedList.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '1rem'
                                    }}>
                                        <AlertCircle size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                        <div>Belum ada data karyawan.</div>
                                    </td>
                                </tr>
                            ) : (
                                combinedList.map((item, index) => {
                                    const isPresent = item.attendance?.status === 'Hadir';
                                    const isCheckedIn = !!item.attendance?.check_in_time;
                                    const isCheckedOut = !!item.attendance?.check_out_time;

                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: '1px solid var(--border)',
                                                transition: 'background-color 0.2s',
                                                backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)';
                                            }}
                                        >
                                            <td style={{
                                                padding: '1rem 1.25rem',
                                                fontWeight: '600',
                                                fontSize: '0.95rem'
                                            }}>{item.name}</td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '0.35rem 0.75rem',
                                                    borderRadius: '16px',
                                                    backgroundColor: getRoleBadgeColor(item.role),
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.role === 'Gudang Management' ? 'Gudang' : (item.role || 'Mekanik')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                {item.attendance ? (
                                                    <span style={{
                                                        color: item.attendance.status === 'Hadir' ? 'var(--success)' :
                                                            item.attendance.status === 'Sakit' ? 'var(--warning)' :
                                                                item.attendance.status === 'Ijin' ? 'var(--primary)' : 'var(--danger)',
                                                        fontWeight: '600',
                                                        fontSize: '0.95rem'
                                                    }}>
                                                        {item.attendance.status}
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        color: 'var(--text-muted)',
                                                        fontSize: '0.9rem',
                                                        fontStyle: 'italic'
                                                    }}>Belum Absen</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                {item.attendance?.check_in_time ? (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        <Clock size={16} color="var(--success)" />
                                                        {item.attendance.check_in_time}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                {item.attendance?.check_out_time ? (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        <Clock size={16} color="var(--danger)" />
                                                        {item.attendance.check_out_time}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.25rem',
                                                fontSize: '0.9rem',
                                                color: 'var(--text-muted)',
                                                fontStyle: item.attendance?.notes ? 'normal' : 'italic'
                                            }}>
                                                {item.attendance?.notes || '-'}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    gap: '0.5rem',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {!item.attendance ? (
                                                        <>
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{
                                                                    padding: '0.5rem 1rem',
                                                                    fontSize: '0.85rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.4rem',
                                                                    fontWeight: '600'
                                                                }}
                                                                onClick={() => handleCheckIn(item.id)}
                                                            >
                                                                <LogIn size={16} /> Masuk
                                                            </button>
                                                            <button
                                                                className="btn btn-outline"
                                                                style={{
                                                                    padding: '0.5rem 0.75rem',
                                                                    fontSize: '0.85rem',
                                                                    color: 'var(--warning)',
                                                                    borderColor: 'var(--warning)',
                                                                    fontWeight: '600'
                                                                }}
                                                                title="Tandai Sakit"
                                                                onClick={() => handleStatusUpdate(item.id, 'Sakit')}
                                                            >
                                                                Sakit
                                                            </button>
                                                            <button
                                                                className="btn btn-outline"
                                                                style={{
                                                                    padding: '0.5rem 0.75rem',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600'
                                                                }}
                                                                title="Tandai Ijin"
                                                                onClick={() => handleStatusUpdate(item.id, 'Ijin')}
                                                            >
                                                                Ijin
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {isPresent && !isCheckedOut && (
                                                                <button
                                                                    className="btn btn-outline"
                                                                    style={{
                                                                        padding: '0.5rem 1rem',
                                                                        fontSize: '0.85rem',
                                                                        borderColor: 'var(--danger)',
                                                                        color: 'var(--danger)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.4rem',
                                                                        fontWeight: '600'
                                                                    }}
                                                                    onClick={() => handleCheckOut(item.attendance.id)}
                                                                >
                                                                    <LogOut size={16} /> Pulang
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-outline"
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    color: 'var(--text-muted)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onClick={() => handleDelete(item.attendance.id)}
                                                                title="Reset / Hapus Absensi"
                                                            >
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

                {/* Mobile Card View */}
                <div className="mobile-only" style={{ padding: '1rem' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <div className="spinner"></div>
                                <span>Memuat data...</span>
                            </div>
                        </div>
                    ) : combinedList.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <AlertCircle size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <div>Belum ada data karyawan.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {combinedList.map((item) => {
                                const isPresent = item.attendance?.status === 'Hadir';
                                const isCheckedIn = !!item.attendance?.check_in_time;
                                const isCheckedOut = !!item.attendance?.check_out_time;

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius)',
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        {/* Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '0.75rem',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    marginBottom: '0.25rem',
                                                    wordBreak: 'break-word'
                                                }}>{item.name}</div>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '12px',
                                                    backgroundColor: getRoleBadgeColor(item.role),
                                                    color: 'white',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.role === 'Gudang Management' ? 'Gudang' : (item.role || 'Mekanik')}
                                                </span>
                                            </div>
                                            <div style={{ flexShrink: 0 }}>
                                                {item.attendance ? (
                                                    <span style={{
                                                        color: item.attendance.status === 'Hadir' ? 'var(--success)' :
                                                            item.attendance.status === 'Sakit' ? 'var(--warning)' :
                                                                item.attendance.status === 'Ijin' ? 'var(--primary)' : 'var(--danger)',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {item.attendance.status}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Belum Absen</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Time Info */}
                                        {(item.attendance?.check_in_time || item.attendance?.check_out_time) && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.9rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                {item.attendance?.check_in_time && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Clock size={14} color="var(--success)" />
                                                        <span style={{ color: 'var(--text-muted)' }}>Masuk:</span>
                                                        <span style={{ fontWeight: '500' }}>{item.attendance.check_in_time}</span>
                                                    </div>
                                                )}
                                                {item.attendance?.check_out_time && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Clock size={14} color="var(--danger)" />
                                                        <span style={{ color: 'var(--text-muted)' }}>Pulang:</span>
                                                        <span style={{ fontWeight: '500' }}>{item.attendance.check_out_time}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {item.attendance?.notes && (
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-muted)',
                                                marginBottom: '0.75rem',
                                                fontStyle: 'italic'
                                            }}>
                                                Catatan: {item.attendance.notes}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            {!item.attendance ? (
                                                <>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            fontSize: '0.9rem',
                                                            flex: '1 1 auto',
                                                            minHeight: '44px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                        onClick={() => handleCheckIn(item.id)}
                                                    >
                                                        <LogIn size={16} /> Masuk
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            fontSize: '0.9rem',
                                                            color: 'var(--warning)',
                                                            borderColor: 'var(--warning)',
                                                            minHeight: '44px'
                                                        }}
                                                        onClick={() => handleStatusUpdate(item.id, 'Sakit')}
                                                    >
                                                        Sakit
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            fontSize: '0.9rem',
                                                            minHeight: '44px'
                                                        }}
                                                        onClick={() => handleStatusUpdate(item.id, 'Ijin')}
                                                    >
                                                        Ijin
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {isPresent && !isCheckedOut && (
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{
                                                                padding: '0.6rem 1rem',
                                                                fontSize: '0.9rem',
                                                                borderColor: 'var(--danger)',
                                                                color: 'var(--danger)',
                                                                flex: '1 1 auto',
                                                                minHeight: '44px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                            onClick={() => handleCheckOut(item.attendance.id)}
                                                        >
                                                            <LogOut size={16} /> Pulang
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            minHeight: '44px',
                                                            minWidth: '44px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        onClick={() => handleDelete(item.attendance.id)}
                                                        title="Reset / Hapus Absensi"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (min-width: 769px) {
                    .mobile-only { display: none !important; }
                }
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                }
                
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255,255,255,0.1);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
