import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { queueService } from '../api/queueService';
import ServingCard from '../components/staff/ServingCard';
import WaitingQueueTable from '../components/staff/WaitingQueueTable';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { BellRing, Users, CheckCircle, Clock, Volume2, Shield } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { services, refreshQueue } = useQueue();
  const [selectedServiceId, setSelectedServiceId] = useState('srv-001');
  const [staffQueue, setStaffQueue] = useState([]);
  const [callingNext, setCallingNext] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];

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
  const waitingCount = staffQueue.filter(t => t.status === 'waiting').length;

  const handleCallNext = async () => {
    setErrorMsg(null);
    setCallingNext(true);
    try {
      await queueService.callNextToken(selectedServiceId);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      setErrorMsg(err.message);
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
      alert(err.message);
    }
  };

  const handleCompleteService = async (tokenId, notes) => {
    try {
      await queueService.completeService(tokenId, notes);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSkipToken = async (tokenId) => {
    try {
      await queueService.skipToken(tokenId);
      await fetchStaffQueue();
      await refreshQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Top Bar with Counter Selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Service Staff Console
            </span>
            <Badge status="active" label="Counter Active" />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy-950)' }}>
            {activeService?.name || 'Counter Workspace'}
          </h1>
        </div>

        {/* Counter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-700)' }}>
            Switch Counter:
          </label>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '240px' }}
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.waiting_count || 0} waiting)
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--warning-50)',
          color: 'var(--warning-700)',
          border: '1px solid var(--warning-100)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          {errorMsg}
        </div>
      )}

      {/* Main Operator Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.3fr)',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Call Next Action & Serving Card */}
        <div>
          {/* Prominent Call Next CTA Card */}
          <div className="card" style={{
            background: '#ffffff',
            border: '2px solid var(--primary-700)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            padding: '2rem 1.5rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
              Advance Service Line
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)', marginBottom: '1.5rem' }}>
              {waitingCount > 0
                ? `${waitingCount} student${waitingCount === 1 ? '' : 's'} waiting in line.`
                : 'No one currently waiting in line.'}
            </p>

            <Button
              variant="primary"
              size="lg"
              icon={BellRing}
              style={{
                width: '100%',
                padding: '1.1rem',
                fontSize: '1.15rem',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.35)'
              }}
              loading={callingNext}
              disabled={waitingCount === 0 || currentToken?.status === 'serving'}
              onClick={handleCallNext}
            >
              Call Next Token
            </Button>

            {currentToken?.status === 'serving' && (
              <div style={{ fontSize: '0.8rem', color: 'var(--warning-700)', marginTop: '0.75rem', fontWeight: 600 }}>
                Complete the current active service before calling the next token.
              </div>
            )}
          </div>

          {/* Active Serving Card */}
          <ServingCard
            currentToken={currentToken}
            onStart={handleStartService}
            onComplete={handleCompleteService}
            onSkip={handleSkipToken}
          />
        </div>

        {/* Right Column: Ordered FIFO Queue List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--navy-950)' }}>
                Waiting Queue (FIFO Order)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
                Processed sequentially from top to bottom
              </p>
            </div>
            <span style={{
              background: 'var(--primary-50)',
              color: 'var(--primary-800)',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)'
            }}>
              {waitingCount} in line
            </span>
          </div>

          <WaitingQueueTable
            queue={staffQueue}
            onSkip={handleSkipToken}
          />
        </div>
      </div>
    </div>
  );
}
