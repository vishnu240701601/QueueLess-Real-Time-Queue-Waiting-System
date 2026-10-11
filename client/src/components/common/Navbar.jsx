import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, User, LogOut, Menu, X, ShieldAlert, CheckCircle, ChevronDown } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, role, logout, switchPreviewRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleRoleSwitch = (newRole) => {
    switchPreviewRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'student') navigate('/student');
    else if (newRole === 'staff') navigate('/staff');
    else if (newRole === 'admin') navigate('/admin');
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--navy-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
            color: '#ffffff',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(67, 56, 202, 0.35)'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-950)', letterSpacing: '-0.02em' }}>
              Queue<span style={{ color: 'var(--primary-600)' }}>Less</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--navy-600)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Campus Queue System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }} className="desktop-nav">
          <Link
            to="/"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/') ? 'var(--primary-700)' : 'var(--navy-700)',
              borderBottom: isActive('/') ? '2px solid var(--primary-700)' : '2px solid transparent',
              padding: '0.5rem 0'
            }}
          >
            Services
          </Link>
          <Link
            to="/student"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/student') ? 'var(--primary-700)' : 'var(--navy-700)',
              borderBottom: isActive('/student') ? '2px solid var(--primary-700)' : '2px solid transparent',
              padding: '0.5rem 0'
            }}
          >
            Student Dashboard
          </Link>
          <Link
            to="/staff"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/staff') ? 'var(--primary-700)' : 'var(--navy-700)',
              borderBottom: isActive('/staff') ? '2px solid var(--primary-700)' : '2px solid transparent',
              padding: '0.5rem 0'
            }}
          >
            Staff Console
          </Link>
          <Link
            to="/admin"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/admin') ? 'var(--primary-700)' : 'var(--navy-700)',
              borderBottom: isActive('/admin') ? '2px solid var(--primary-700)' : '2px solid transparent',
              padding: '0.5rem 0'
            }}
          >
            Admin Dashboard
          </Link>
          <Link
            to="/history"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/history') ? 'var(--primary-700)' : 'var(--navy-700)',
              borderBottom: isActive('/history') ? '2px solid var(--primary-700)' : '2px solid transparent',
              padding: '0.5rem 0'
            }}
          >
            History
          </Link>
        </nav>

        {/* Role Demo Switcher & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Interactive Role Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--navy-300)',
                background: 'var(--bg-subtle)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--navy-800)',
                cursor: 'pointer'
              }}
              title="Preview another user role"
            >
              <span style={{ color: 'var(--navy-500)' }}>Role:</span>
              <strong style={{ textTransform: 'capitalize', color: 'var(--primary-700)' }}>{role}</strong>
              <ChevronDown size={14} />
            </button>

            {roleMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#ffffff',
                border: '1px solid var(--navy-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.4rem',
                minWidth: '150px',
                zIndex: 200
              }}>
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--navy-500)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Preview Role
                </div>
                {['student', 'staff', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.65rem',
                      background: role === r ? 'var(--primary-50)' : 'transparent',
                      color: role === r ? 'var(--primary-700)' : 'var(--navy-800)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: role === r ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{r}</span>
                    {role === r && <CheckCircle size={14} color="var(--primary-700)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Status / Auth Actions */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'none',
                flexDirection: 'column',
                alignItems: 'flex-end',
                lineHeight: 1.2
              }} className="user-info">
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>{user.full_name}</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--navy-500)', textTransform: 'capitalize' }}>{user.role}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={logout}
                title="Log Out"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Register</Button>
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
              color: 'var(--navy-800)',
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
          background: '#ffffff',
          borderTop: '1px solid var(--navy-200)',
          padding: '1rem 1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Services</Link>
          <Link to="/student" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Student Dashboard</Link>
          <Link to="/staff" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Staff Console</Link>
          <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Admin Dashboard</Link>
          <Link to="/history" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>History</Link>
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
