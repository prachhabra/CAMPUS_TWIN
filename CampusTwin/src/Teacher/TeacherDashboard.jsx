import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classService } from '../services/classService';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  Layers,
  GraduationCap,
  CalendarCheck,
  Calendar,
  Plus,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const [clsRes, attRes, evRes] = await Promise.allSettled([
          classService.getTeacherClasses(),
          attendanceService.getTeacherHistory({}),
          eventService.getEvents({ limit: 4 })
        ]);

        if (clsRes.status === 'fulfilled' && clsRes.value.success) {
          setClasses(clsRes.value.data || []);
        }
        if (attRes.status === 'fulfilled' && attRes.value.success) {
          setAttendanceRecords(attRes.value.records || []);
        }
        if (evRes.status === 'fulfilled' && evRes.value.success) {
          setEvents(evRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return <Loader message="Compiling faculty instruction telemetry..." />;
  }

  // Calculate unique student count across classes
  const uniqueStudents = new Set();
  classes.forEach((c) => (c.students || []).forEach((s) => uniqueStudents.add(s._id || s)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Faculty Banner */}
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
            FACULTY INSTRUCTION DESK
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }}>
            Welcome, Professor {user?.name}!
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.9375rem', marginTop: 4 }}>
            {user?.department} • ID: {user?.employeeId || 'Faculty Staff'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/teacher/attendance"
            className="btn"
            style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 700 }}
          >
            <CalendarCheck size={18} /> Launch Attendance Session
          </Link>
          <Link
            to="/teacher/classes"
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderColor: 'transparent' }}
          >
            <Plus size={18} /> Create Course
          </Link>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Assigned Classes</span>
            <span className="stat-value">{classes.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Active instruction courses
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{uniqueStudents.size}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Across all courses
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
            <span className="stat-label">Attendance Logs</span>
            <span className="stat-value">{attendanceRecords.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Student check-ins recorded
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}
          >
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Campus Events</span>
            <span className="stat-value">{events.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Published calendar
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: My Classes & Recent Activity */}
      <div className="grid-cols-2">
        {/* Classes Card */}
        <Card
          title={
            <>
              <Layers size={20} color="var(--primary)" />
              <span>My Classes & Courses</span>
            </>
          }
          action={
            <Link
              to="/teacher/classes"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Manage Classes <ArrowRight size={14} />
            </Link>
          }
        >
          {classes.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses created"
              description="Create your first academic class to enroll students and manage attendance."
              action={
                <Link to="/teacher/classes" className="btn btn-primary btn-sm">
                  <Plus size={14} /> Create Course
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classes.slice(0, 4).map((cls) => (
                <div
                  key={cls._id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-alt)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                      {cls.name} ({cls.code})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                      {cls.subject} • {cls.department}
                    </div>
                  </div>
                  <span className="status-badge student">
                    {cls.students?.length || 0} Students
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Launch Attendance Panel */}
        <Card
          title={
            <>
              <CalendarCheck size={20} color="var(--primary)" />
              <span>Attendance Sessions</span>
            </>
          }
          action={
            <Link
              to="/teacher/attendance"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Session Tracker <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ padding: 10, textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Generate cryptographic 6-character check-in codes with QR codes during lectures to take instant attendance.
            </p>
            <Link to="/teacher/attendance" className="btn btn-primary">
              <CalendarCheck size={18} /> Start New Lecture Session
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
