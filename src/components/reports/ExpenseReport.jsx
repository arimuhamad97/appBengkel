import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Calendar, DollarSign, FileText } from 'lucide-react';

export default function ExpenseReport() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [filterType, setFilterType] = useState('monthly'); // 'monthly' | 'range'
    const [month, setMonth] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10)
    });

    const [totalAmount, setTotalAmount] = useState(0);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        category: 'Operasional',
        amount: '',
        notes: ''
    });

    useEffect(() => {
        // Default to current month
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
        setMonth(currentMonth);
        setFormData(prev => ({ ...prev, date: now.toISOString().slice(0, 10) }));
    }, []);

    useEffect(() => {
        loadData();
    }, [month, filterType, dateRange.startDate, dateRange.endDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            let params = {};
            if (filterType === 'monthly') {
                params = { month };
            } else {
                params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
            }

            const data = await api.getExpenses(params);
            if (Array.isArray(data)) {
                setExpenses(data);
                const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
                setTotalAmount(total);
            }
        } catch (error) {
            console.error('Failed to load expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        try {
            // Ensure amount is integer
            const payload = { ...formData, amount: parseInt(formData.amount) };
            await api.addExpense(payload);

            // Reset form partly
            setFormData(prev => ({
                ...prev,
                description: '',
                amount: '',
                notes: ''
            }));
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan data. Mohon RESTART aplikasi (Tutup dan buka kembali start-app.bat) agar fitur Pengeluaran aktif.');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Hapus data pengeluaran ini?')) {
            try {
                await api.deleteExpense(id);
                loadData();
            } catch (error) {
                alert('Gagal menghapus data');
            }
        }
    };

    return (
        <div className="fade-in">
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

                    {/* Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

                        {/* Filter Type Toggle */}
                        <div style={{ display: 'flex', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '2px' }}>
                            <button
                                onClick={() => setFilterType('monthly')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    borderRadius: 'calc(var(--radius) - 2px)',
                                    background: filterType === 'monthly' ? 'var(--bg-card)' : 'transparent',
                                    color: filterType === 'monthly' ? 'var(--text-main)' : 'var(--text-muted)',
                                    fontWeight: filterType === 'monthly' ? '600' : 'normal',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: filterType === 'monthly' ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                Bulanan
                            </button>
                            <button
                                onClick={() => setFilterType('range')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    borderRadius: 'calc(var(--radius) - 2px)',
                                    background: filterType === 'range' ? 'var(--bg-card)' : 'transparent',
                                    color: filterType === 'range' ? 'var(--text-main)' : 'var(--text-muted)',
                                    fontWeight: filterType === 'range' ? '600' : 'normal',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: filterType === 'range' ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                Rentang Tanggal
                            </button>
                        </div>

                        {filterType === 'monthly' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={18} color="var(--text-muted)" />
                                <input
                                    type="month"
                                    className="input"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    style={{ maxWidth: '160px' }}
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    className="input"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    style={{ maxWidth: '140px' }}
                                />
                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                <input
                                    type="date"
                                    className="input"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    style={{ maxWidth: '140px' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Check Total & Add Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Pengeluaran</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                                Rp {totalAmount.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(!showForm)}
                        >
                            <Plus size={18} style={{ marginRight: '5px' }} />
                            {showForm ? 'Batal' : 'Tambah Pengeluaran'}
                        </button>
                    </div>
                </div>

                {/* Add Expense Form */}
                {showForm && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }} className="fade-in">
                        <h4 style={{ marginBottom: '1rem' }}>Input Pengeluaran Baru</h4>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Tanggal</label>
                                <input
                                    type="date"
                                    className="input"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Keterangan</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Contoh: Beli Token Listrik / Gaji Karyawan"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Kategori</label>
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Operasional">Operasional</option>
                                    <option value="Gaji">Gaji Karyawan</option>
                                    <option value="Belanja Sparepart">Belanja Sparepart</option>
                                    <option value="Konsumsi">Makan/Minum</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Nominal (Rp)</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="0"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* List Table */}
            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Tanggal</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Keterangan</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Kategori</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Nominal</th>
                            <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Belum ada data pengeluaran bulan ini.</td></tr>
                        ) : (
                            expenses.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{item.description}</div>
                                        {item.notes && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.notes}</div>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--danger)' }}>
                                        Rp {item.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleDelete(item.id)}
                                            style={{ color: 'var(--danger)' }}
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
