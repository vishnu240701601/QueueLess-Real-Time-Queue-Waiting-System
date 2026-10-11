import React, { useState } from 'react';
import { Link } from 'lucide-react';
import { Clock, Users, ArrowRight, XCircle, AlertCircle, Sparkles } from 'lucide-react';
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

  // Determine stage index
  const stages = ['waiting', 'called', 'serving', 'completed'];
  const currentStageIndex = stages.indexOf(token.status) !== -1 ? stages.indexOf(token.status) : 0;

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '2px solid var(--primary-500)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      {/* Top accent banner */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, var(--primary-600), var(--warning-500), var(--success-500))'
      }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-700)' }}>
              Active Queue Ticket
            </span>
            <Badge status={token.status} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--navy-950)' }}>{token.serviceName}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)' }}>{token.department}</p>
        </div>

        <div style={{
          textAlign: 'right',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-100)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.65rem 1.25rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-700)', textTransform: 'uppercase' }}>Your Token</span>
          <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary-900)', lineHeight: 1 }}>
            {token.display_number || `#${token.token_number}`}
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        background: '#ffffff',
        border: '1px solid var(--navy-200)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--warning-50)', color: 'var(--warning-700)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--navy-600)' }}>People Ahead of You</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {token.totalAhead} {token.totalAhead === 1 ? 'person' : 'people'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--info-50)', color: 'var(--info-700)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--navy-600)' }}>Estimated Wait Time</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              ~{token.estWaitMins} mins
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--success-50)', color: 'var(--success-700)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--navy-600)' }}>Currently Serving</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success-700)' }}>
              Token #{token.token_number - token.totalAhead > 0 ? token.token_number - token.totalAhead : 'Waiting'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy-700)' }}>
          <span style={{ color: currentStageIndex >= 0 ? 'var(--primary-700)' : 'inherit' }}>1. In Queue</span>
          <span style={{ color: currentStageIndex >= 1 ? 'var(--primary-700)' : 'inherit' }}>2. Called to Counter</span>
          <span style={{ color: currentStageIndex >= 2 ? 'var(--primary-700)' : 'inherit' }}>3. Being Served</span>
          <span style={{ color: currentStageIndex >= 3 ? 'var(--success-700)' : 'inherit' }}>4. Completed</span>
        </div>
        <div style={{ height: '8px', background: 'var(--navy-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((currentStageIndex + 1) / 4) * 100}%`,
            background: 'linear-gradient(90deg, var(--primary-600), var(--success-600))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.825rem', color: 'var(--navy-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span className="pulse-dot" style={{ backgroundColor: 'var(--success-600)' }} />
          <span>Real-time live queue sync active</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline-danger"
            size="sm"
            icon={XCircle}
            onClick={() => setCancelModalOpen(true)}
          >
            Cancel Token
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
          <AlertCircle size={44} color="var(--danger-600)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.95rem', color: 'var(--navy-800)', marginBottom: '0.5rem' }}>
            Are you sure you want to give up your spot in line for <strong>{token.serviceName}</strong>?
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
            Your token number <strong>{token.display_number}</strong> will be permanently released.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
            Keep My Token
          </Button>
          <Button variant="danger" loading={cancelling} onClick={handleConfirmCancel}>
            Yes, Cancel Token
          </Button>
        </div>
      </Modal>
    </div>
  );
}
