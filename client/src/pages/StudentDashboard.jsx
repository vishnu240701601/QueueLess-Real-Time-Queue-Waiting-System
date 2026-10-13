import React from 'react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import ActiveTokenBanner from '../components/student/ActiveTokenBanner';
import Badge from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { services, activeToken, history, loading, cancelToken } = useQueue();
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1>Welcome, {user?.full_name || 'Student'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ID: <strong>{user?.student_id || '—'}</strong> &nbsp;|&nbsp; Manage your digital queue tokens across campus services.
        </p>
      </div>

      {/* Active Token */}
      <div className="page-section">
        <h2 className="section-title">Active Token</h2>
        {loading ? (
          <CardSkeleton />
        ) : activeToken ? (
          <ActiveTokenBanner token={activeToken} onCancel={cancelToken} />
        ) : (
          <div className="info-box">
            <p style={{ color: 'var(--text-muted)' }}>
              You are not currently in any queue. Select a service below to get a digital token.
            </p>
          </div>
        )}
      </div>

      {/* Campus Services */}
      <div className="page-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Campus Service Counters</h2>
          <Link to="/student/services" style={{ fontSize: '0.875rem' }}>View all services &rarr;</Link>
        </div>

        {loading ? (
          <div className="grid-cols-3">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Department</th>
                  <th>Waiting</th>
                  <th>Est. Wait</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  const isServingMe = activeToken && (activeToken.service_id === service.id || activeToken.service_id === service.slug);
                  const estWait = (service.waiting_count || 0) * (service.avg_service_time_mins || 4);
                  return (
                    <tr key={service.id}>
                      <td>
                        <strong>{service.name}</strong>
                        {isServingMe && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
                            (Your active token)
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{service.department}</td>
                      <td>{service.waiting_count || 0}</td>
                      <td>~{estWait} min</td>
                      <td>
                        <Badge status={service.is_active ? 'active' : 'closed'} label={service.is_active ? 'Open' : 'Paused'} />
                      </td>
                      <td>
                        <Link
                          to={`/student/services/${service.slug || service.id}`}
                          className={`btn btn-sm ${isServingMe ? 'btn-success' : 'btn-primary'}`}
                        >
                          {isServingMe ? 'View Token' : 'Enter Queue'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent History */}
      <div className="page-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Token Activity</h2>
          <Link to="/student/history" style={{ fontSize: '0.875rem' }}>Full history &rarr;</Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Service</th>
                <th>Date</th>
                <th>Wait</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.display_number || `#${item.token_number}`}</strong></td>
                  <td>{item.service_name}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {item.wait_time_mins ? `${item.wait_time_mins} min` : '—'}
                  </td>
                  <td><Badge status={item.status} /></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    No token history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
