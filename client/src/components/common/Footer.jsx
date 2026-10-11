import React from 'react';
import { Layers, ShieldCheck, Clock, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid var(--navy-200)',
      padding: '2.5rem 0 1.5rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Layers size={22} color="var(--primary-700)" />
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-950)' }}>QueueLess</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)', lineHeight: 1.6 }}>
              A real-time digital queuing solution built for college canteens, administrative offices, photocopy centers, and service counters.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--navy-900)' }}>Key Highlights</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--navy-700)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} color="var(--primary-600)" /> Real-Time Wait Estimates</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Zap size={16} color="var(--warning-600)" /> Zero Duplicate Token Guarantee</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={16} color="var(--success-600)" /> Role-Based Access Control</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--navy-900)' }}>Architecture & Deployment</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)', lineHeight: 1.6 }}>
              Frontend deployed on <strong>Netlify</strong>. Backend powered by <strong>Vercel Serverless Express</strong> and <strong>Supabase PostgreSQL</strong> with atomic RPC stored procedures.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--navy-100)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--navy-500)'
        }}>
          <div>&copy; {new Date().getFullYear()} QueueLess – Real-Time Queue Waiting System. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Netlify SPA</span>
            <span>•</span>
            <span>Supabase Realtime</span>
            <span>•</span>
            <span>Vercel Edge</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
