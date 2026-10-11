import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ChooseRolePage() {
  const roles = [
    {
      id: 'student',
      title: 'Student / Customer',
      badge: 'Self-Service',
      icon: GraduationCap,
      accentColor: 'var(--color-success)',
      description: 'Request digital tokens, track live queue positions, and receive call notifications directly on your device.',
      loginPath: '/auth/student/login',
      registerPath: '/auth/student/register',
      canRegister: true,
      features: ['Instant digital tokens', 'Live wait estimation', 'Cancel & track anytime']
    },
    {
      id: 'staff',
      title: 'Counter Staff',
      badge: 'Authorized Operations',
      icon: Briefcase,
      accentColor: 'var(--accent-cyan)',
      description: 'Manage assigned service counters, call sequential FIFO tokens, initiate service, and record counter throughput.',
      loginPath: '/auth/staff/login',
      registerPath: '/auth/staff/register',
      canRegister: true,
      features: ['Assigned counter queue', 'Single-click FIFO operations', 'No-show & skip recording']
    },
    {
      id: 'admin',
      title: 'Administrator',
      badge: 'System Governance',
      icon: Shield,
      accentColor: 'var(--accent-purple)',
      description: 'Full campus oversight: create & toggle service counters, assign staff, audit token histories, and view queue analytics.',
      loginPath: '/auth/admin/login',
      registerPath: null,
      canRegister: false,
      features: ['Counter configuration', 'Staff assignment controls', 'Campus analytics & history']
    }
  ];

  return (
    <div className="container" style={{ maxWidth: '1080px', paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          color: 'var(--accent-cyan)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Identity & Access Management
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
          Select Your Portal
        </h1>
        <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          QueueLess enforces role-based access. Select your account type to proceed to the dedicated sign-in portal.
        </p>
      </div>

      <div className="grid-cols-3" style={{ gap: '2rem' }}>
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid var(--border-glass-strong)',
                background: 'rgba(15, 23, 42, 0.75)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${r.accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-brutal-sm)'
                }}>
                  <Icon size={24} color={r.accentColor} />
                </div>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-glass)'
                }}>
                  {r.badge}
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {r.title}
              </h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem', flex: 1 }}>
                {r.description}
              </p>

              <div style={{
                marginBottom: '1.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {r.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} color={r.accentColor} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to={r.loginPath}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Sign In as {r.title.split('/')[0].trim()}
                    <ArrowRight size={16} />
                  </Button>
                </Link>

                {r.canRegister ? (
                  <Link to={r.registerPath}>
                    <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                      Create New {r.title.split('/')[0].trim()} Account
                    </Button>
                  </Link>
                ) : (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    padding: '0.4rem',
                    fontStyle: 'italic'
                  }}>
                    Administrative accounts require system pre-authorization.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
