import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ServicePage from './pages/ServicePage';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AttendancePage from './pages/AttendancePage';
import DatabaseBackup from './components/DatabaseBackup';

import { Menu } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check local storage for persisted login (simple version)
    const storedUser = localStorage.getItem('bengkel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check local storage for theme
    const storedTheme = localStorage.getItem('bengkel_theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('bengkel_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('bengkel_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bengkel_user');
  };

  if (loading) return null;

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} theme={theme} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="layout">
          {/* Mobile Header */}
          <div className="mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={theme === 'light' ? "/logo-light.png" : "/logo.png"}
                alt="Logo"
                style={{ height: '32px', borderRadius: '4px', mixBlendMode: theme === 'light' ? 'multiply' : 'screen' }}
              />
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mutiara Motor</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Overlay for mobile sidebar */}
          <div
            className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          />

          <Sidebar
            user={user}
            onLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          <main className="main-content no-scrollbar">
            <Routes>
              <Route path="/" element={<ServicePage user={user} />} />
              <Route path="/sales" element={<SalesPage user={user} />} />
              <Route path="/inventory" element={<InventoryPage user={user} />} />
              <Route path="/reports" element={<ReportsPage user={user} />} />
              <Route path="/attendance" element={<AttendancePage user={user} />} />
              <Route path="/database-backup" element={<DatabaseBackup />} />
              <Route path="/settings" element={<SettingsPage user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
