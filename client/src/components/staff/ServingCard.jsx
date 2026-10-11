import React, { useState } from 'react';
import { Play, CheckCircle, SkipForward, AlertCircle, Clock, User, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

export default function ServingCard({ currentToken, onStart, onComplete, onSkip }) {
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  if (!currentToken) {
    return (
      <div className="card" style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '2px dashed var(--border-glass-strong)',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          <Clock size={40} style={{ margin: '0 auto' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Counter Idle / Ready
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
          No customer is currently called or being served. Click <strong>Call Next Token</strong> to summon the next FIFO student in line.
        </p>
      </div>
    );
  }

  const isCalled = currentToken.status === 'called';
  const isServing = currentToken.status === 'serving';

  const handleConfirmComplete = async () => {
    setLoadingAction(true);
    try {
      await onComplete(currentToken.id, notes);
      setCompleteModalOpen(false);
      setNotes('');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConfirmSkip = async () => {
    setLoadingAction(true);
    try {
      await onSkip(currentToken.id);
      setSkipModalOpen(false);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="card" style={{
      background: 'rgba(15, 23, 42, 0.9)',
      border: isCalled ? '2px solid var(--accent-cyan)' : '2px solid var(--color-success)',
      boxShadow: isCalled ? 'var(--shadow-brutal-cyan)' : '4px 4px 0px rgba(16, 185, 129, 0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Counter Ticket
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem' }}>
            <h2 style={{ fontSize: '1.65rem', color: 'var(--text-primary)' }}>
              {isCalled ? 'Student Called' : 'Service In Progress'}
            </h2>
            <Badge status={currentToken.status} />
          </div>
        </div>

        <div style={{
          textAlign: 'right',
          background: 'rgba(11, 18, 33, 0.9)',
          border: '2px solid var(--border-glass-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1.35rem',
          boxShadow: 'var(--shadow-brutal-sm)'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Token Number</span>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--accent-cyan)', lineHeight: 1 }}>
            {currentToken.display_number || `#${currentToken.token_number}`}
          </div>
        </div>
      </div>

      {/* Visitor Info Card */}
      <div style={{
        background: 'rgba(11, 18, 33, 0.85)',
        border: '1.5px solid var(--border-glass)',
        borderRadius: 'var(--radius-md)',
        padding: '1.15rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <User size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentToken.user_name || 'Student Visitor'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Session Ref: {currentToken.id}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Called at: <strong style={{ color: 'var(--text-primary)' }}>{new Date(currentToken.called_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'flex-end' }}>
        {isCalled && (
          <>
            <Button
              variant="outline-danger"
              icon={SkipForward}
              onClick={() => setSkipModalOpen(true)}
            >
              Mark No-Show / Skip
            </Button>
            <Button
              variant="cyan"
              icon={Play}
              onClick={() => onStart(currentToken.id)}
            >
              Start Service
            </Button>
          </>
        )}

        {isServing && (
          <Button
            variant="success"
            size="lg"
            icon={CheckCircle}
            onClick={() => setCompleteModalOpen(true)}
          >
            Complete Service
          </Button>
        )}
      </div>

      {/* Complete Confirmation Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Customer Service"
      >
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Confirm service completion for Token <strong>{currentToken.display_number || currentToken.token_number}</strong>?
        </p>
        <div className="form-group">
          <label className="form-label">Service Notes / Audit Record (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Document clearance approved, Fee receipt issued..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="secondary" onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
          <Button variant="success" loading={loadingAction} onClick={handleConfirmComplete}>Confirm Complete</Button>
        </div>
      </Modal>

      {/* Skip Confirmation Modal */}
      <Modal
        isOpen={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        title="Mark Token as Skipped / No-Show?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <AlertCircle size={44} color="var(--color-danger)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Did student with Token <strong>{currentToken.display_number || currentToken.token_number}</strong> fail to report to counter?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This action marks the ticket as <em>Skipped</em> and permanently logs the no-show in historical records.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setSkipModalOpen(false)}>Back</Button>
          <Button variant="danger" loading={loadingAction} onClick={handleConfirmSkip}>Yes, Mark Skipped</Button>
        </div>
      </Modal>
    </div>
  );
}
