import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import { useQueue } from '../context/QueueContext';
import { queueService } from '../api/queueService';
import MetricCard from '../components/admin/MetricCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { 
  Layers, 
  Users, 
  CheckCircle, 
  Clock, 
  Plus, 
  Shield, 
  Search, 
  Power, 
  History, 
  BarChart3, 
  XCircle, 
  AlertCircle,
  UserPlus,
  Trash2,
  Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { services, refreshQueue } = useQueue();
  const [metrics, setMetrics] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Counter Creation Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDept, setNewServiceDept] = useState('');
  const [newServicePrefix, setNewServicePrefix] = useState('DESK');
  const [newServiceDuration, setNewServiceDuration] = useState('4');

  // Token Search & Admin Token Control
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [manualTokenModalOpen, setManualTokenModalOpen] = useState(false);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualSelectedService, setManualSelectedService] = useState(services[0]?.id || '');

  // Staff Assignment Modal
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
      alert('Manual walk-in token created successfully.');
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
    if (confirm('Revoke counter assignment for this staff operator?')) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
      {/* Admin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1.5px solid var(--border-glass)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Administrator Console
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
            Campus Queue Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Full administrative control over campus service counters, staff assignments, and token workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/history">
            <Button variant="secondary" icon={History}>
              Audit History
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="secondary" icon={BarChart3}>
              Analytics
            </Button>
          </Link>
          <Button
            variant="cyan"
            icon={Ticket}
            onClick={() => setManualTokenModalOpen(true)}
          >
            Add Token Manually
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Counter
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <MetricCard
          title="Active Counters"
          value={`${services.filter(s => s.is_active).length} / ${services.length}`}
          subtitle="Campus wide"
          icon={Layers}
          color="primary"
        />
        <MetricCard
          title="Students in Line"
          value={services.reduce((acc, s) => acc + (s.waiting_count || 0), 0)}
          subtitle="Real-time waiting"
          icon={Users}
          color="warning"
        />
        <MetricCard
          title="Completed Today"
          value={metrics?.totalServedToday || 142}
          subtitle="Served successfully"
          icon={CheckCircle}
          color="success"
        />
        <MetricCard
          title="Avg. Turnaround"
          value={`${metrics?.avgWaitTimeMins || 4.2}m`}
          subtitle="Target < 5 mins"
          icon={Clock}
          color="info"
        />
      </div>

      {/* Two-Column Layout: Services Management & Staff Assignments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)',
        gap: '2rem',
        alignItems: 'start',
        marginBottom: '3rem'
      }}>
        {/* Service Management Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem' }}>Service Counters</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage operational state, prefixes & velocity</p>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {services.length} Counters
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Counter Name</th>
                  <th>Department</th>
                  <th>Est. Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prefix: {s.token_prefix}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.department}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.avg_service_time_mins}m / student</td>
                    <td>
                      <Badge status={s.is_active ? 'active' : 'closed'} label={s.is_active ? 'Active' : 'Paused'} />
                    </td>
                    <td>
                      <Button
                        variant={s.is_active ? 'secondary' : 'success'}
                        size="sm"
                        icon={Power}
                        onClick={() => handleToggleService(s.id, s.is_active)}
                      >
                        {s.is_active ? 'Pause' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Assignment View */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem' }}>Staff Assignments</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active operators per service desk</p>
            </div>
            <Button variant="secondary" size="sm" icon={UserPlus} onClick={() => setStaffModalOpen(true)}>
              Assign Staff
            </Button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Assigned Counter</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((stf) => (
                  <tr key={stf.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stf.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stf.email}</div>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--accent-cyan)' }}>
                      {stf.serviceName}
                    </td>
                    <td>
                      <button
                        onClick={() => handleRevokeStaff(stf.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '0.3rem',
                          borderRadius: '4px'
                        }}
                        title="Revoke Assignment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Counter Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Service Counter"
      >
        <form onSubmit={handleCreateService}>
          <div className="form-group">
            <label className="form-label">Service Counter Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Science Lab Equipment Return"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Physics Department"
              value={newServiceDept}
              onChange={(e) => setNewServiceDept(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Token Prefix</label>
              <input
                type="text"
                className="form-input"
                placeholder="LAB"
                value={newServicePrefix}
                onChange={(e) => setNewServicePrefix(e.target.value.toUpperCase())}
                maxLength="4"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Avg. Service Minutes</label>
              <input
                type="number"
                className="form-input"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
                min="1"
                max="60"
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Counter</Button>
          </div>
        </form>
      </Modal>

      {/* Manual Token Creation Modal */}
      <Modal
        isOpen={manualTokenModalOpen}
        onClose={() => setManualTokenModalOpen(false)}
        title="Issue Walk-in Digital Token"
      >
        <form onSubmit={handleCreateManualToken}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Administrative utility for students arriving at helpdesks without personal smartphones.
          </p>
          <div className="form-group">
            <label className="form-label">Student Name / Visitor ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Priya Sundaram"
              value={manualStudentName}
              onChange={(e) => setManualStudentName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Service Counter</label>
            <select
              className="form-select"
              value={manualSelectedService}
              onChange={(e) => setManualSelectedService(e.target.value)}
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.token_prefix})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setManualTokenModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="cyan">Issue Token</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Assign Staff to Counter"
      >
        <form onSubmit={handleAddStaff}>
          <div className="form-group">
            <label className="form-label">Staff Member Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ananya Gupta"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Staff Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. a.gupta@college.edu"
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Service Desk</label>
            <select
              className="form-select"
              value={newStaffService}
              onChange={(e) => setNewStaffService(e.target.value)}
            >
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Assignment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
