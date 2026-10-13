import React, { useState } from 'react';
import { Play, CheckCircle, SkipForward, AlertCircle, Clock } from 'lucide-react';
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
      <div className="info-box" style={{ textAlign: 'center', padding: '2rem' }}>
        <Clock size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
        <h3 style={{ marginBottom: '0.35rem' }}>Counter Idle</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No customer is currently called. Click <strong>Call Next Token</strong> to serve the next person in line.
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
    <div className="card" style={{ borderLeft: `4px solid ${isCalled ? 'var(--info)' : 'var(--success)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.3rem' }}>
            {isCalled ? 'Student Called' : 'Service In Progress'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
              {currentToken.display_number || `#${currentToken.token_number}`}
            </span>
            <Badge status={currentToken.status} />
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="surface-box" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{currentToken.user_name || 'Student Visitor'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session: {currentToken.id}</div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Called at: {new Date(currentToken.called_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'flex-end' }}>
        {isCalled && (
          <>
            <Button variant="outline-danger" icon={SkipForward} onClick={() => setSkipModalOpen(true)}>
              No-Show / Skip
            </Button>
            <Button variant="primary" icon={Play} onClick={() => onStart(currentToken.id)}>
              Start Service
            </Button>
          </>
        )}

        {isServing && (
          <Button variant="success" size="lg" icon={CheckCircle} onClick={() => setCompleteModalOpen(true)}>
            Complete Service
          </Button>
        )}
      </div>

      {/* Complete Modal */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Complete Service">
        <p style={{ marginBottom: '1rem' }}>
          Confirm completion for Token <strong>{currentToken.display_number || currentToken.token_number}</strong>?
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="service-notes">Notes (optional)</label>
          <input
            id="service-notes"
            type="text"
            className="form-input"
            placeholder="e.g. Document approved, fee receipt issued..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
          <Button variant="success" loading={loadingAction} onClick={handleConfirmComplete}>Confirm Complete</Button>
        </div>
      </Modal>

      {/* Skip Modal */}
      <Modal isOpen={skipModalOpen} onClose={() => setSkipModalOpen(false)} title="Mark as No-Show?">
        <p style={{ marginBottom: '1rem' }}>
          Did student with Token <strong>{currentToken.display_number || currentToken.token_number}</strong> fail to report to the counter?
          This will permanently mark the ticket as <em>Skipped</em>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setSkipModalOpen(false)}>Back</Button>
          <Button variant="danger" loading={loadingAction} onClick={handleConfirmSkip}>Yes, Mark Skipped</Button>
        </div>
      </Modal>
    </div>
  );
}
