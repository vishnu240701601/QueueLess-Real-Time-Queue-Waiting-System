import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.invitation_code) {
      setError('An authorized administrator invitation code is required to register a staff account.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="container" style={{ maxWidth: '420px', paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '0.75rem' }}>Request Submitted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Your staff account request has been submitted. An administrator must verify your credentials and assign you to a counter before you can access the staff console.
          </p>
          <Link to="/auth/staff/login" className="btn btn-primary">
            Go to Staff Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '460px', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        <Link to="/auth/choose-role">&larr; Back to portal selection</Link>
      </p>

      <div className="card">
        <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Staff Account Request</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          An invitation code from an administrator is required.
        </p>

        <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
          Staff accounts require an administrator invitation code and counter assignment before queue access is enabled.
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="staff_full_name">Full Name</label>
            <input
              id="staff_full_name"
              name="full_name"
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                placeholder="ADMIN-CODE"
                value={formData.invitation_code}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="Canteen">Dining &amp; Canteen</option>
              <option value="Photocopy">Photocopy &amp; Printing Centre</option>
              <option value="Library">Central Library</option>
              <option value="Examination">Hall Ticket / Examination Office</option>
              <option value="Administration">Administrative Office</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staff_reg_email">Email</label>
            <input
              id="staff_reg_email"
              name="email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
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
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Staff Request'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
          Already approved? <Link to="/auth/staff/login">Sign in to staff console</Link>
        </div>
      </div>
    </div>
  );
}
