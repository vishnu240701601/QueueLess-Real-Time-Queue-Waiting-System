import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <div style={{ color: 'var(--accent-purple)', marginBottom: '1.25rem' }}>
        <HelpCircle size={64} style={{ margin: '0 auto' }} strokeWidth={1.5} />
      </div>
      <h1 style={{ fontSize: '3.5rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 2.25rem', fontSize: '1rem', lineHeight: 1.6 }}>
        The route or queue counter you are looking for does not exist or may have been repositioned.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Return to QueueLess Home
        </Button>
      </Link>
    </div>
  );
}
