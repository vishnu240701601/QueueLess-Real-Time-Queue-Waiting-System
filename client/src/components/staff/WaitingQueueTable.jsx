import React from 'react';
import Badge from '../common/Badge';

export default function WaitingQueueTable({ queue = [] }) {
  const waitingTokens = queue.filter(t => t.status === 'waiting');

  if (waitingTokens.length === 0) {
    return (
      <div className="info-box" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Queue is currently empty. Students will appear here when they get a token.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Position</th>
            <th>Token</th>
            <th>Name</th>
            <th>Waiting Since</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {waitingTokens.map((token, index) => {
            const waitTimeMin = Math.round((Date.now() - new Date(token.created_at).getTime()) / 60000);
            return (
              <tr key={token.id}>
                <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{index + 1}</td>
                <td>
                  <strong style={{ color: 'var(--primary)' }}>
                    {token.display_number || `#${token.token_number}`}
                  </strong>
                </td>
                <td>{token.user_name || 'Student Visitor'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {waitTimeMin > 0 ? `${waitTimeMin} min ago` : 'Just now'}
                </td>
                <td><Badge status={token.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
