import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/student/ServiceCard';
import { Layers, Clock, ShieldCheck, Zap, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import Button from '../components/common/Button';

export default function LandingPage() {
  const { services, joinQueue, activeToken } = useQueue();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joiningId, setJoiningId] = useState(null);

  const handleJoin = async (serviceId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setJoiningId(serviceId);
    try {
      await joinQueue(serviceId);
      navigate('/student');
    } catch (err) {
      alert(err.message);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        color: '#ffffff',
        padding: '4.5rem 0 5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#e0e7ff',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(4px)'
            }}>
              <Zap size={16} color="#fbbf24" />
              <span>Zero-Wait Smart Campus Experience</span>
            </div>

            <h1 style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}>
              Stop Waiting in Physical Lines. <br />
              <span style={{
                background: 'linear-gradient(90deg, #818cf8, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Queue Digitally in Real Time.
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '650px',
              margin: '0 auto 2.25rem'
            }}>
              QueueLess eliminates physical congestion at college canteens, photocopy shops, and administrative offices. Get a digital token, track your live position from your phone, and arrive right when your number is called.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/student">
                <Button variant="primary" size="lg" style={{ background: '#4f46e5' }}>
                  Explore Student Dashboard
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/staff">
                <Button variant="secondary" size="lg" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
                  Staff Counter Console
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderBottom: '1px solid var(--navy-200)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-lg)', color: 'var(--primary-700)' }}>
                <Clock size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Dynamic Wait Time Estimates</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)', lineHeight: 1.5 }}>
                  Know exactly how many students are ahead and your estimated turnaround time before walking over.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--warning-50)', padding: '0.85rem', borderRadius: 'var(--radius-lg)', color: 'var(--warning-700)' }}>
                <Zap size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Zero Duplicate Token Guarantee</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)', lineHeight: 1.5 }}>
                  Powered by atomic PostgreSQL transactions and row-level locks to guarantee sequential numbers without race conditions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--success-50)', padding: '0.85rem', borderRadius: 'var(--radius-lg)', color: 'var(--success-700)' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Audited Counter Operations</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--navy-600)', lineHeight: 1.5 }}>
                  Staff manage queues with single-click actions (Call Next, Start, Complete, Skip) backed by immutable transition records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Services Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-700)', letterSpacing: '0.05em' }}>
                Active Campus Counters
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--navy-950)' }}>
                Select a Service & Join the Queue
              </h2>
            </div>
            <Link to="/student" style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              View Student Dashboard <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onJoin={handleJoin}
                hasActiveToken={activeToken && activeToken.service_id === service.id}
                isJoining={joiningId === service.id}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
