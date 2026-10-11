import React from 'react';

export default function Badge({ status, label, children }) {
  const norm = (status || '').toLowerCase();
  
  let badgeClass = 'badge-waiting';
  if (norm === 'called') badgeClass = 'badge-called';
  else if (norm === 'serving') badgeClass = 'badge-serving';
  else if (norm === 'completed') badgeClass = 'badge-completed';
  else if (norm === 'cancelled' || norm === 'skipped') badgeClass = 'badge-cancelled';
  else if (norm === 'active') badgeClass = 'badge-active';
  else if (norm === 'closed' || norm === 'paused') badgeClass = 'badge-closed';

  return (
    <span className={`badge ${badgeClass}`}>
      {['waiting', 'called', 'serving'].includes(norm) && <span className="pulse-dot" />}
      {label || children || status}
    </span>
  );
}
