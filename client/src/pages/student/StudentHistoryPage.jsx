import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import Badge from '../../components/common/Badge';

export default function StudentHistoryPage() {
  const { history } = useQueue();

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        <Link to="/student/dashboard">&larr; Back to Dashboard</Link>
      </p>

      <div className="page-header">
        <h1>My Token History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          A record of your completed, cancelled, and past queue tokens.
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Service Counter</th>
              <th>Date &amp; Time</th>
              <th>Wait</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history && history.length > 0 ? (
              history.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.display_number || `#${item.token_number}`}</strong></td>
                  <td>{item.service_name}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {item.wait_time_mins ? `${item.wait_time_mins} min` : '—'}
                  </td>
                  <td><Badge status={item.status} /></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.reason || '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No token history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
