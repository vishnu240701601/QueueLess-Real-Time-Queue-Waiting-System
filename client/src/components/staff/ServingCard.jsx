import React, { useState } from 'react';
import { Play, CheckCircle, SkipForward, AlertCircle, Clock, User } from 'lucide-react';
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
        background: '#ffffff',
        border: '2px dashed var(--navy-300)',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ color: 'var(--navy-400)', marginBottom: '0.75rem' }}>
          <Clock size={40} style={{ margin: '0 auto' }} />
        </div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', marginBottom: '0.35rem' }}>
          No Token In Progress
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--navy-500)', maxWidth: '340px', margin: '0 auto' }}>
          Ready for the next customer? Click the <strong>Call Next Token</strong> button below to advance the queue.
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
      background: 'linear-gradient(135deg, #ffffff, var(--primary-50))',
      border: '2px solid var(--primary-600)',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: 'var(--radius-xl)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Counter Action
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-950)' }}>
              {isCalled ? 'Customer Called' : 'Service In Progress'}
            </h2>
            <Badge status={currentToken.status} />
          </div>
        </div>

        <div style={{
          textAlign: 'right',
          background: '#ffffff',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.5rem 1.25rem'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>Now Serving</span>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary-800)', lineHeight: 1 }}>
            {currentToken.display_number || `#${currentToken.token_number}`}
          </div>
        </div>
      </div>

      {/* Visitor Info Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--navy-200)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--navy-100)', padding: '0.6rem', borderRadius: 'var(--radius-full)' }}>
            <User size={20} color="var(--navy-700)" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {currentToken.user_name || 'Student / Visitor'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)' }}>
              Token ID: {currentToken.id}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--navy-600)' }}>
          Called at: {new Date(currentToken.called_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {isCalled && (
          <>
            <Button
              variant="outline-danger"
              icon={SkipForward}
              onClick={() => setSkipModalOpen(true)}
            >
              Skip No-Show
            </Button>
            <Button
              variant="success"
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
        <p style={{ fontSize: '0.925rem', color: 'var(--navy-800)', marginBottom: '1rem' }}>
          Confirm service completion for Token <strong>{currentToken.display_number}</strong>?
        </p>
        <div className="form-group">
          <label className="form-label">Service Notes (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Issued meal voucher, Fee cleared..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button variant="secondary" onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
          <Button variant="success" loading={loadingAction} onClick={handleConfirmComplete}>Confirm Complete</Button>
        </div>
      </Modal>

      {/* Skip Confirmation Modal */}
      <Modal
        isOpen={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        title="Skip Unattended Token?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <AlertCircle size={44} color="var(--warning-600)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.95rem', color: 'var(--navy-800)', marginBottom: '0.5rem' }}>
            Did customer with Token <strong>{currentToken.display_number}</strong> fail to arrive at the counter?
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
            This will mark the ticket as <em>Skipped</em> and record the absence in the audit log.
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
