import React, { useState } from 'react';
import { Clock, Users, XCircle, AlertCircle, BellRing } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';

export default function ActiveTokenBanner({ token, onCancel }) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!token) return null;

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(token.id, 'Student cancelled via dashboard');
      setCancelModalOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  const isCalled = token.status === 'called';
  const isServing = token.status === 'serving';

  return (
    <div className="info-box info-box--primary" style={{ marginBottom: '1.5rem' }}>
      {isCalled && (
        <div className="alert alert-info" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <BellRing size={16} />
          Your token is being called now! Proceed to the counter immediately.
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ marginBottom: '0.35rem' }}>
            <Badge status={token.status} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{token.serviceName}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{token.department || 'Campus Counter'}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Your Token</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {token.display_number || `#${token.token_number}`}
          </div>
        </div>
      </div>

      {/* Live Queue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="surface-box">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>People Ahead</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {token.totalAhead ?? (token.peopleAhead || 0)}
          </div>
        </div>
        <div className="surface-box">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>Est. Wait</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            ~{token.estWaitMins || 4} min
          </div>
        </div>
        <div className="surface-box">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>Status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
            {token.status}
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
        {['Waiting', 'Called', 'Serving', 'Completed'].map((step, i) => {
          const stages = ['waiting', 'called', 'serving', 'completed'];
          const currentIdx = stages.indexOf(token.status);
          const active = i <= currentIdx;
          return (
            <span key={step} style={{ padding: '0.2rem 0.6rem', borderRadius: '3px', border: '1px solid', borderColor: active ? 'var(--primary)' : 'var(--border)', background: active ? 'var(--primary-light)' : 'transparent', color: active ? 'var(--primary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>
              {i + 1}. {step}
            </span>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span className="pulse-dot" style={{ marginRight: '0.4rem' }} />
          Real-time updates active
        </span>
        <Button
          variant="outline-danger"
          size="sm"
          icon={XCircle}
          onClick={() => setCancelModalOpen(true)}
          disabled={token.status === 'serving' || token.status === 'completed'}
        >
          Cancel Token
        </Button>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Token?"
      >
        <p style={{ marginBottom: '1rem' }}>
          Are you sure you want to cancel token <strong>#{token.display_number || token.token_number}</strong>?
          This will surrender your queue position for {token.serviceName}.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>Keep My Place</Button>
          <Button variant="danger" loading={cancelling} onClick={handleConfirmCancel}>Yes, Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
