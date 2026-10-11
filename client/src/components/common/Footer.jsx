import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(8, 12, 22, 0.95)',
      borderTop: '1px solid var(--border-glass)',
      padding: '2.5rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-purple), #9333ea)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-brutal-sm)'
            }}>
              <Layers size={18} />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Queue<span style={{ color: 'var(--accent-cyan)' }}>Less</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Real-Time Campus Queuing System
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <Link to="/auth/choose-role" style={{ color: 'var(--text-muted)' }}>Sign In</Link>
            <Link to="/auth/choose-role" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>Get Started</Link>
          </div>
        </div>

        <div style={{
          paddingTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>&copy; {new Date().getFullYear()} QueueLess. Fast, reliable digital queue management.</div>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
            <span>Campus Edition</span>
            <span>•</span>
            <span>Protected Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
