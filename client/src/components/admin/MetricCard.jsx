import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'var(--primary-50)', text: 'var(--primary-700)' },
    success: { bg: 'var(--success-50)', text: 'var(--success-700)' },
    warning: { bg: 'var(--warning-50)', text: 'var(--warning-700)' },
    info: { bg: 'var(--info-50)', text: 'var(--info-700)' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        background: scheme.bg,
        color: scheme.text,
        padding: '0.85rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {Icon && <Icon size={28} />}
      </div>
      <div>
        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.85rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--navy-950)', lineHeight: 1.2 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
