import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import { useQueue } from '../context/QueueContext';
import { queueService } from '../api/queueService';
import MetricCard from '../components/admin/MetricCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Link } from 'react-router-dom';
import { Layers, Users, CheckCircle, Clock, Plus, Power, UserPlus, Trash2, Ticket } from 'lucide-react';

export default function AdminDashboard() {
  const { services, refreshQueue } = useQueue();
  const [metrics, setMetrics] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDept, setNewServiceDept] = useState('');
  const [newServicePrefix, setNewServicePrefix] = useState('DESK');
  const [newServiceDuration, setNewServiceDuration] = useState('4');

  const [manualTokenModalOpen, setManualTokenModalOpen] = useState(false);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualSelectedService, setManualSelectedService] = useState(services[0]?.id || '');

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffService, setNewStaffService] = useState(services[0]?.name || 'Canteen');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [m, s] = await Promise.all([
          adminService.getMetrics(),
          adminService.getStaffList()
        ]);
        setMetrics(m);
        setStaffList(s);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleToggleService = async (serviceId, currentStatus) => {
    try {
      await adminService.toggleServiceStatus(serviceId, !currentStatus);
      await refreshQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    alert(`Service "${newServiceName}" registered successfully.`);
    setCreateModalOpen(false);
    setNewServiceName('');
    setNewServiceDept('');
  };

  const handleCreateManualToken = async (e) => {
    e.preventDefault();
    try {
      await queueService.joinQueue(manualSelectedService || services[0].id, {
        id: `usr-admin-gen-${Date.now()}`,
        full_name: manualStudentName || 'Walk-in Student'
      });
      await refreshQueue();
      setManualTokenModalOpen(false);
      setManualStudentName('');
      alert('Walk-in token created successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    setStaffList([
      ...staffList,
      {
        id: `stf-${Date.now()}`,
        name: newStaffName,
        email: newStaffEmail,
        serviceName: newStaffService,
        status: 'Online'
      }
    ]);
    setStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
  };

  const handleRevokeStaff = (id) => {
    if (confirm('Revoke counter assignment for this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Campus queue system management — counters, staff, and tokens.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/admin/history" className="btn btn-secondary btn-sm">History</Link>
            <Link to="/admin/analytics" className="btn btn-secondary btn-sm">Analytics</Link>
            <button className="btn btn-secondary btn-sm" onClick={() => setManualTokenModalOpen(true)}>+ Token</button>
            <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>+ Counter</button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-row">
        <MetricCard
          title="Active Counters"
          value={`${services.filter(s => s.is_active).length} / ${services.length}`}
          subtitle="Campus wide"
        />
        <MetricCard
          title="Waiting Now"
          value={services.reduce((acc, s) => acc + (s.waiting_count || 0), 0)}
          subtitle="Real-time queue"
        />
        <MetricCard
          title="Completed Today"
          value={metrics?.totalServedToday || 0}
          subtitle="Successfully served"
        />
        <MetricCard
          title="Avg. Wait"
          value={`${metrics?.avgWaitTimeMins || '—'} min`}
          subtitle="Target < 5 min"
        />
      </div>

      {/* Two-column: Services + Staff */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(260px, 1fr)', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>

        {/* Service Counters Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Service Counters</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{services.length} total</span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Counter</th>
                  <th>Department</th>
                  <th>Waiting</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prefix: {s.token_prefix}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.department}</td>
                    <td>{s.waiting_count || 0}</td>
                    <td>
                      <Badge status={s.is_active ? 'active' : 'closed'} label={s.is_active ? 'Active' : 'Paused'} />
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${s.is_active ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => handleToggleService(s.id, s.is_active)}
                      >
                        {s.is_active ? 'Pause' : 'Resume'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Assignments */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Staff Assignments</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setStaffModalOpen(true)}>+ Assign</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Counter</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((stf) => (
                  <tr key={stf.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{stf.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stf.email}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{stf.serviceName}</td>
                    <td>
                      <button
                        onClick={() => handleRevokeStaff(stf.id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Revoke Assignment"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      No staff assignments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Counter Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add New Service Counter">
        <form onSubmit={handleCreateService}>
          <div className="form-group">
            <label className="form-label">Counter Name</label>
            <input type="text" className="form-input" placeholder="e.g. Science Lab Equipment Return"
              value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input type="text" className="form-input" placeholder="e.g. Physics Department"
              value={newServiceDept} onChange={(e) => setNewServiceDept(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Token Prefix</label>
              <input type="text" className="form-input" placeholder="LAB" maxLength="4"
                value={newServicePrefix} onChange={(e) => setNewServicePrefix(e.target.value.toUpperCase())} required />
            </div>
            <div className="form-group">
              <label className="form-label">Avg. Service (min)</label>
              <input type="number" className="form-input" min="1" max="60"
                value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Counter</Button>
          </div>
        </form>
      </Modal>

      {/* Manual Token Modal */}
      <Modal isOpen={manualTokenModalOpen} onClose={() => setManualTokenModalOpen(false)} title="Issue Walk-in Token">
        <form onSubmit={handleCreateManualToken}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            For students without smartphones who arrive at the helpdesk.
          </p>
          <div className="form-group">
            <label className="form-label">Student Name / Visitor ID</label>
            <input type="text" className="form-input" placeholder="e.g. Priya Sundaram"
              value={manualStudentName} onChange={(e) => setManualStudentName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Target Service Counter</label>
            <select className="form-select" value={manualSelectedService}
              onChange={(e) => setManualSelectedService(e.target.value)}>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.token_prefix})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setManualTokenModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Issue Token</Button>
          </div>
        </form>
      </Modal>

      {/* Staff Assignment Modal */}
      <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} title="Assign Staff to Counter">
        <form onSubmit={handleAddStaff}>
          <div className="form-group">
            <label className="form-label">Staff Name</label>
            <input type="text" className="form-input" placeholder="e.g. Ananya Gupta"
              value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Staff Email</label>
            <input type="email" className="form-input" placeholder="a.gupta@college.edu"
              value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Service Counter</label>
            <select className="form-select" value={newStaffService}
              onChange={(e) => setNewStaffService(e.target.value)}>
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Assignment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
