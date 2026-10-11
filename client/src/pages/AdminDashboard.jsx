import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import { useQueue } from '../context/QueueContext';
import MetricCard from '../components/admin/MetricCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Layers, Users, CheckCircle, Clock, Plus, Shield, Activity, Power } from 'lucide-react';

export default function AdminDashboard() {
  const { services } = useQueue();
  const [metrics, setMetrics] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDept, setNewServiceDept] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('4');

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
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    alert(`Service "${newServiceName}" created successfully (Preview Mode). In Phase 4, this persists via POST /api/counters.`);
    setCreateModalOpen(false);
    setNewServiceName('');
    setNewServiceDept('');
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Administrator Console
          </span>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--navy-950)', marginTop: '0.2rem' }}>
            Campus Queue Operations
          </h1>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Add New Counter
        </Button>
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
          value={`${metrics?.activeCounters || 4} / ${metrics?.totalCounters || 5}`}
          subtitle="Campus wide"
          icon={Layers}
          color="primary"
        />
        <MetricCard
          title="Total Waiting Now"
          value={metrics?.totalWaitingToday || 18}
          subtitle="Across all queues"
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
          value={`${metrics?.avgWaitTimeMins || 4.5}m`}
          subtitle="Target under 5 mins"
          icon={Clock}
          color="info"
        />
      </div>

      {/* Two-Column Layout: Services Management & Staff Assignments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(300px, 1fr)',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Service Management Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--navy-950)' }}>Service Counters</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
              {services.length} Total Registered
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Counter Name</th>
                  <th>Department</th>
                  <th>Target Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: 'var(--navy-900)' }}>{s.name}</strong>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>{s.department}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>{s.avg_service_time_mins} mins</td>
                    <td>
                      <Badge status={s.is_active ? 'active' : 'paused'} label={s.is_active ? 'Active' : 'Paused'} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--navy-950)' }}>Staff Assignments</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>
              Active Operators
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Assigned Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((stf) => (
                  <tr key={stf.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{stf.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--navy-500)' }}>{stf.email}</div>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--navy-700)' }}>
                      {stf.serviceName}
                    </td>
                    <td>
                      <Badge status="active" label={stf.status} />
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
          <div className="form-group">
            <label className="form-label">Average Handling Time (Minutes)</label>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Counter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
