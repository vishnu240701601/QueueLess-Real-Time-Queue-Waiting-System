import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import Button from '../../components/common/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authenticatedUser = await login(email, password);
      // Strictly verify actual database role
      if (authenticatedUser.role !== 'admin') {
        setError(`Access Denied: This account is registered as '${authenticatedUser.role}' and lacks Administrator privileges.`);
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Link to="/auth/choose-role" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Portal Selection
      </Link>

      <div className="card" style={{ border: '2px solid var(--border-glass-strong)', background: 'rgba(15, 23, 42, 0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(124, 58, 237, 0.2)',
            border: '2px solid var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} color="var(--accent-purple)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem' }}>Administrator Sign In</h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Campus queue governance & management</p>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-danger-bg)',
            border: '1.5px solid var(--color-danger-border)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 600
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#c084fc',
          fontSize: '0.8rem',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <Lock size={16} style={{ flexShrink: 0 }} />
          <span>Restricted Portal: Pre-provisioned administrator credentials required.</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Administrator Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin.queueless@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Secure Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            loading={loading}
          >
            Authenticate Administrator
            <ArrowRight size={16} />
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Public administrator registration is prohibited. Contact institutional IT for account provisioning.
        </div>
      </div>
    </div>
  );
}
