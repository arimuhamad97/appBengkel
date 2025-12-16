import React, { useState } from 'react';
import { FileText, Package, Users, UserCheck, Wrench, Briefcase, TrendingDown } from 'lucide-react';
import RevenueReport from '../components/reports/RevenueReport';
import ExpenseReport from '../components/reports/ExpenseReport';
import SparepartSalesReport from '../components/reports/SparepartSalesReport';
import ServiceSalesReport from '../components/reports/ServiceSalesReport';
import AttendanceReport from '../components/reports/AttendanceReport';
import CustomerReport from '../components/reports/CustomerReport';
import MechanicReport from '../components/reports/MechanicReport';

export default function ReportsPage({ user, initialTab = 'revenue' }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs = [
        { id: 'revenue', label: 'Laporan Pendapatan', icon: FileText },
        { id: 'expenses', label: 'Pengeluaran', icon: TrendingDown }, // New Tab
        { id: 'sparepart', label: 'Sparepart Terjual', icon: Package },
        { id: 'service', label: 'Jasa Terjual', icon: Wrench },
        { id: 'attendance', label: 'Absensi Karyawan', icon: UserCheck },
        { id: 'mechanic', label: 'Kinerja Mekanik', icon: Briefcase },
        { id: 'customer', label: 'Laporan Konsumen', icon: Users },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'revenue':
                return <RevenueReport />;
            case 'expenses':
                return <ExpenseReport />;
            case 'sparepart':
                return <SparepartSalesReport />;
            case 'service':
                return <ServiceSalesReport />;
            case 'attendance':
                return <AttendanceReport />;
            case 'customer':
                return <CustomerReport />;
            case 'mechanic':
                return <MechanicReport />;
            default:
                return <RevenueReport />;
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Laporan & Statistik</h1>
                <p style={{ color: 'var(--text-muted)' }}>Analisa performa dan laporan bengkel</p>
            </div>

            {/* Tabs */}
            <div className="card" style={{ marginBottom: '2rem', padding: '0.5rem' }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    flexWrap: 'wrap',
                    paddingBottom: '2px'
                }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.6rem 1rem',
                                    background: isActive ? 'var(--primary)' : 'transparent',
                                    // border: 'none', // Removed duplicate key
                                    borderRadius: 'var(--radius)',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                    fontWeight: isActive ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.9rem',
                                    flex: '1 0 auto',
                                    justifyContent: 'center',
                                    border: isActive ? 'none' : '1px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                        e.currentTarget.style.color = 'var(--text-main)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                    }
                                }}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
}
