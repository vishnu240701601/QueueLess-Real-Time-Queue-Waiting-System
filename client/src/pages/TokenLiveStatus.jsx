import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { ArrowLeft, Clock, Users, Bell, AlertCircle, Sparkles, XCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

export default function TokenLiveStatus() {
  const { activeToken, cancelToken } = useQueue();
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!activeToken) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '520px' }}>
        <EmptyState
          icon={AlertCircle}
          title="No Active Ticket Found"
          description="You do not currently hold an active queue token. Join a counter queue from the student dashboard."
          actionLabel="Browse Services"
          onAction={() => navigate('/student/services')}
        />
      </div>
    );
  }

  const isCalled = activeToken.status === 'called';

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelToken(activeToken.id, 'Cancelled from live view');
      setCancelModalOpen(false);
      navigate('/student/dashboard');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', padding: '1.5rem 1rem 4rem' }}>
      <Link
        to="/student/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} />
        Back to Student Dashboard
      </Link>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        {isCalled && (
          <div className="alert alert-info" style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 700
          }}>
            <Bell size={18} />
            <span>It's Your Turn! Please Proceed to Counter</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Badge status={activeToken.status} />
        </div>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
          {activeToken.serviceName}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {activeToken.department || 'Campus Service Counter'}
        </p>

        {/* Big Token Number Display */}
        <div style={{
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--primary)',
          margin: '0.5rem 0',
          lineHeight: 1
        }}>
          {activeToken.display_number || `#${activeToken.token_number}`}
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Issued to: <strong>{activeToken.user_name || 'Student'}</strong>
        </p>

        {/* Queue Metrics Pill */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.75rem'
        }}>
          <div className="surface-box" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
              People Ahead
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {activeToken.totalAhead ?? (activeToken.peopleAhead || 0)}
            </div>
          </div>

          <div className="surface-box" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
              Est. Wait Time
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
              ~{activeToken.estWaitMins || 4} min
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline-danger"
          size="sm"
          icon={XCircle}
          onClick={() => setCancelModalOpen(true)}
          disabled={activeToken.status === 'serving' || activeToken.status === 'completed'}
          style={{ width: '100%' }}
        >
          Cancel Token
        </Button>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Queue Token"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.25rem' }}>
          <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            Are you sure you want to cancel token <strong>#{activeToken.display_number || activeToken.token_number}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This will release your position in line.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>Keep Token</Button>
          <Button variant="danger" loading={cancelling} onClick={handleConfirmCancel}>Yes, Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
