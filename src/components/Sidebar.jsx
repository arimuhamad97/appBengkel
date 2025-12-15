import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wrench, ShoppingCart, Package, BarChart3, Settings, LogOut, Sun, Moon, Clock, Briefcase, Database } from 'lucide-react';

export default function Sidebar({ user, onLogout, theme, toggleTheme, isOpen, onClose }) {
    const menuItems = [
        { to: "/", icon: <Wrench size={20} />, label: "Servis" },
        { to: "/sales", icon: <ShoppingCart size={20} />, label: "Penjualan" },
        { to: "/inventory", icon: <Package size={20} />, label: "Persediaan" },
        { to: "/reports", icon: <BarChart3 size={20} />, label: "Laporan" },
        { to: "/attendance", icon: <Clock size={20} />, label: "Absensi" },
        { to: "/database-backup", icon: <Database size={20} />, label: "Backup Database" },
        { to: "/settings", icon: <Settings size={20} />, label: "Pengaturan" },
    ];

    const displayMenu = (user?.role === 'gudang')
        ? menuItems.filter(item => item.to === '/inventory')
        : menuItems;

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', paddingLeft: '0.5rem' }}>
                <img
                    src={theme === 'light' ? "/logo-light.png" : "/logo.png"}
                    alt="Logo"
                    style={{
                        width: '50px',
                        height: 'auto',
                        borderRadius: '4px',
                        mixBlendMode: theme === 'light' ? 'multiply' : 'screen'
                    }}
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1.1' }}>Mutiara<br />Motor</span>

                {/* Close Button for Mobile */}
                <button
                    onClick={onClose}
                    style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        display: 'none',
                    }}
                    className="mobile-close-btn"
                >
                    <LogOut size={24} style={{ transform: 'rotate(180deg)' }} />
                </button>
            </div>

            <nav>
                {displayMenu.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {user?.username ? user.username.substring(0, 2) : 'G'}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: 'var(--text-main)', fontWeight: '500', textTransform: 'capitalize' }}>
                                {user?.username || 'Guest'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                {user?.role || 'Visitor'}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={onLogout}
                            title="Logout"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--danger)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
