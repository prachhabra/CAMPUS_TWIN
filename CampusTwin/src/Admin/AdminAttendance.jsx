import React, { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { CalendarCheck, CheckCircle2, XCircle, Search } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';

const AdminAttendance = () => {
  const { showError } = useToast();

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalPresent: 0,
    totalAbsent: 0,
    overallRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAllAdmin({
        page,
        limit: 15,
        status: statusFilter === 'All' ? undefined : statusFilter
      });
      if (res.success) {
        setRecords(res.records || []);
        setStats({
          total: res.total || 0,
          totalPresent: res.totalPresent || 0,
          totalAbsent: res.totalAbsent || 0,
          overallRate: res.overallRate || 0
        });
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, statusFilter]);

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.student?.name || 'Student'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {row.student?.rollNumber || 'N/A'} • {row.student?.department}
          </div>
        </div>
      )
    },
    {
      header: 'Course & Class',
      accessor: 'class',
      render: (row) => row.class?.name || 'Class'
    },
    {
      header: 'Subject',
      accessor: 'subject'
    },
    {
      header: 'Faculty Instructor',
      accessor: 'teacher',
      render: (row) => row.teacher?.name || 'Faculty'
    },
    {
      header: 'Session Code',
      accessor: 'session',
      render: (row) => <code style={{ color: 'var(--accent)' }}>{row.session}</code>
    },
    {
      header: 'Marked At',
      accessor: 'markedAt',
      render: (row) => formatDateTime(row.markedAt || row.date)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <CalendarCheck size={24} color="var(--primary)" /> System-Wide Attendance Audit
          </h2>
          <p className="page-subtitle">
            Comprehensive institutional attendance verification ledger and rate telemetry
          </p>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Logs Audited</span>
            <span className="stat-value">{stats.total}</span>
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
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Present</span>
            <span className="stat-value">{stats.totalPresent}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Verified check-ins
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}
          >
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Absent</span>
            <span className="stat-value">{stats.totalAbsent}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Missed lectures
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overall Rate</span>
            <span className="stat-value">{stats.overallRate}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Campus attendance ratio
            </span>
          </div>
        </div>
      </div>

      <Card>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'present', 'absent'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: statusFilter === st ? 'var(--primary)' : 'var(--background)',
                  color: statusFilter === st ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={records}
          loading={loading}
          emptyTitle="No attendance records found"
          emptyMessage="No student attendance logs have been recorded in the system yet."
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={stats.total}
          limit={15}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
};

export default AdminAttendance;
