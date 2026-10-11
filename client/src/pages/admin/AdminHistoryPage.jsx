import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { History, ArrowLeft, Filter, Search, Download } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

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
    <div className="container" style={{ maxWidth: '1080px', paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Administrator Console
        </Link>
        <Link to="/admin/analytics" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
          View Queue Analytics &rarr;
        </Link>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1.5px solid var(--border-glass)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Audited System Log
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
            Campus Queue Audit History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Immutable chronological record of completed, cancelled, and skipped tokens across all university service counters.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        background: 'rgba(15, 23, 42, 0.75)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--border-glass)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.5rem 0.75rem' }}
            placeholder="Search by token or service name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="history-status-filter" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status:</label>
          <select
            id="history-status-filter"
            aria-label="Filter Audit Log by Status"
            className="form-select"
            style={{ padding: '0.5rem 0.75rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All States</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="skipped">Skipped / No-show</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Service Counter</th>
              <th>Timestamp</th>
              <th>Wait Duration</th>
              <th>Service Duration</th>
              <th>Status</th>
              <th>Audit Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', fontSize: '1.05rem' }}>
                      {item.display_number || `#${item.token_number}`}
                    </strong>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.service_name}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.wait_time_mins ? `${item.wait_time_mins} mins` : '—'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.service_time_mins ? `${item.service_time_mins} mins` : '—'}
                  </td>
                  <td>
                    <Badge status={item.status} />
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {item.reason || 'Verified completion'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No historical records match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
