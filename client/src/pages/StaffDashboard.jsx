import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { queueService } from '../api/queueService';
import ServingCard from '../components/staff/ServingCard';
import WaitingQueueTable from '../components/staff/WaitingQueueTable';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { BellRing } from 'lucide-react';

export default function StaffDashboard() {
  const { user, role } = useAuth();
  const { services, refreshQueue } = useQueue();

  const assignedServices = services.filter(s => {
    if (role === 'admin') return true;
    if (user?.assignedServiceId) return s.id === user.assignedServiceId || s.slug === user.assignedServiceId;
    return s.slug === 'canteen' || s.id === 'srv-canteen';
  });

  const [selectedServiceId, setSelectedServiceId] = useState(assignedServices[0]?.id || '');
  const [staffQueue, setStaffQueue] = useState([]);
  const [callingNext, setCallingNext] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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
    const unsub = queueService.subscribe(() => fetchStaffQueue());
    return () => unsub();
  }, [selectedServiceId]);

  const currentToken = staffQueue.find(t => ['called', 'serving'].includes(t.status)) || null;
  const isSomeoneServing = currentToken && currentToken.status === 'serving';
  const waitingCount = staffQueue.filter(t => t.status === 'waiting').length;

  const handleCallNext = async () => {
    setErrorMsg(null);
    if (isSomeoneServing) {
      setErrorMsg('Cannot call next token: please complete or skip the current customer first.');
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
      <div className="container" style={{ maxWidth: '560px', paddingTop: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '0.5rem' }}>No Counter Assignment</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your staff account is not currently assigned to any active service counter. Contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1>{activeService?.name || 'Queue Console'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Staff: <strong>{user?.full_name || 'Staff Member'}</strong> &nbsp;|&nbsp; {activeService?.department}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {assignedServices.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="assigned-counter-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Counter:</label>
                <select
                  id="assigned-counter-select"
                  className="form-select"
                  style={{ minWidth: '200px' }}
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
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error">{errorMsg}</div>
      )}

      {/* Main layout: Serving card + Call Next */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(240px, 1fr)', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'start' }}>
        <ServingCard
          currentToken={currentToken}
          onStart={handleStartService}
          onComplete={handleCompleteService}
          onSkip={handleSkipToken}
        />

        {/* Call Next Panel */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
            Waiting in Queue
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {waitingCount}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            students waiting in line
          </p>

          <Button
            variant="primary"
            size="lg"
            icon={BellRing}
            onClick={handleCallNext}
            loading={callingNext}
            disabled={waitingCount === 0 || isSomeoneServing}
            style={{ width: '100%' }}
          >
            Call Next Token
          </Button>

          {isSomeoneServing && (
            <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.65rem' }}>
              Complete the current customer before calling next.
            </p>
          )}

          {/* Counter info */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'left' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-muted)', paddingBottom: '0.35rem' }}>Avg. service time:</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{activeService?.avg_service_time_mins || 4} min</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', paddingBottom: '0.35rem' }}>Token prefix:</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{activeService?.token_prefix || 'TKN'}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)' }}>Total dispatched:</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{activeService?.current_token || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Waiting Queue */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Waiting Queue</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{waitingCount} in line</span>
        </div>
        <WaitingQueueTable queue={staffQueue} />
      </div>
    </div>
  );
}
