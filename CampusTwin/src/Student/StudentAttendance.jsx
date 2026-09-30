import React, { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import FormField from '../components/FormField';
import { CalendarCheck, QrCode, Check, AlertCircle, Clock, BookOpen } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/helpers';

const StudentAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
    subjectWise: [],
    records: []
  });

  const { showSuccess, showError } = useToast();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMyAttendance();
      if (res.success) {
        setAttendanceData(res);
      }
    } catch (err) {
      showError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      showError('Please enter attendance session code');
      return;
    }

    try {
      setSubmitting(true);
      const res = await attendanceService.checkIn(sessionCode.trim());
      showSuccess(res.message || 'Attendance recorded successfully!');
      setSessionCode('');
      fetchAttendance();
    } catch (err) {
      showError(err.message || 'Unable to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Subject / Course',
      accessor: 'subject',
      render: (row) => <strong>{row.subject}</strong>
    },
    {
      header: 'Session Code',
      accessor: 'session',
      render: (row) => <code style={{ color: 'var(--accent)' }}>{row.session}</code>
    },
    {
      header: 'Date & Time Marked',
      accessor: 'markedAt',
      render: (row) => formatDateTime(row.markedAt || row.date)
    },
    {
      header: 'Faculty Instructor',
      accessor: 'teacher',
      render: (row) => row.teacher?.name || 'Faculty'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  if (loading) {
    return <Loader message="Fetching institutional attendance ledger..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <CalendarCheck size={24} color="var(--primary)" /> Attendance Portal
          </h2>
          <p className="page-subtitle">
            Record attendance using faculty session codes and inspect your course metrics
          </p>
        </div>
      </div>

      {/* Top Section: Quick Session Check-In Card & Overall Metrics */}
      <div className="grid-cols-3">
        {/* Session Code Check-In Box */}
        <Card
          title={
            <>
              <QrCode size={18} color="var(--accent)" />
              <span>Live Attendance Check-In</span>
            </>
          }
          style={{ gridColumn: 'span 2' }}
        >
          <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-character code (e.g. CS204A)"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                disabled={submitting}
                maxLength={10}
                style={{
                  fontSize: '1.125rem',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                Provided by your instructor during the active lecture session
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={submitting || !sessionCode.trim()}
              style={{ height: 46 }}
            >
              <Check size={18} />
              {submitting ? 'Verifying...' : 'Check In'}
            </button>
          </form>
        </Card>

        {/* Overall Percentage Card */}
        <div
          className="stat-card"
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 24
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)' }}>
            OVERALL ATTENDANCE
          </span>
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: attendanceData.percentage >= 75 ? 'var(--success)' : 'var(--danger)',
              margin: '4px 0'
            }}
          >
            {attendanceData.percentage}%
          </span>
          <StatusBadge
            status={attendanceData.percentage >= 75 ? 'present' : 'absent'}
            className=""
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 8 }}>
            {attendanceData.present} present out of {attendanceData.total} sessions
          </span>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      {attendanceData.subjectWise.length > 0 && (
        <Card
          title={
            <>
              <BookOpen size={18} color="var(--primary)" />
              <span>Course Attendance Breakdown</span>
            </>
          }
        >
          <div className="grid-cols-3">
            {attendanceData.subjectWise.map((sub, idx) => (
              <div
                key={idx}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-alt)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                  {sub.subject}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {sub.percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {sub.present} / {sub.total} classes
                    </div>
                  </div>
                  <span
                    className={`status-badge ${sub.percentage >= 75 ? 'present' : 'absent'}`}
                  >
                    {sub.percentage >= 75 ? 'Eligible' : 'Low'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Attendance History Log */}
      <Card
        title={
          <>
            <Clock size={18} color="var(--primary)" />
            <span>Attendance History Log</span>
          </>
        }
      >
        <Table
          columns={columns}
          data={attendanceData.records}
          loading={false}
          emptyTitle="No attendance records yet"
          emptyMessage="Your attendance record ledger will appear here once you check into lectures."
        />
      </Card>
    </div>
  );
};

export default StudentAttendance;
