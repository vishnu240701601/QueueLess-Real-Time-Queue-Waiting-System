import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { ArrowLeft, Clock, Users, Bell, AlertCircle, QrCode, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';

export default function TokenLiveStatus() {
  const { activeToken, cancelToken } = useQueue();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  // If token changes to 'called', trigger visual/audio notification cue
  useEffect(() => {
    if (activeToken?.status === 'called' && !audioPlayed) {
      setAudioPlayed(true);
    }
  }, [activeToken?.status, audioPlayed]);

  if (!activeToken) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '520px' }}>
        <EmptyState
          icon={AlertCircle}
          title="No Active Ticket Found"
          description="You do not currently hold an active queue token. Join a counter queue from the student dashboard."
          actionLabel="Go to Services"
          onAction={() => navigate('/student')}
        />
      </div>
    );
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this token?')) {
      setCancelling(true);
      try {
        await cancelToken(activeToken.id);
        navigate('/student');
      } finally {
        setCancelling(false);
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '2rem 1rem 4rem' }}>
      <button
        onClick={() => navigate('/student')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'none',
          border: 'none',
          color: 'var(--navy-600)',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.25rem',
          fontSize: '0.9rem'
        }}
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* Digital Ticket Card */}
      <div className="card" style={{
        background: '#ffffff',
        border: activeToken.status === 'called' ? '2px solid var(--info-600)' : '2px solid var(--primary-600)',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 1.75rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {activeToken.status === 'called' && (
          <div style={{
            background: 'var(--info-50)',
            color: 'var(--info-700)',
            border: '1px solid var(--info-100)',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <Bell size={18} />
            <span>It's Your Turn! Please Proceed to Counter</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Badge status={activeToken.status} />
        </div>

        <h2 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', marginBottom: '0.2rem' }}>
          {activeToken.serviceName}
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--navy-500)', marginBottom: '1.5rem' }}>
          {activeToken.department}
        </p>

        {/* Jumbo Digital Pass Display */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-50), #ffffff)',
          border: '2px dashed var(--primary-300)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 1rem',
          marginBottom: '1.75rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Token Pass Number
          </span>
          <div style={{
            fontSize: '4rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: 'var(--primary-900)',
            lineHeight: 1,
            margin: '0.5rem 0'
          }}>
            {activeToken.display_number || `#${activeToken.token_number}`}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--navy-600)' }}>
            Ticket ID: {activeToken.id.slice(0, 12)}
          </div>
        </div>

        {/* Live Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--navy-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              People Ahead
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-950)', marginTop: '0.2rem' }}>
              {activeToken.totalAhead}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--navy-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Est. Waiting
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-950)', marginTop: '0.2rem' }}>
              ~{activeToken.estWaitMins}m
            </div>
          </div>
        </div>

        {/* Verification Placeholder */}
        <div style={{
          borderTop: '1px solid var(--navy-100)',
          paddingTop: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--navy-500)',
          fontSize: '0.825rem'
        }}>
          <QrCode size={20} />
          <span>Present this ticket on your device upon arrival</span>
        </div>

        <Button
          variant="outline-danger"
          style={{ width: '100%' }}
          loading={cancelling}
          onClick={handleCancel}
        >
          Cancel This Token
        </Button>
      </div>
    </div>
  );
}
