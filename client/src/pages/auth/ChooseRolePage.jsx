import React from 'react';
import { Link } from 'react-router-dom';

export default function ChooseRolePage() {
  return (
    <div className="container" style={{ maxWidth: '500px', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Sign In to QueueLess</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        Select your account type to access the appropriate portal.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Student */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Student</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Get tokens and track your queue position
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px', alignItems: 'flex-end' }}>
              <Link to="/auth/student/login" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Sign In
              </Link>
              <Link to="/auth/student/register" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Counter Staff</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage assigned service counters and queue flow
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px', alignItems: 'flex-end' }}>
              <Link to="/auth/staff/login" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Sign In
              </Link>
              <Link to="/auth/staff/register" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* Admin */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Administrator</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Full system management — requires pre-authorization
              </div>
            </div>
            <div style={{ minWidth: '120px', display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/auth/admin/login" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link to="/">&larr; Back to Home</Link>
      </p>
    </div>
  );
}
