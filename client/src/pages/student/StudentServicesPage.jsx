import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { ArrowRight, Clock, Users, ArrowLeft } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function StudentServicesPage() {
  const { services, activeToken } = useQueue();

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Student Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Campus Service Directory
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
          Select a Service Counter
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px' }}>
          Select any department counter below to check live counter status, estimate wait time, and join the digital queue.
        </p>
      </div>

      <div className="grid-cols-3" style={{ gap: '1.75rem' }}>
        {services.map((service) => {
          const isServingMe = activeToken && (activeToken.service_id === service.id || activeToken.service_id === service.slug);
          const estWait = (service.waiting_count || 0) * (service.avg_service_time_mins || 4);

          return (
            <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  color: 'var(--accent-purple)',
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  textTransform: 'uppercase'
                }}>
                  {service.department || 'Campus Service'}
                </span>
                <Badge
                  status={service.is_active ? 'active' : 'closed'}
                  label={service.is_active ? 'Open' : 'Paused'}
                />
              </div>

              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {service.name}
              </h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.55 }}>
                {service.description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                padding: '0.85rem',
                background: 'rgba(11, 18, 33, 0.8)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--accent-cyan)" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Waiting</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {service.waiting_count || 0} students
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--accent-purple)" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Est. Wait</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ~{estWait} mins
                    </div>
                  </div>
                </div>
              </div>

              <Link to={`/student/services/${service.slug || service.id}`}>
                <Button
                  variant={isServingMe ? 'success' : 'primary'}
                  style={{ width: '100%' }}
                >
                  {isServingMe ? 'View My Active Token' : 'Enter Counter'}
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
