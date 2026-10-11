import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <div style={{ color: 'var(--navy-400)', marginBottom: '1rem' }}>
        <HelpCircle size={64} style={{ margin: '0 auto' }} strokeWidth={1.5} />
      </div>
      <h1 style={{ fontSize: '3rem', color: 'var(--navy-950)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-800)', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--navy-600)', maxWidth: '420px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
        The page or queue counter you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Return to QueueLess Home
        </Button>
      </Link>
    </div>
  );
}
