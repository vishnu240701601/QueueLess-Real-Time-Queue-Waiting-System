import React from 'react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { Users, Clock } from 'lucide-react';

export default function WaitingQueueTable({ queue = [] }) {
  const waitingTokens = queue.filter(t => t.status === 'waiting');

  if (waitingTokens.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Queue is currently empty"
        description="No students are waiting in line for this counter right now. When students generate a token, their entries will appear here in chronological FIFO order."
      />
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>FIFO Pos.</th>
            <th>Token</th>
            <th>Visitor Name</th>
            <th>Waiting Since</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {waitingTokens.map((token, index) => {
            const waitTimeMin = Math.round((Date.now() - new Date(token.created_at).getTime()) / 60000);
            return (
              <tr key={token.id}>
                <td style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  #{index + 1}
                </td>
                <td>
                  <strong style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    color: 'var(--accent-cyan)',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    {token.display_number || `#${token.token_number}`}
                  </strong>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {token.user_name || 'Student Visitor'}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} />
                    {waitTimeMin > 0 ? `${waitTimeMin} mins ago` : 'Just now'}
                  </span>
                </td>
                <td>
                  <Badge status={token.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
