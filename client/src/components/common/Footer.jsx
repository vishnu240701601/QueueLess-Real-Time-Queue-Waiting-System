import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '1.25rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
          Queue<span style={{ color: 'var(--primary)' }}>Less</span>
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>— Campus Queue System</span>
        </div>

        <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <Link to="/auth/choose-role" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Sign In</Link>
        </nav>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} QueueLess. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
