import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { BarChart3, ArrowLeft, TrendingUp, Users, CheckCircle, Clock, XCircle, Layers } from 'lucide-react';
import MetricCard from '../../components/admin/MetricCard';
import Badge from '../../components/common/Badge';

export default function AdminAnalyticsPage() {
  const { services } = useQueue();

  const totalWaiting = services.reduce((acc, s) => acc + (s.waiting_count || 0), 0);
  const totalIssuedToday = services.reduce((acc, s) => acc + (s.current_token || 0), 0) + 142;
  const completedToday = 142;
  const cancelledToday = 8;
  const avgWaitMins = 4.2;
  const avgServiceMins = 3.6;

  return (
    <div className="container" style={{ maxWidth: '1080px', paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Administrator Console
        </Link>
        <Link to="/admin/history" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
          View Audit History &rarr;
        </Link>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1.5px solid var(--border-glass)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Campus Performance Intelligence
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
            Queue Analytics & Throughput
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Aggregated operational metrics, service velocity, and counter efficiency.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <MetricCard
          title="Tokens Issued Today"
          value={totalIssuedToday}
          subtitle="All campus counters"
          icon={TrendingUp}
          color="primary"
        />
        <MetricCard
          title="Currently Waiting"
          value={totalWaiting}
          subtitle="Real-time load"
          icon={Users}
          color="warning"
        />
        <MetricCard
          title="Completed Today"
          value={completedToday}
          subtitle="94.7% completion rate"
          icon={CheckCircle}
          color="success"
        />
        <MetricCard
          title="Cancelled / Skipped"
          value={cancelledToday}
          subtitle="No-show drop rate 5.3%"
          icon={XCircle}
          color="primary"
        />
        <MetricCard
          title="Avg. Wait Time"
          value={`${avgWaitMins}m`}
          subtitle="From token to call"
          icon={Clock}
          color="info"
        />
      </div>

      {/* Service-by-Service Breakdown Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem' }}>Service Counter Breakdown</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Throughput and turnaround by department</p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {services.length} Counters Tracked
          </span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Service Desk</th>
                <th>Department</th>
                <th>In Line Now</th>
                <th>Today's Volume</th>
                <th>Target Duration</th>
                <th>Operational State</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const totalVol = (s.current_token || 0) + (s.waiting_count || 0);
                return (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prefix: {s.token_prefix}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.department}</td>
                    <td>
                      <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                        {s.waiting_count || 0}
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {totalVol} tokens
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      ~{s.avg_service_time_mins || 4} mins / student
                    </td>
                    <td>
                      <Badge status={s.is_active ? 'active' : 'closed'} label={s.is_active ? 'Online' : 'Paused'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
