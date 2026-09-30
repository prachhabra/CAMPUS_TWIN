import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import {
  Shield,
  GraduationCap,
  Briefcase,
  AlertOctagon,
  CalendarCheck,
  Calendar,
  Users,
  ShoppingBag,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getAdminAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <Loader message="Compiling executive campus intelligence..." />;
  }

  const users = data?.users || { students: 0, teachers: 0, admins: 0, total: 0 };
  const academics = data?.academics || { totalAttendance: 0, overallAttendanceRate: 0 };
  const activities = data?.activities || { events: 0, clubs: 0, studyGroups: 0, skills: 0, confessions: 0 };
  const services = data?.services || { complaints: { total: 0, pending: 0, resolved: 0 }, marketplace: 0, lostFound: 0 };
  const placements = data?.placements || { total: 0, selected: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Executive Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #172033 0%, #243B6B 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            EXECUTIVE CONTROL CENTER
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }}>
            Institutional Administration & Governance
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.9375rem', marginTop: 4 }}>
            System-wide oversight, user directories, moderation queues, and operational telemetry
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/analytics" className="btn btn-secondary" style={{ backgroundColor: '#fff', color: 'var(--primary)' }}>
            Deep Analytics
          </Link>
          <Link to="/admin/complaints" className="btn btn-primary" style={{ backgroundColor: 'var(--accent)' }}>
            Review Tickets ({services.complaints.pending} Pending)
          </Link>
        </div>
      </div>

      {/* Real CountDocuments Metric Cards Grid */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Registered Students</span>
            <span className="stat-value">{users.students}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Verified scholar profiles
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}
          >
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Faculty Roster</span>
            <span className="stat-value">{users.teachers}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Academic professors & leads
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}
          >
            <AlertOctagon size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Grievances</span>
            <span className="stat-value">{services.complaints.pending}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {services.complaints.total} total tickets filed
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}
          >
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Campus Attendance Rate</span>
            <span className="stat-value">{academics.overallAttendanceRate}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {academics.totalAttendance} check-ins audited
            </span>
          </div>
        </div>
      </div>

      {/* Module Overview Navigation Grid */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
        CampusTwin Management Modules
      </h3>

      <div className="grid-cols-3">
        <Link to="/admin/students" style={{ display: 'block' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GraduationCap size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Student Records
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {users.students} accounts enrolled
                </div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/events" style={{ display: 'block' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Events & Symposia
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {activities.events} events published
                </div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/complaints" style={{ display: 'block' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-light)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertOctagon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Grievances & Tickets
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {services.complaints.pending} pending review
                </div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/clubs" style={{ display: 'block' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--secondary-light)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Clubs & Chapters
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {activities.clubs} registered clubs
                </div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/confessions" style={{ display: 'block' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Confession Moderation
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {activities.confessions} posts submitted
                </div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/marketplace" style={{ display: 'block' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShoppingBag size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Marketplace Moderation
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {services.marketplace} items listed
                </div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
