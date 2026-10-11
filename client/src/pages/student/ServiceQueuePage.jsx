import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Ticket, 
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function ServiceQueuePage() {
  const { serviceSlug } = useParams();
  const { services, activeToken, joinQueue, cancelToken } = useQueue();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  // Find matching service by slug or id
  useEffect(() => {
    if (services && services.length > 0) {
      const match = services.find(s => s.slug === serviceSlug || s.id === serviceSlug);
      setService(match || null);
    }
  }, [services, serviceSlug]);

  if (!service) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <AlertTriangle size={48} color="var(--color-warning)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Service Counter Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            The requested service counter does not exist or may have been unlisted by the campus administration.
          </p>
          <Link to="/student/services">
            <Button variant="primary">Browse All Campus Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isHoldingThisToken = activeToken && (activeToken.service_id === service.id || activeToken.service_id === service.slug);
  const estWait = (service.waiting_count || 0) * (service.avg_service_time_mins || 4);

  const handleGetToken = async () => {
    setError('');
    setLoading(true);
    try {
      await joinQueue(service.id);
    } catch (err) {
      setError(err.message || 'Failed to request token.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelToken = async () => {
    if (!activeToken) return;
    setCancelling(true);
    try {
      await cancelToken(activeToken.id, 'Cancelled by student from service view');
      setCancelModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to cancel token');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '960px', paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/student/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Services Directory
        </Link>
        <Link to="/student/dashboard" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
          View Student Dashboard &rarr;
        </Link>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-danger-bg)',
          border: '1.5px solid var(--color-danger-border)',
          color: '#f87171',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {/* Main Service Card */}
      <div className="card" style={{ border: '2px solid var(--border-glass-strong)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--accent-purple)',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '0.25rem 0.7rem',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.04em'
            }}>
              {service.department}
            </span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
              {service.name}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.6 }}>
              {service.description}
            </p>
          </div>

          <Badge
            status={service.is_active ? 'active' : 'closed'}
            label={service.is_active ? 'Counter Open' : 'Counter Paused'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          />
        </div>

        {/* Counter Live Metrics Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(11, 18, 33, 0.85)',
          border: '1.5px solid var(--border-glass)',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Now Serving
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {service.serving_token ? `${service.token_prefix}-${String(service.serving_token).padStart(3, '0')}` : 'None'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Waiting in Line
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {service.waiting_count || 0} students
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Est. Turnaround
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>
              ~{estWait} mins
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Avg. Time / Student
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {service.avg_service_time_mins || 4} mins
            </div>
          </div>
        </div>

        {/* Status Actions */}
        {!service.is_active ? (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-bg)',
            border: '1.5px solid var(--color-warning-border)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong>Service Counter Temporarily Paused</strong>
              <div style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>
                Staff have paused new token issuance for this counter. Existing active tokens will be served. Please check back shortly or visit another desk.
              </div>
            </div>
          </div>
        ) : isHoldingThisToken ? (
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid var(--color-success)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <CheckCircle2 size={14} /> You hold an active token for this counter
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                Token #{activeToken.display_number || activeToken.token_number}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Position: <strong>{activeToken.peopleAhead ?? (activeToken.totalAhead || 0)} students ahead</strong> • Status: <strong style={{ textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>{activeToken.status}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/student/dashboard">
                <Button variant="primary">
                  View Full Live Card
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Button
                variant="outline-danger"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Token
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Clicking below assigns your sequential FIFO digital token without standing in a physical queue.
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetToken}
              loading={loading}
              style={{ minWidth: '220px' }}
            >
              Get Digital Token
              <Ticket size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {cancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <XCircle size={28} color="var(--color-danger)" />
              <h2 style={{ fontSize: '1.35rem' }}>Cancel Token Confirmation</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to cancel token <strong>#{activeToken?.display_number || activeToken?.token_number}</strong> for {service.name}? This will permanently surrender your queue position.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
                Keep My Place
              </Button>
              <Button variant="danger" onClick={handleCancelToken} loading={cancelling}>
                Yes, Cancel Token
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
