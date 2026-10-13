import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import Badge from '../../components/common/Badge';

export default function AdminHistoryPage() {
  const { history } = useQueue();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = !searchQuery ||
      (item.display_number && item.display_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.service_name && item.service_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>
        <Link to="/admin/dashboard">&larr; Back to Dashboard</Link>
        <Link to="/admin/analytics">View Analytics &rarr;</Link>
      </div>

      <div className="page-header">
        <h1>Audit History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Complete record of all completed, cancelled, and skipped tokens across service counters.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-input"
          style={{ maxWidth: '280px' }}
          placeholder="Search token or service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="history-status-filter" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Status:</label>
          <select
            id="history-status-filter"
            className="form-select"
            style={{ minWidth: '150px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="skipped">Skipped / No-show</option>
          </select>
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Audit Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Service</th>
              <th>Date &amp; Time</th>
              <th>Wait</th>
              <th>Service Time</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.display_number || `#${item.token_number}`}</strong></td>
                  <td>{item.service_name}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {item.wait_time_mins ? `${item.wait_time_mins} min` : '—'}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {item.service_time_mins ? `${item.service_time_mins} min` : '—'}
                  </td>
                  <td><Badge status={item.status} /></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.reason || '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No records match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
