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
          fontWeight: 600,
          color: 'var(--primary)',
          background: 'var(--primary-light)',
          padding: '0.2rem 0.5rem',
          border: '1px solid var(--border)'
        }}>
          {service.department}
        </span>
        <Badge status={service.is_active ? 'active' : 'paused'} label={service.is_active ? 'Open' : 'Paused'} />
      </div>

      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
        {service.name}
      </h3>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
        {service.description}
      </p>

      {/* Counter Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        padding: '0.6rem 0.75rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Queue Size</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              {service.waiting_count || 0} waiting
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Wait</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              ~{estWait} min
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
