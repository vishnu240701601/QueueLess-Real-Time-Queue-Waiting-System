import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import ActiveTokenBanner from '../components/student/ActiveTokenBanner';
import ServiceCard from '../components/student/ServiceCard';
import Badge from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { Layers, Clock, CheckCircle2, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { services, activeToken, history, loading, joinQueue, cancelToken } = useQueue();
  const { user } = useAuth();
  const [joiningId, setJoiningId] = useState(null);

  const handleJoin = async (serviceId) => {
    setJoiningId(serviceId);
    try {
      await joinQueue(serviceId);
    } catch (err) {
      alert(err.message);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Student Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Student Dashboard
        </span>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--navy-950)', marginTop: '0.2rem' }}>
          Welcome, {user?.full_name || 'Student'}
        </h1>
        <p style={{ color: 'var(--navy-600)', fontSize: '0.95rem' }}>
          Manage your live queue tokens, monitor your wait time, and join college service counters.
        </p>
      </div>

      {/* Active Token Section */}
      {loading ? (
        <CardSkeleton />
      ) : activeToken ? (
        <ActiveTokenBanner token={activeToken} onCancel={cancelToken} />
      ) : (
        <div className="card" style={{
          marginBottom: '2.5rem',
          background: '#ffffff',
          border: '1px solid var(--navy-200)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.5rem 2rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              No Active Ticket
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)', margin: 0 }}>
              You are not currently waiting in any service line. Choose a counter below to take a digital token.
            </p>
          </div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--primary-700)',
            background: 'var(--primary-50)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)'
          }}>
            Ready to Queue
          </span>
        </div>
      )}

      {/* Available Services Grid */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-950)' }}>Available Service Counters</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)' }}>Tap "Get Token" to reserve your spot</p>
          </div>
        </div>

        {loading ? (
          <div className="grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onJoin={handleJoin}
                hasActiveToken={activeToken && activeToken.service_id === service.id}
                isJoining={joiningId === service.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent History Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-950)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--primary-700)" />
            <span>Recent Queue History</span>
          </h3>
          <Link to="/history" style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View Full Audit Log <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Service Counter</th>
                <th>Date & Time</th>
                <th>Wait Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 3).map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--primary-800)' }}>
                      {item.display_number || `#${item.token_number}`}
                    </strong>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.service_name}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>{item.date}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
                    {item.wait_time_mins ? `${item.wait_time_mins} mins` : '—'}
                  </td>
                  <td>
                    <Badge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
