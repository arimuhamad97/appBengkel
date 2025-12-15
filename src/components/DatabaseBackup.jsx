import React, { useState } from 'react';
import { Database, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DatabaseBackup() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleBackup = async () => {
        setIsBackingUp(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/api/database/backup');

            if (!response.ok) {
                throw new Error('Gagal melakukan backup database');
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `bengkel-backup-${new Date().toISOString().split('T')[0]}.db`;

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setMessage('Backup berhasil diunduh!');
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat backup');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Confirm before restoring
        const confirmed = window.confirm(
            'PERINGATAN: Restore database akan mengganti semua data yang ada dengan data dari file backup. ' +
            'Backup otomatis akan dibuat sebelum restore. Apakah Anda yakin ingin melanjutkan?'
        );

        if (!confirmed) {
            event.target.value = ''; // Reset file input
            return;
        }

        setIsRestoring(true);
        setMessage(null);
        setError(null);

        try {
            // Read file as base64
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64Data = e.target.result.split(',')[1];

                const response = await fetch('http://localhost:3001/api/database/restore', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fileData: base64Data })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Gagal melakukan restore database');
                }

                setMessage(data.message || 'Database berhasil di-restore! Silakan refresh halaman.');

                // Auto refresh after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            };

            reader.onerror = () => {
                throw new Error('Gagal membaca file');
            };

            reader.readAsDataURL(file);

        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat restore');
            setIsRestoring(false);
        }

        // Reset file input
        event.target.value = '';
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Database size={28} />
                    Backup & Restore Database
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Kelola backup dan restore database untuk keamanan data Anda
                </p>
            </div>

            {/* Messages */}
            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--success)'
                }}>
                    <CheckCircle size={20} />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--danger)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--danger)'
                }}>
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Backup Card */}
                <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--primary-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                Backup Database
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Unduh salinan database
                            </p>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Buat backup database Anda untuk keamanan. File backup akan diunduh ke komputer Anda dan dapat digunakan untuk restore di kemudian hari.
                    </p>

                    <button
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: isBackingUp ? 'var(--bg-hover)' : 'var(--primary)',
                            color: isBackingUp ? 'var(--text-muted)' : 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            cursor: isBackingUp ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isBackingUp) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Download size={18} />
                        {isBackingUp ? 'Memproses...' : 'Backup Sekarang'}
                    </button>
                </div>

                {/* Restore Card */}
                <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--warning-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--warning)'
                        }}>
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                Restore Database
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Pulihkan dari backup
                            </p>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                        Restore database dari file backup. <strong style={{ color: 'var(--warning)' }}>PERINGATAN:</strong> Semua data saat ini akan diganti dengan data dari backup.
                    </p>

                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--warning-bg)',
                        border: '1px solid var(--warning)',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--warning)',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Backup otomatis akan dibuat sebelum restore untuk keamanan</span>
                    </div>

                    <label style={{
                        width: '100%',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: isRestoring ? 'var(--bg-hover)' : 'var(--warning)',
                        color: isRestoring ? 'var(--text-muted)' : 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        cursor: isRestoring ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                        onMouseEnter={(e) => {
                            if (!isRestoring) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Upload size={18} />
                        {isRestoring ? 'Memproses...' : 'Pilih File Backup'}
                        <input
                            type="file"
                            accept=".db"
                            onChange={handleRestore}
                            disabled={isRestoring}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            {/* Information Section */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    📋 Panduan Backup & Restore
                </h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li><strong>Backup Rutin:</strong> Disarankan melakukan backup database secara rutin (harian/mingguan) untuk keamanan data.</li>
                    <li><strong>Simpan Aman:</strong> Simpan file backup di lokasi yang aman, misalnya cloud storage atau hard drive eksternal.</li>
                    <li><strong>Format File:</strong> File backup berformat .db (SQLite database file).</li>
                    <li><strong>Sebelum Update:</strong> Selalu backup database sebelum melakukan update sistem atau perubahan besar.</li>
                    <li><strong>Restore:</strong> Proses restore akan membuat backup otomatis dari database saat ini sebelum mengganti dengan data backup.</li>
                    <li><strong>Refresh Halaman:</strong> Setelah restore berhasil, halaman akan otomatis refresh untuk memuat data baru.</li>
                </ul>
            </div>
        </div>
    );
}
