import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active items to display at this time.',
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
