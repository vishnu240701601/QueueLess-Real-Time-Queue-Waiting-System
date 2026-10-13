import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
      if (authenticatedUser.role !== 'admin') {
        setError(`Access denied: this account is registered as '${authenticatedUser.role}' and lacks administrator privileges.`);
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
    <div className="container" style={{ maxWidth: '420px', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        <Link to="/auth/choose-role">&larr; Back to portal selection</Link>
      </p>

      <div className="card">
        <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Administrator Sign In</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Restricted access — pre-provisioned credentials required.
        </p>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Public administrator registration is not available. Contact IT for account provisioning.
        </p>
      </div>
    </div>
  );
}
