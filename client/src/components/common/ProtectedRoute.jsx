import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import Button from './Button';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="skeleton" style={{ width: '240px', height: '24px', margin: '0 auto 1rem' }} />
        <div className="skeleton" style={{ width: '380px', height: '48px', margin: '0 auto' }} />
      </div>
    );
  }

  // Not logged in -> Redirect to role selection portal
  if (!user) {
    return <Navigate to="/auth/choose-role" replace />;
  }

  // Role verification check
  if (allowedRoles && !allowedRoles.includes(role)) {
    const roleDashboardMap = {
      student: '/student/dashboard',
      staff: '/staff/dashboard',
      admin: '/admin/dashboard'
    };
    const userHome = roleDashboardMap[role] || '/';

    return (
      <div className="container" style={{ maxWidth: '580px', paddingTop: '3.5rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ border: '2px solid var(--color-danger-border)', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            border: '2px solid var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-brutal-sm)'
          }}>
            <ShieldAlert size={36} color="var(--color-danger)" />
          </div>

          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#f87171',
            letterSpacing: '0.06em'
          }}>
            HTTP 403 Forbidden
          </span>

          <h1 style={{ fontSize: '1.85rem', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            Access Denied
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account is verified as <strong>'{role}'</strong>, but this section requires one of the following authorized roles: <code style={{ color: 'var(--accent-cyan)', background: 'rgba(0,0,0,0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>[{allowedRoles.join(', ')}]</code>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={userHome}>
              <Button variant="primary">
                Return to My Dashboard
              </Button>
            </Link>
            <Button variant="secondary" icon={LogOut} onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
