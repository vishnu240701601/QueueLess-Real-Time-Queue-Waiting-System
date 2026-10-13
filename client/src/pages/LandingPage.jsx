import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

export default function LandingPage() {
  const { services } = useQueue();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleServiceClick = (serviceId) => {
    if (user && role === 'student') {
      navigate(`/student/services/${serviceId}`);
    } else {
      navigate('/auth/choose-role');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

      {/* Hero */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>
          Manage Queues Without Waiting in Line
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '1.25rem' }}>
          QueueLess lets you get a digital token for campus services — canteen, library, exam office, and more.
          Track your queue position in real time and show up only when your number is called.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/auth/choose-role" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <a href="#services-preview" className="btn btn-secondary btn-lg">
            View Services
          </a>
        </div>
      </div>

      {/* Simple info strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
        <div>
          <strong>How it works:</strong>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          1. Register or sign in &nbsp;&rarr;&nbsp;
          2. Choose a service counter &nbsp;&rarr;&nbsp;
          3. Get a digital token &nbsp;&rarr;&nbsp;
          4. Wait anywhere — come back when called
        </div>
      </div>

      {/* Services List */}
      <div id="services-preview">
        <h2 style={{ marginBottom: '0.75rem' }}>Available Services</h2>

        {services.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading services...</p>
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
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{service.department}</td>
                      <td>{service.waiting_count || 0}</td>
                      <td>~{estWait} min</td>
                      <td>
                        <Badge
                          status={service.is_active ? 'active' : 'closed'}
                          label={service.is_active ? 'Open' : 'Paused'}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleServiceClick(service.id)}
                          disabled={!service.is_active}
                        >
                          {service.is_active ? 'Get Token' : 'Paused'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!user && (
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <Link to="/auth/choose-role">Sign in</Link> to get a digital token for any service.
          </p>
        )}
      </div>
    </div>
  );
}
