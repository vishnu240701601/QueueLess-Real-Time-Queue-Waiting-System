import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, LogOut, Menu, X, User, Shield, Briefcase, GraduationCap } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={{
      background: 'rgba(8, 12, 22, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple), #9333ea)',
            color: '#ffffff',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            border: '2px solid #a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-brutal-sm)'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Queue<span style={{ color: 'var(--accent-cyan)' }}>Less</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Campus Queue System
            </span>
          </div>
        </Link>

        {/* Desktop Role-Based Navigation */}
        <nav style={{ display: 'none', gap: '1.75rem', alignItems: 'center' }} className="desktop-nav">
          {/* Public / Guest Links */}
          {!user && (
            <>
              <Link
                to="/"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                Home
              </Link>
              <a
                href="#services-preview"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: 'var(--text-secondary)'
                }}
              >
                Services
              </a>
            </>
          )}

          {/* Student Links */}
          {user && role === 'student' && (
            <>
              <Link
                to="/"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                Home
              </Link>
              <Link
                to="/student/services"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/student/services') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                Services
              </Link>
              <Link
                to="/student/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/student/dashboard') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                My Active Token
              </Link>
              <Link
                to="/student/history"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/student/history') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                My Tokens / History
              </Link>
            </>
          )}

          {/* Staff Links */}
          {user && role === 'staff' && (
            <>
              <Link
                to="/staff/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/staff/dashboard') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                Assigned Counters
              </Link>
              <Link
                to="/staff/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: 'var(--text-secondary)'
                }}
              >
                Active Queue
              </Link>
            </>
          )}

          {/* Admin Links */}
          {user && role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/admin/dashboard') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                Overview
              </Link>
              <Link
                to="/admin/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: 'var(--text-secondary)'
                }}
              >
                Counter Management
              </Link>
              <Link
                to="/admin/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: 'var(--text-secondary)'
                }}
              >
                Staff Management
              </Link>
              <Link
                to="/admin/history"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive('/admin/history') ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                History & Analytics
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)'
              }} className="user-info">
                {role === 'admin' ? (
                  <Shield size={16} color="var(--accent-purple)" />
                ) : role === 'staff' ? (
                  <Briefcase size={16} color="var(--accent-cyan)" />
                ) : (
                  <GraduationCap size={16} color="var(--color-success)" />
                )}
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {user.full_name || user.email?.split('@')[0]}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {role}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <Link to="/auth/choose-role">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/choose-role">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '0.4rem'
            }}
            className="mobile-hamburger"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(8, 12, 22, 0.98)',
          borderTop: '1px solid var(--border-glass)',
          padding: '1.25rem 1.5rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {!user ? (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Home</Link>
              <Link to="/auth/choose-role" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>Sign In / Role Selection</Link>
              <Link to="/auth/choose-role" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" style={{ width: '100%' }}>Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              {role === 'student' && (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Home</Link>
                  <Link to="/student/services" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Services</Link>
                  <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>My Active Token</Link>
                  <Link to="/student/history" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>My History</Link>
                </>
              )}
              {role === 'staff' && (
                <>
                  <Link to="/staff/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Assigned Counters</Link>
                  <Link to="/staff/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Active Queue</Link>
                </>
              )}
              {role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Overview & Management</Link>
                  <Link to="/admin/history" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>History & Analytics</Link>
                </>
              )}
              <Button variant="secondary" size="sm" icon={LogOut} onClick={handleLogout} style={{ width: '100%' }}>
                Logout ({user.full_name})
              </Button>
            </>
          )}
        </div>
      )}

      {/* Inline styles for responsive navbar */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav { display: flex !important; }
          .mobile-hamburger { display: none !important; }
          .user-info { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
