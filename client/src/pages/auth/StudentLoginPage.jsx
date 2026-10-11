import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ArrowLeft, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

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
      // Strictly verify actual database role
      if (authenticatedUser.role !== 'student') {
        setError(`Access Denied: This account is registered as '${authenticatedUser.role}'. Please use the ${authenticatedUser.role} portal.`);
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
            background: 'var(--color-success-bg)',
            border: '2px solid var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={22} color="var(--color-success)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem' }}>Student Sign In</h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Access your active tokens and digital queue status</p>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="student-email">Campus Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="student-email"
                type="email"
                className="form-input"
                placeholder="alex.student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student-password">Password</label>
            <input
              id="student-password"
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
            Sign In to Student Portal
            <ArrowRight size={16} />
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>New student? </span>
          <Link to="/auth/student/register" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
            Create student account
          </Link>
        </div>
      </div>
    </div>
  );
}
