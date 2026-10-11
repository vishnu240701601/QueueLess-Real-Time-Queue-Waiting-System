import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';

export default function StaffRegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    department: 'Canteen',
    email: '',
    employee_id: '',
    invitation_code: '',
    password: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.invitation_code) {
      setError('An authorized Staff Invitation / Department Code is required to register a staff account.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="container" style={{ maxWidth: '520px', paddingTop: '1.5rem', paddingBottom: '3rem' }}>
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
            <h1 style={{ fontSize: '1.65rem' }}>Staff Account Request</h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Authorized counter operator onboarding</p>
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-success-bg)',
              border: '2px solid var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <ShieldAlert size={28} color="var(--color-success)" />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Request Submitted for Approval</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your staff account request has been queued. An administrator must verify your credentials and assign you to a service counter before you can access the staff console.
            </p>
            <Link to="/auth/staff/login">
              <Button variant="primary">Return to Staff Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1.5px solid var(--color-warning-border)',
              color: '#fbbf24',
              fontSize: '0.825rem',
              lineHeight: 1.5,
              marginBottom: '1.25rem'
            }}>
              <strong>Notice:</strong> Staff accounts require an authorized administrator invitation code and counter assignment before queue access is enabled.
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
                <label className="form-label" htmlFor="staff_full_name">Staff Full Name</label>
                <input
                  id="staff_full_name"
                  name="full_name"
                  type="text"
                  className="form-input"
                  placeholder="Robert Miller"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="employee_id">Employee ID</label>
                  <input
                    id="employee_id"
                    name="employee_id"
                    type="text"
                    className="form-input"
                    placeholder="EMP-1082"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="invitation_code">Invitation Code</label>
                  <input
                    id="invitation_code"
                    name="invitation_code"
                    type="text"
                    className="form-input"
                    placeholder="ADMIN-SEC-2026"
                    value={formData.invitation_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="department">Service Counter Department</label>
                <select
                  id="department"
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Canteen">Dining & Canteen</option>
                  <option value="Photocopy">Photocopy & Printing Centre</option>
                  <option value="Library">Central Library</option>
                  <option value="Examination">Hall Ticket / Examination Office</option>
                  <option value="Administration">Administrative Office</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="staff_reg_email">Campus Staff Email</label>
                <input
                  id="staff_reg_email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="r.miller@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="staff_reg_password">Password</label>
                <input
                  id="staff_reg_password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="cyan"
                style={{ width: '100%', marginTop: '0.5rem' }}
                loading={loading}
              >
                Submit Staff Request
                <ArrowRight size={16} />
              </Button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already approved? </span>
              <Link to="/auth/staff/login" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Sign in to staff console
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
