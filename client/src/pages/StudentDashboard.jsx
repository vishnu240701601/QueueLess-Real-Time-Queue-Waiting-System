import React from 'react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import ActiveTokenBanner from '../components/student/ActiveTokenBanner';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { Layers, Clock, Users, History, ArrowRight, ArrowUpRight, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { services, activeToken, history, loading, cancelToken } = useQueue();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
      {/* Student Welcome Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.25rem',
        paddingBottom: '1.5rem',
        borderBottom: '1.5px solid var(--border-glass)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Portal
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
            Welcome, {user?.full_name || 'Student'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px' }}>
            ID: <strong style={{ color: 'var(--accent-cyan)' }}>{user?.student_id || 'CS-2024-042'}</strong> • Manage your digital queue tokens and track live waiting times across campus counters.
          </p>
        </div>

        <Link to="/student/services">
          <Button variant="cyan">
            Explore All Counters
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Active Token Section */}
      {loading ? (
        <CardSkeleton />
      ) : activeToken ? (
        <ActiveTokenBanner token={activeToken} onCancel={cancelToken} />
      ) : (
        <div className="card" style={{
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          border: '2px solid var(--border-glass-strong)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Active Ticket
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              You are not currently in any queue line. Select a service counter below to get your digital token.
            </p>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--accent-cyan)',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            Ready to Queue
          </span>
        </div>
      )}

      {/* Available Service Counters Grid */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>Campus Service Counters</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Select any counter to view detailed queue status and take a token
            </p>
          </div>
          <Link to="/student/services" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full Directory <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid-cols-3">
            {services.map((service) => {
              const isServingMe = activeToken && (activeToken.service_id === service.id || activeToken.service_id === service.slug);
              const estWait = (service.waiting_count || 0) * (service.avg_service_time_mins || 4);

              return (
                <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      color: 'var(--accent-purple)',
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      textTransform: 'uppercase'
                    }}>
                      {service.department || 'Campus Service'}
                    </span>
                    <Badge
                      status={service.is_active ? 'active' : 'closed'}
                      label={service.is_active ? 'Open' : 'Paused'}
                    />
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {service.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1, lineHeight: 1.55 }}>
                    {service.description}
                  </p>

                  {/* Queue Stats Pill */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.65rem',
                    padding: '0.75rem',
                    background: 'rgba(11, 18, 33, 0.8)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--accent-cyan)" />
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Waiting</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {service.waiting_count || 0} students
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--accent-purple)" />
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Est. Wait</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ~{estWait} mins
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link to={`/student/services/${service.slug || service.id}`}>
                    <Button
                      variant={isServingMe ? 'success' : 'primary'}
                      style={{ width: '100%' }}
                    >
                      {isServingMe ? 'View My Active Token' : 'Enter Queue Counter'}
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Personal History Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--accent-cyan)" />
            <span>My Recent Token Activity</span>
          </h3>
          <Link to="/student/history" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            View Full Personal History &rarr;
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
                    <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                      {item.display_number || `#${item.token_number}`}
                    </strong>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.service_name}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
