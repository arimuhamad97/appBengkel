
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { api } from '../services/api';

export default function LoginPage({ onLogin, theme }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await api.login({ username, password });

            if (data.ok) {
                // Successful login
                console.log('Login success');
                onLogin(data.user);
                if (data.user.role === 'gudang') {
                    navigate('/inventory');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Gagal menghubungi server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--text-main)',
            padding: '1rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                margin: '0 auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto clamp(1rem, 3vw, 1.5rem)',
                    }}>
                        <img
                            src={theme === 'light' ? "/logo-light.png" : "/logo.png"}
                            alt="Mutiara Motor Logo"
                            style={{
                                width: 'clamp(80px, 25vw, 120px)',
                                height: 'auto',
                                borderRadius: '12px',
                                mixBlendMode: theme === 'light' ? 'multiply' : 'screen'
                            }}
                        />
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(1.3rem, 5vw, 1.8rem)',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        lineHeight: '1.2'
                    }}>MUTIARA MOTOR</h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: 'clamp(0.85rem, 3vw, 1rem)'
                    }}>Silahkan login untuk melanjutkan</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--danger)',
                        padding: 'clamp(0.6rem, 2vw, 0.8rem)',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                    }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: 'clamp(1rem, 3vw, 1.25rem)' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
                        }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                style={{
                                    paddingLeft: 'clamp(2.2rem, 6vw, 2.5rem)',
                                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                                    minHeight: '44px', // Touch-friendly minimum
                                    width: '100%'
                                }}
                                required
                                autoComplete="username"
                                autoCapitalize="none"
                            />
                            <User
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: 'clamp(10px, 3vw, 12px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
                        }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                style={{
                                    paddingLeft: 'clamp(2.2rem, 6vw, 2.5rem)',
                                    paddingRight: 'clamp(2.2rem, 6vw, 2.5rem)',
                                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                                    minHeight: '44px', // Touch-friendly minimum
                                    width: '100%'
                                }}
                                required
                                autoComplete="current-password"
                            />
                            <Lock
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: 'clamp(10px, 3vw, 12px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 'clamp(10px, 3vw, 12px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    padding: '0.5rem', // Larger touch target
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '44px', // Touch-friendly minimum
                                    minHeight: '44px'
                                }}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                            fontWeight: '600',
                            minHeight: '48px', // Touch-friendly minimum
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'LOGIN'}
                    </button>
                </form>

                {/* Mobile-friendly info text */}
                <div style={{
                    marginTop: 'clamp(1.5rem, 4vw, 2rem)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5'
                }}>
                    <p>Hubungi admin jika lupa password</p>
                </div>
            </div>
        </div>
    );
}
