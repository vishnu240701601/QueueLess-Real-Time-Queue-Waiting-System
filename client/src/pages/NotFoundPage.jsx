import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        <HelpCircle size={48} style={{ margin: '0 auto' }} strokeWidth={1.5} />
      </div>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
        The page or queue counter you are looking for does not exist.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
