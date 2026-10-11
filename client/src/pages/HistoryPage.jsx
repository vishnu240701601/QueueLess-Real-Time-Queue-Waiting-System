import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { History, Filter, Clock, CheckCircle } from 'lucide-react';

export default function HistoryPage() {
  const { history } = useQueue();
  const [filter, setFilter] = useState('all');

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Audit & Logs
          </span>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--navy-950)', marginTop: '0.2rem' }}>
            Token & Service History
          </h1>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#ffffff', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--navy-200)' }}>
          {['all', 'completed', 'cancelled', 'skipped'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: filter === f ? 'var(--primary-700)' : 'transparent',
                color: filter === f ? '#ffffff' : 'var(--navy-700)',
                fontWeight: filter === f ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={History}
          title="No History Found"
          description={`There are currently no ${filter === 'all' ? '' : filter} service tokens recorded in your history.`}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Service Counter</th>
                <th>Date / Time</th>
                <th>Wait Time</th>
                <th>Service Time</th>
                <th>Status</th>
                <th>Notes / Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--primary-800)',
                      fontSize: '1.05rem',
                      background: 'var(--primary-50)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {item.display_number || `#${item.token_number}`}
                    </strong>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                    {item.service_name}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
                    {item.date}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
                    {item.wait_time_mins ? `${item.wait_time_mins} mins` : '—'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
                    {item.service_time_mins ? `${item.service_time_mins} mins` : '—'}
                  </td>
                  <td>
                    <Badge status={item.status} />
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--navy-500)', maxWidth: '240px' }}>
                    {item.reason || item.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
