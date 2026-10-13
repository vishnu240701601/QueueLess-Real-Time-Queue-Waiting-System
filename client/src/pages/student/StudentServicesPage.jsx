import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import Badge from '../../components/common/Badge';

export default function StudentServicesPage() {
  const { services, activeToken } = useQueue();

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        <Link to="/student/dashboard">&larr; Back to Dashboard</Link>
      </p>

      <div className="page-header">
        <h1>Campus Service Counters</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Select a service to view live queue status and get a digital token.
        </p>
      </div>

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
                    {service.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {service.description}
                      </div>
                    )}
                    {isServingMe && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, display: 'block' }}>
                        &#10003; You have an active token here
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
            {services.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading services...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
