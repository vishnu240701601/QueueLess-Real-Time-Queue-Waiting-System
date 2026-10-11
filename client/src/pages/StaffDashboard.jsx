import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { queueService } from '../api/queueService';
import ServingCard from '../components/staff/ServingCard';
import WaitingQueueTable from '../components/staff/WaitingQueueTable';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { BellRing, Users, CheckCircle, Clock, ShieldAlert, AlertTriangle, PauseCircle, PlayCircle } from 'lucide-react';

export default function StaffDashboard() {
  const { user, role } = useAuth();
  const { services, refreshQueue } = useQueue();

  // Filter counters: staff only see their assigned counters; admin can see all
  const assignedServices = services.filter(s => {
    if (role === 'admin') return true;
    if (user?.assignedServiceId) return s.id === user.assignedServiceId || s.slug === user.assignedServiceId;
    // Default fallback to first service if assigned to Canteen
    return s.slug === 'canteen' || s.id === 'srv-canteen';
  });

  const [selectedServiceId, setSelectedServiceId] = useState(assignedServices[0]?.id || '');
  const [staffQueue, setStaffQueue] = useState([]);
  const [callingNext, setCallingNext] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  useEffect(() => {
    if (assignedServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(assignedServices[0].id);
    }
  }, [assignedServices, selectedServiceId]);

  const activeService = services.find(s => s.id === selectedServiceId) || assignedServices[0];

  const fetchStaffQueue = async () => {
    if (!selectedServiceId) return;
    try {
      const q = await queueService.getStaffQueue(selectedServiceId);
      setStaffQueue(q);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaffQueue();
    const unsub = queueService.subscribe(() => {
      fetchStaffQueue();
    });
    return () => unsub();
  }, [selectedServiceId]);

  const currentToken = staffQueue.find(t => ['called', 'serving'].includes(t.status)) || null;
  const isSomeoneServing = currentToken && currentToken.status === 'serving';
  const waitingCount = staffQueue.filter(t => t.status === 'waiting').length;

  const handleCallNext = async () => {
    setErrorMsg(null);
    if (isSomeoneServing) {
      setErrorMsg('Cannot call next token: Please complete or skip the current active customer first.');
      return;
    }

    setCallingNext(true);
    try {
      await queueService.callNextToken(selectedServiceId);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      setErrorMsg(err.message || 'No waiting tokens in the queue.');
    } finally {
      setCallingNext(false);
    }
  };

  const handleStartService = async (tokenId) => {
    try {
      await queueService.startService(tokenId);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCompleteService = async (tokenId, notes) => {
    try {
      await queueService.completeService(tokenId, notes);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSkipToken = async (tokenId) => {
    try {
      await queueService.skipToken(tokenId);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  if (assignedServices.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', border: '2px solid var(--border-glass-strong)' }}>
          <ShieldAlert size={48} color="var(--color-warning)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Counter Assignment Found</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your staff account is not currently assigned to any active campus counter. Please contact an administrator to assign you to a counter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
      {/* Top Header & Counter Selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1.5px solid var(--border-glass)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Staff Operations Console
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
            {activeService?.name || 'Counter Console'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Staff Operator: <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name || 'Staff Member'}</strong> • {activeService?.department}
          </p>
        </div>

        {/* Counter Selection Dropdown (Only for assigned counters) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {assignedServices.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="assigned-counter-select" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 700 }}>Counter:</label>
              <select
                id="assigned-counter-select"
                aria-label="Select Assigned Service Counter"
                className="form-select"
                style={{ minWidth: '220px', padding: '0.55rem 0.85rem' }}
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
              >
                {assignedServices.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <Badge
            status={activeService?.is_active ? 'active' : 'closed'}
            label={activeService?.is_active ? 'Counter Active' : 'Counter Paused'}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
          />
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-danger-bg)',
          border: '1.5px solid var(--color-danger-border)',
          color: '#f87171',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Serving Card & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.75rem', marginBottom: '2.5rem' }}>
        {/* Left: Active Service Card */}
        <ServingCard
          currentToken={currentToken}
          onStart={handleStartService}
          onComplete={handleCompleteService}
          onSkip={handleSkipToken}
        />

        {/* Right: Counter Actions & Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Call Next Button Card */}
          <div className="card" style={{ border: '2px solid var(--border-glass-strong)', textAlign: 'center', padding: '1.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              FIFO Queue Dispatch
            </span>
            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', margin: '0.25rem 0 0.5rem' }}>
              {waitingCount}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Students waiting in sequential line
            </p>

            <Button
              variant="primary"
              size="lg"
              icon={BellRing}
              onClick={handleCallNext}
              loading={callingNext}
              disabled={waitingCount === 0 || isSomeoneServing}
              style={{ width: '100%', padding: '0.95rem' }}
              title={isSomeoneServing ? 'Complete current customer before calling next' : ''}
            >
              Call Next Token
            </Button>

            {isSomeoneServing && (
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.65rem' }}>
                Finish serving current student to enable next call.
              </div>
            )}
          </div>

          {/* Service Velocity Info */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Counter Overview</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Target Service Time:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{activeService?.avg_service_time_mins || 4} mins / token</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Token Prefix:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{activeService?.token_prefix || 'TKN'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Total Dispatched Today:</span>
                <strong style={{ color: 'var(--color-success)' }}>{activeService?.current_token || 0} tokens</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Queue List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>Waiting Line (FIFO)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students will be called strictly in order of token creation</p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {waitingCount} in line
          </span>
        </div>

        <WaitingQueueTable queue={staffQueue} />
      </div>
    </div>
  );
}
