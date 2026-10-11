import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { Layers, ArrowRight, Clock, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function LandingPage() {
  const { services } = useQueue();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleServiceClick = (serviceId) => {
    if (user && role === 'student') {
      navigate(`/student/services/${serviceId}`);
    } else {
      navigate('/auth/choose-role');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 0 5.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1.5px solid rgba(168, 85, 247, 0.35)',
              padding: '0.45rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#c084fc',
              marginBottom: '1.75rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <span className="pulse-dot" style={{ color: 'var(--accent-cyan)' }} />
              <span>Campus Digital Queue System</span>
            </div>

            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem'
            }}>
              Stop Waiting in Physical Lines. <br />
              <span style={{
                background: 'linear-gradient(90deg, #c084fc 0%, var(--accent-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Queue Digitally in Real Time.
              </span>
            </h1>

            <p style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2.5rem'
            }}>
              QueueLess eliminates physical congestion across campus canteens, photocopy shops, examination offices, and administrative desks. Request a digital token, monitor your queue position from your phone, and arrive precisely when your number is called.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/auth/choose-role">
                <Button variant="primary" size="lg" style={{ minWidth: '180px' }}>
                  Get Started
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="#services-preview">
                <Button variant="secondary" size="lg" style={{ minWidth: '180px' }}>
                  Explore Services
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Clean Services Preview */}
      <section id="services-preview" style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1.5px solid var(--border-glass)',
            paddingBottom: '1.25rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                Active Service Counters
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                Live Campus Counters
              </h2>
            </div>
            <Link
              to="/auth/choose-role"
              style={{
                fontSize: '0.925rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--accent-cyan)'
              }}
            >
              Sign In to Enter Queue <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="grid-cols-3">
            {services.map((service) => (
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

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {service.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.55 }}>
                  {service.description}
                </p>

                {/* Queue Stats Pill */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  background: 'rgba(11, 18, 33, 0.8)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Waiting</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {service.waiting_count || 0} in queue
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="var(--accent-purple)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Est. Wait</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ~{(service.waiting_count || 0) * (service.avg_service_time_mins || 4)} mins
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleServiceClick(service.id)}
                  disabled={!service.is_active}
                  style={{ width: '100%' }}
                >
                  {service.is_active ? 'Get Digital Token' : 'Counter Paused'}
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
