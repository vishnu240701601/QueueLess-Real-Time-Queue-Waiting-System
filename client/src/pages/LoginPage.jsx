import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password || 'password123');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole) => {
    setLoading(true);
    try {
      const demoEmails = {
        student: 'alex.student@college.edu',
        staff: 'staff.canteen@college.edu',
        admin: 'admin.queueless@college.edu'
      };
      const user = await login(demoEmails[demoRole], 'demo123');
      if (demoRole === 'admin') navigate('/admin');
      else if (demoRole === 'staff') navigate('/staff');
      else navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '3.5rem 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--primary-50)',
            color: 'var(--primary-700)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '0.75rem'
          }}>
            <Layers size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)' }}>
            Sign in to access your queue tickets and service dashboards
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-50)',
            color: 'var(--danger-700)',
            border: '1px solid var(--danger-100)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. alex.student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-700)', cursor: 'pointer' }}>Forgot?</span>
            </div>
            <input
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
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast-Login Helper */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px dashed var(--navy-300)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.785rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            <span>Instant Demo Preview</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => handleQuickLogin('student')}>
              Student
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickLogin('staff')}>
              Staff
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickLogin('admin')}>
              Admin
            </Button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--navy-600)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
