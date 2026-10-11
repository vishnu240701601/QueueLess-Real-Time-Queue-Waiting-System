import React, { useState } from 'react';
import { Clock, Users, XCircle, AlertCircle, Sparkles, BellRing } from 'lucide-react';
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

  // Determine stage index
  const stages = ['waiting', 'called', 'serving', 'completed'];
  const currentStageIndex = stages.indexOf(token.status) !== -1 ? stages.indexOf(token.status) : 0;

  return (
    <div className="card" style={{
      background: 'rgba(15, 23, 42, 0.9)',
      border: isCalled ? '2px solid var(--accent-cyan)' : '2px solid var(--accent-purple)',
      boxShadow: isCalled ? 'var(--shadow-brutal-cyan)' : 'var(--shadow-brutal-purple)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '2.5rem'
    }}>
      {/* Animated Call Alert Ribbon */}
      {isCalled && (
        <div style={{
          background: 'linear-gradient(90deg, var(--accent-cyan), #0284c7)',
          color: '#080c16',
          padding: '0.65rem 1.25rem',
          margin: '-1.75rem -1.75rem 1.25rem -1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 800,
          fontSize: '0.925rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <BellRing size={20} className="pulse-dot" />
          <span>Your token is being called right now! Proceed immediately to the counter.</span>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-purple)' }}>
              Active Queue Ticket
            </span>
            <Badge status={token.status} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{token.serviceName}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{token.department || 'Campus Counter'}</p>
        </div>

        <div style={{
          textAlign: 'right',
          background: 'rgba(124, 58, 237, 0.15)',
          border: '2px solid var(--accent-purple)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1.25rem',
          boxShadow: 'var(--shadow-brutal-sm)'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>Your Token</span>
          <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {token.display_number || `#${token.token_number}`}
          </div>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        background: 'rgba(11, 18, 33, 0.85)',
        border: '1.5px solid var(--border-glass)',
        borderRadius: 'var(--radius-md)',
        padding: '1.15rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>People Ahead</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {token.totalAhead ?? (token.peopleAhead || 0)} {token.totalAhead === 1 ? 'student' : 'students'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(2, 132, 199, 0.15)', color: 'var(--accent-cyan)', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Estimated Wait</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ~{token.estWaitMins || 4} mins
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Queue Progress</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isServing ? 'var(--color-success)' : isCalled ? 'var(--accent-cyan)' : 'var(--text-primary)', textTransform: 'capitalize' }}>
              {token.status}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span style={{ color: currentStageIndex >= 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>1. In Queue</span>
          <span style={{ color: currentStageIndex >= 1 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>2. Called to Counter</span>
          <span style={{ color: currentStageIndex >= 2 ? 'var(--color-success)' : 'var(--text-muted)' }}>3. Being Served</span>
          <span style={{ color: currentStageIndex >= 3 ? 'var(--color-success)' : 'var(--text-muted)' }}>4. Completed</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((currentStageIndex + 1) / 4) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="pulse-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} />
          <span>Real-time queue synchronization active</span>
        </div>
        <div>
          <Button
            variant="outline-danger"
            size="sm"
            icon={XCircle}
            onClick={() => setCancelModalOpen(true)}
            disabled={token.status === 'serving' || token.status === 'completed'}
          >
            Cancel My Token
          </Button>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Your Queue Token?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.25rem' }}>
          <AlertCircle size={44} color="var(--color-danger)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Are you sure you want to cancel token <strong>#{token.display_number || token.token_number}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Surrendering your token releases your spot in the queue for {token.serviceName}.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
            Keep My Place
          </Button>
          <Button variant="danger" loading={cancelling} onClick={handleConfirmCancel}>
            Yes, Cancel Token
          </Button>
        </div>
      </Modal>
    </div>
  );
}
