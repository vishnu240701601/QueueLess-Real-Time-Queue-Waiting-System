import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, User, Mail, Lock, IdCard, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_id: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid college email is required';
    if (!formData.student_id.trim()) errs.student_id = 'Student ID or Roll number is required';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setSubmitting(true);

    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        student_id: formData.student_id,
        password: formData.password
      });
      navigate('/student');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '3rem 1rem' }}>
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
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Account</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)' }}>
            Register to join queues at college canteens and service counters
          </p>
        </div>

        {serverError && (
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
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Johnson"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            {errors.full_name && <div className="form-error">{errors.full_name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">College Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="student@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Student ID / Roll No.</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CS-2024-042"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            />
            {errors.student_id && <div className="form-error">{errors.student_id}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            />
            {errors.confirm_password && <div className="form-error">{errors.confirm_password}</div>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Create Student Account
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--navy-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
