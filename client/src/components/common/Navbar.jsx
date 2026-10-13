import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinkStyle = (path) => ({
    fontWeight: isActive(path) ? '700' : '400',
    color: isActive(path) ? 'var(--primary)' : 'var(--text)',
    textDecoration: 'none',
    fontSize: '0.9rem',
  });

  return (
    <header style={{
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
            Queue<span style={{ color: 'var(--primary)' }}>Less</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }} className="desktop-nav">
          {!user && (
            <>
              <Link to="/" style={navLinkStyle('/')} onClick={() => setMobileOpen(false)}>Home</Link>
              <a href="#services-preview" style={{ color: 'var(--text)', fontSize: '0.9rem', textDecoration: 'none' }}>Services</a>
            </>
          )}

          {user && role === 'student' && (
            <>
              <Link to="/student/dashboard" style={navLinkStyle('/student/dashboard')}>Dashboard</Link>
              <Link to="/student/services" style={navLinkStyle('/student/services')}>Services</Link>
              <Link to="/student/history" style={navLinkStyle('/student/history')}>My History</Link>
            </>
          )}

          {user && role === 'staff' && (
            <>
              <Link to="/staff/dashboard" style={navLinkStyle('/staff/dashboard')}>Queue Console</Link>
            </>
          )}

          {user && role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={navLinkStyle('/admin/dashboard')}>Overview</Link>
              <Link to="/admin/history" style={navLinkStyle('/admin/history')}>History</Link>
              <Link to="/admin/analytics" style={navLinkStyle('/admin/analytics')}>Analytics</Link>
            </>
          )}
        </nav>

        {/* Right: Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="user-label">
                {user.full_name || user.email?.split('@')[0]} ({role})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/choose-role" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/auth/choose-role" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-hamburger"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              padding: '0.35rem 0.6rem',
              borderRadius: '3px',
              fontSize: '1rem',
              color: 'var(--text)'
            }}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {!user ? (
            <>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)', fontWeight: 600 }}>Home</Link>
              <Link to="/auth/choose-role" onClick={() => setMobileOpen(false)} style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In / Get Started</Link>
            </>
          ) : (
            <>
              {role === 'student' && (
                <>
                  <Link to="/student/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>Dashboard</Link>
                  <Link to="/student/services" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>Services</Link>
                  <Link to="/student/history" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>My History</Link>
                </>
              )}
              {role === 'staff' && (
                <Link to="/staff/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>Queue Console</Link>
              )}
              {role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>Overview</Link>
                  <Link to="/admin/history" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>History</Link>
                  <Link to="/admin/analytics" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)' }}>Analytics</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Logout ({user.full_name || user.email?.split('@')[0]})
              </button>
            </>
          )}
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
          .user-label { display: none !important; }
        }
      `}</style>
    </header>
  );
}
