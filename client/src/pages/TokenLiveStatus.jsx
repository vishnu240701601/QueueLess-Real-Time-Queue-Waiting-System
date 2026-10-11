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
          fontWeight: 600,
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}
      >
        <ArrowLeft size={18} />
        Back to Student Dashboard
      </Link>

      {/* Digital Ticket Card */}
      <div className="card" style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: isCalled ? '2px solid var(--accent-cyan)' : '2px solid var(--accent-purple)',
        boxShadow: isCalled ? 'var(--shadow-brutal-cyan)' : 'var(--shadow-brutal-purple)',
        padding: '2.25rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {isCalled && (
          <div style={{
            background: 'linear-gradient(90deg, var(--accent-cyan), #0284c7)',
            color: '#080c16',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <Bell size={18} className="pulse-dot" />
            <span>It's Your Turn! Please Proceed to Counter</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Badge status={activeToken.status} />
        </div>

        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {activeToken.serviceName}
        </span>

        {/* Big Token Number Display */}
        <div style={{
          fontSize: '3.75rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          color: 'var(--accent-cyan)',
          letterSpacing: '-0.02em',
          margin: '0.25rem 0 0.5rem',
          lineHeight: 1
        }}>
          {activeToken.display_number || `#${activeToken.token_number}`}
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
          Issued to: <strong style={{ color: 'var(--text-primary)' }}>{activeToken.user_name || 'Student'}</strong>
        </p>

        {/* Queue Metrics Pill */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          background: 'rgba(11, 18, 33, 0.85)',
          border: '1.5px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              People Ahead
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {activeToken.totalAhead ?? (activeToken.peopleAhead || 0)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Est. Wait Time
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fbbf24' }}>
              ~{activeToken.estWaitMins || 4}m
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
          Surrender / Cancel Token
        </Button>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Your Queue Token?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.25rem' }}>
          <AlertCircle size={44} color="var(--color-danger)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Are you sure you want to cancel token <strong>#{activeToken.display_number || activeToken.token_number}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This will release your position in the line.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>Keep My Place</Button>
          <Button variant="danger" loading={cancelling} onClick={handleConfirmCancel}>Yes, Cancel Token</Button>
        </div>
      </Modal>
    </div>
  );
}
