import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentLoginPage() {
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
      if (authenticatedUser.role !== 'student') {
        setError(`Access denied: this account is registered as '${authenticatedUser.role}'. Please use the ${authenticatedUser.role} portal.`);
        return;
      }
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
        <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Student Sign In</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Access your active tokens and queue status.
        </p>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="student-email">Email</label>
            <input
              id="student-email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student-password">Password</label>
            <input
              id="student-password"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
          New student? <Link to="/auth/student/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
