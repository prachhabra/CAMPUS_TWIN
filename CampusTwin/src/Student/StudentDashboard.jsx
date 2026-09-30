import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import { clubService } from '../services/clubService';
import { notificationService } from '../services/notificationService';
import { placementService } from '../services/placementService';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  CalendarCheck,
  Calendar,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Bell
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    totalClasses: 0,
    upcomingEventsCount: 0,
    clubsCount: 0,
    placementsCount: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [attRes, evRes, clRes, notifRes, plRes] = await Promise.allSettled([
          attendanceService.getMyAttendance(),
          eventService.getEvents({ limit: 4, status: 'upcoming' }),
          clubService.getClubs({}),
          notificationService.getNotifications(),
          placementService.getPlacements({})
        ]);

        const attData = attRes.status === 'fulfilled' ? attRes.value : null;
        const evData = evRes.status === 'fulfilled' ? evRes.value : null;
        const clData = clRes.status === 'fulfilled' ? clRes.value : null;
        const notifData = notifRes.status === 'fulfilled' ? notifRes.value : null;
        const plData = plRes.status === 'fulfilled' ? plRes.value : null;

        setStats({
          attendancePercentage: attData?.percentage || 0,
          totalClasses: attData?.total || 0,
          upcomingEventsCount: evData?.total || 0,
          clubsCount: clData?.count || 0,
          placementsCount: plData?.total || 0
        });

        setUpcomingEvents(evData?.data || []);
        setRecentNotifications((notifData?.notifications || []).slice(0, 4));
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Compiling your personal campus telemetry..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #243B6B 0%, #395693 100%)',
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
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            STUDENT PORTAL
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }}>
            Welcome, {user?.name}!
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.9375rem', marginTop: 4 }}>
            {user?.department} • Roll No: {user?.rollNumber || 'Not Set'} • {user?.year || '1st Year'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/student/attendance"
            className="btn"
            style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 700 }}
          >
            <CalendarCheck size={18} /> Mark Attendance
          </Link>
          <Link
            to="/student/digital-id"
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderColor: 'transparent' }}
          >
            View Digital ID
          </Link>
        </div>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}
          >
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overall Attendance</span>
            <span className="stat-value">{stats.attendancePercentage}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {stats.totalClasses} classes recorded
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming Events</span>
            <span className="stat-value">{stats.upcomingEventsCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Campus activities
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Clubs</span>
            <span className="stat-value">{stats.clubsCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Chapters & societies
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Sparkles size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Campus Points</span>
            <span className="stat-value">{user?.points || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {(user?.badges || []).length} Badges earned
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Events & Activity */}
      <div className="grid-cols-2">
        {/* Upcoming Events */}
        <Card
          title={
            <>
              <Calendar size={20} color="var(--primary)" />
              <span>Campus Events</span>
            </>
          }
          action={
            <Link
              to="/student/events"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              All Events <ArrowRight size={14} />
            </Link>
          }
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Campus events and seminars will appear here as soon as scheduled by coordinators."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt._id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-alt)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                      {evt.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        fontSize: '0.75rem',
                        color: 'var(--muted)',
                        marginTop: 4
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {formatDate(evt.date)} • {evt.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {evt.venue}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={evt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notifications & Announcements */}
        <Card
          title={
            <>
              <Bell size={20} color="var(--primary)" />
              <span>Institutional Activity</span>
            </>
          }
        >
          {recentNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No activity alerts"
              description="Notifications regarding attendance, events, and approvals will show here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentNotifications.map((notif) => (
                <div
                  key={notif._id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: notif.read ? 'var(--surface)' : 'var(--accent-light)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>
                    {formatDate(notif.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
