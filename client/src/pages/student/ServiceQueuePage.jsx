import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function ServiceQueuePage() {
  const { serviceSlug } = useParams();
  const { services, activeToken, joinQueue, cancelToken } = useQueue();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (services && services.length > 0) {
      const match = services.find(s => s.slug === serviceSlug || s.id === serviceSlug);
      setService(match || null);
    }
  }, [services, serviceSlug]);

  if (!service) {
    return (
      <div className="container" style={{ maxWidth: '560px', paddingTop: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '0.5rem' }}>Service Counter Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            The requested service counter does not exist or has been removed.
          </p>
          <Link to="/student/services" className="btn btn-primary">Browse All Services</Link>
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
    <div className="container" style={{ maxWidth: '800px', paddingTop: '1rem', paddingBottom: '3rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        <Link to="/student/services">&larr; Back to Services</Link>
        <Link to="/student/dashboard">My Dashboard &rarr;</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Service Info */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              {service.department}
            </div>
            <h1 style={{ marginBottom: '0.25rem' }}>{service.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{service.description}</p>
          </div>
          <Badge status={service.is_active ? 'active' : 'closed'} label={service.is_active ? 'Open' : 'Paused'} />
        </div>

        {/* Live Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="surface-box">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Now Serving</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
              {service.serving_token
                ? `${service.token_prefix}-${String(service.serving_token).padStart(3, '0')}`
                : 'None'}
            </div>
          </div>
          <div className="surface-box">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Waiting</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{service.waiting_count || 0}</div>
          </div>
          <div className="surface-box">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Wait</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>~{estWait} min</div>
          </div>
          <div className="surface-box">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg. / Person</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{service.avg_service_time_mins || 4} min</div>
          </div>
        </div>

        {/* Action Area */}
        {!service.is_active ? (
          <div className="alert alert-warning">
            <strong>Counter Paused</strong> — new token issuance is temporarily suspended. Existing tokens will continue to be served.
          </div>
        ) : isHoldingThisToken ? (
          <div className="info-box info-box--success">
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>You have an active token for this counter:</strong>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.75rem', color: 'var(--success)' }}>
                #{activeToken.display_number || activeToken.token_number}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {activeToken.peopleAhead ?? (activeToken.totalAhead || 0)} people ahead &nbsp;|&nbsp;
              Status: <strong style={{ textTransform: 'capitalize' }}>{activeToken.status}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/student/dashboard" className="btn btn-primary btn-sm">View My Token</Link>
              <button className="btn btn-outline-danger btn-sm" onClick={() => setCancelModalOpen(true)}>
                Cancel Token
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Get a digital token and join the queue from anywhere.
            </p>
            <Button variant="primary" size="lg" onClick={handleGetToken} loading={loading}>
              Get Digital Token
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation */}
      {cancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0 }}>Cancel Token?</h3>
              <button onClick={() => setCancelModalOpen(false)} style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>&times;</button>
            </div>
            <p style={{ marginBottom: '1.25rem' }}>
              Cancel token <strong>#{activeToken?.display_number || activeToken?.token_number}</strong> for {service.name}?
              This will permanently surrender your queue position.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setCancelModalOpen(false)}>Keep My Place</button>
              <button className="btn btn-danger" onClick={handleCancelToken} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
