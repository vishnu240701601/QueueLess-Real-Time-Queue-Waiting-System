import React from 'react';
import { Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function ServiceCard({ service, onJoin, hasActiveToken, isJoining }) {
  const estWait = (service.waiting_count || 0) * (service.avg_service_time_mins || 4);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header" style={{ marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--primary-700)',
          background: 'var(--primary-50)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          {service.department}
        </span>
        <Badge status={service.is_active ? 'active' : 'paused'} label={service.is_active ? 'Open' : 'Paused'} />
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--navy-950)' }}>
        {service.name}
      </h3>

      <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)', marginBottom: '1.25rem', flex: 1 }}>
        {service.description}
      </p>

      {/* Counter Stats Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.65rem',
        padding: '0.75rem',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--navy-500)" />
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--navy-500)', fontWeight: 600 }}>Queue Size</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {service.waiting_count || 0} waiting
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--navy-500)" />
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--navy-500)', fontWeight: 600 }}>Est. Wait</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              ~{estWait} mins
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <Button
        variant="primary"
        onClick={() => onJoin(service.id)}
        disabled={!service.is_active || hasActiveToken}
        loading={isJoining}
        style={{ width: '100%' }}
      >
        {hasActiveToken ? (
          <>
            <CheckCircle2 size={16} />
            Already In Queue
          </>
        ) : (
          <>
            Get Token
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
}
