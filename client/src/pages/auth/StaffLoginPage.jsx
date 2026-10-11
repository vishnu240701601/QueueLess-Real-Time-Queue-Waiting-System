import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, ArrowLeft, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

export default function StaffLoginPage() {
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
      if (authenticatedUser.role !== 'staff' && authenticatedUser.role !== 'admin') {
        setError(`Access Denied: This account is registered as '${authenticatedUser.role}'. Only authorized staff members can access the counter console.`);
        return;
      }
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid staff credentials.');
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
            background: 'var(--color-info-bg)',
            border: '2px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem' }}>Staff Counter Sign In</h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Operate assigned campus service counters</p>
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
            <label className="form-label" htmlFor="staff-email">Staff Email</label>
            <input
              id="staff-email"
              type="email"
              className="form-input"
              placeholder="r.miller@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staff-password">Password</label>
            <input
              id="staff-password"
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
            variant="cyan"
            style={{ width: '100%', marginTop: '0.5rem' }}
            loading={loading}
          >
            Sign In to Staff Console
            <ArrowRight size={16} />
          </Button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <ShieldCheck size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <span>Staff console access is restricted to personnel with active counter assignments configured by an administrator.</span>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Need a staff account? </span>
          <Link to="/auth/staff/register" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
            Submit staff request
          </Link>
        </div>
      </div>
    </div>
  );
}
