import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { History, ArrowLeft, Clock } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function StudentHistoryPage() {
  const { history } = useQueue();

  return (
    <div className="container" style={{ maxWidth: '960px', paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Student Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Personal Activity Log
        </span>
        <h1 style={{ fontSize: '2.25rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
          My Token History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          A historical log of your completed, cancelled, and past queue tokens.
        </p>
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
              <th>Details / Reason</th>
            </tr>
          </thead>
          <tbody>
            {history && history.length > 0 ? (
              history.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', fontSize: '1rem' }}>
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
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: item.reason ? 'italic' : 'normal' }}>
                    {item.reason || 'Completed at counter'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No previous token history records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
