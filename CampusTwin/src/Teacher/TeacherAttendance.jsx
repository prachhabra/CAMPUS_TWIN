import React, { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { classService } from '../services/classService';
import { useToast } from '../context/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Table from '../components/Table';
import { CalendarCheck, QrCode, Plus, Check, Clock, Edit2 } from 'lucide-react';
import { formatDateTime, formatDate } from '../utils/helpers';

const TeacherAttendance = () => {
  const { showSuccess, showError } = useToast();

  const [classes, setClasses] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // New session modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    classId: '',
    subject: '',
    minutesValid: 15
  });
  const [activeSessionResult, setActiveSessionResult] = useState(null);

  // Manual mark modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    studentId: '',
    course: '',
    subject: '',
    status: 'present'
  });
  const [formErrors, setFormErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const openManualModal = () => {
    setManualFormData({
      studentId: '',
      course: '',
      subject: '',
      status: 'present'
    });
    setFormErrors({});
    setShowManualModal(true);
  };

  const validateManualForm = () => {
    const errors = {};
    const trimmedId = manualFormData.studentId.trim();
    const trimmedCourse = manualFormData.course.trim();
    const trimmedSubject = manualFormData.subject.trim();

    if (!trimmedId) {
      errors.studentId = 'Student MongoDB User ID is required';
    } else if (!/^[0-9a-fA-F]{24}$/.test(trimmedId)) {
      errors.studentId = 'Please enter a valid 24-character MongoDB User ID';
    }

    if (!trimmedCourse) {
      errors.course = 'Course is required';
    }

    if (!trimmedSubject) {
      errors.subject = 'Subject is required';
    }

    if (!manualFormData.status) {
      errors.status = 'Attendance status is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [clsRes, histRes] = await Promise.allSettled([
        classService.getTeacherClasses(),
        attendanceService.getTeacherHistory({})
      ]);

      if (clsRes.status === 'fulfilled' && clsRes.value.success) {
        setClasses(clsRes.value.data || []);
        if (clsRes.value.data?.length > 0) {
          setSessionFormData((prev) => ({
            ...prev,
            classId: clsRes.value.data[0]._id,
            subject: clsRes.value.data[0].subject
          }));
        }
      }
      if (histRes.status === 'fulfilled' && histRes.value.success) {
        setHistoryRecords(histRes.value.records || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!sessionFormData.classId || !sessionFormData.subject) {
      showError('Please select class and subject');
      return;
    }

    try {
      setSubmitting(true);
      const res = await attendanceService.createSession(sessionFormData);
      if (res.success) {
        showSuccess('Live attendance session launched!');
        setActiveSessionResult(res.session);
        setShowSessionModal(false);
      }
    } catch (err) {
      showError(err.message || 'Failed to start session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualMark = async (e) => {
    e.preventDefault();
    if (!validateManualForm()) {
      return;
    }

    const payload = {
      studentId: manualFormData.studentId.trim(),
      course: manualFormData.course.trim(),
      subject: manualFormData.subject.trim(),
      status: manualFormData.status || 'present'
    };

    try {
      setSubmitting(true);
      const res = await attendanceService.markManual(payload);
      showSuccess(res.message || 'Student attendance updated manually!');
      setShowManualModal(false);
      setManualFormData({
        studentId: '',
        course: '',
        subject: '',
        status: 'present'
      });
      setFormErrors({});
      // Reload history
      const hist = await attendanceService.getTeacherHistory({});
      if (hist.success) setHistoryRecords(hist.records || []);
    } catch (err) {
      showError(err.message || 'Failed to mark attendance manually');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'student',
      render: (row) => <strong>{row.student?.name || 'Student'}</strong>
    },
    {
      header: 'Roll Number',
      accessor: 'rollNumber',
      render: (row) => row.student?.rollNumber || '—'
    },
    {
      header: 'Course / Class',
      accessor: 'class',
      render: (row) => row.class?.name || row.course || 'Class'
    },
    {
      header: 'Subject',
      accessor: 'subject'
    },
    {
      header: 'Session Code',
      accessor: 'session',
      render: (row) => <code style={{ color: 'var(--accent)' }}>{row.session}</code>
    },
    {
      header: 'Timestamp',
      accessor: 'markedAt',
      render: (row) => formatDateTime(row.markedAt || row.date)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  if (loading) {
    return <Loader message="Loading attendance controls..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <CalendarCheck size={24} color="var(--primary)" /> Attendance Sessions & Roster
          </h2>
          <p className="page-subtitle">
            Generate lecture session codes with instant QR verification and view logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={openManualModal}>
            <Edit2 size={16} /> Manual Mark / Override
          </button>
          <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>
            <QrCode size={16} /> Launch Live Session
          </button>
        </div>
      </div>

      {/* Live Active Session Display Card (if active) */}
      {activeSessionResult && (
        <Card
          style={{
            backgroundColor: 'var(--accent-light)',
            border: '2px solid var(--accent)',
            padding: 24
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 20
            }}
          >
            <div>
              <span className="status-badge ongoing" style={{ marginBottom: 6 }}>
                ACTIVE LECTURE SESSION
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                {activeSessionResult.subject} ({activeSessionResult.class})
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 4 }}>
                Valid until {new Date(activeSessionResult.expiresAt).toLocaleTimeString()}
              </p>
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>
                  CHECK-IN CODE:
                </span>
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    color: 'var(--accent)',
                    backgroundColor: '#fff',
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {activeSessionResult.code}
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center'
              }}
            >
              <QRCodeSVG value={activeSessionResult.code} size={130} level="M" />
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 6 }}>
                Students scan to mark attendance
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* History Table */}
      <Card
        title={
          <>
            <Clock size={18} color="var(--primary)" />
            <span>Attendance History Log ({historyRecords.length} records)</span>
          </>
        }
      >
        <Table
          columns={columns}
          data={historyRecords}
          loading={false}
          emptyTitle="No attendance logs found"
          emptyMessage="Launch a lecture session or mark manual attendance to start recording student check-ins."
        />
      </Card>

      {/* Start Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Launch Live Attendance Session"
      >
        <form onSubmit={handleStartSession}>
          <FormField label="Select Course / Class" required>
            <select
              className="form-select"
              value={sessionFormData.classId}
              onChange={(e) => {
                const cls = classes.find((c) => c._id === e.target.value);
                setSessionFormData({
                  ...sessionFormData,
                  classId: e.target.value,
                  subject: cls ? cls.subject : ''
                });
              }}
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code}) - {cls.subject}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Subject / Lecture Topic" required>
            <input
              type="text"
              className="form-input"
              value={sessionFormData.subject}
              onChange={(e) => setSessionFormData({ ...sessionFormData, subject: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Session Validity Duration" required>
            <select
              className="form-select"
              value={sessionFormData.minutesValid}
              onChange={(e) => setSessionFormData({ ...sessionFormData, minutesValid: parseInt(e.target.value, 10) })}
            >
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSessionModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? 'Starting...' : 'Generate Code & QR'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Override Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => {
          setShowManualModal(false);
          setFormErrors({});
        }}
        title="Manual Attendance Override"
      >
        <form onSubmit={handleManualMark} noValidate>
          <FormField label="Student MongoDB User ID *" error={formErrors.studentId}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter student's MongoDB User ID"
              value={manualFormData.studentId}
              onChange={(e) => {
                setManualFormData({ ...manualFormData, studentId: e.target.value });
                if (formErrors.studentId) setFormErrors({ ...formErrors, studentId: '' });
              }}
              style={formErrors.studentId ? { borderColor: 'var(--danger)' } : {}}
              autoComplete="off"
            />
          </FormField>

          <FormField label="Course *" error={formErrors.course}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter course name or course code"
              value={manualFormData.course}
              onChange={(e) => {
                setManualFormData({ ...manualFormData, course: e.target.value });
                if (formErrors.course) setFormErrors({ ...formErrors, course: '' });
              }}
              style={formErrors.course ? { borderColor: 'var(--danger)' } : {}}
            />
          </FormField>

          <FormField label="Subject *" error={formErrors.subject}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter subject name"
              value={manualFormData.subject}
              onChange={(e) => {
                setManualFormData({ ...manualFormData, subject: e.target.value });
                if (formErrors.subject) setFormErrors({ ...formErrors, subject: '' });
              }}
              style={formErrors.subject ? { borderColor: 'var(--danger)' } : {}}
            />
          </FormField>

          <FormField label="Attendance Status">
            <select
              className="form-select"
              value={manualFormData.status}
              onChange={(e) => setManualFormData({ ...manualFormData, status: e.target.value })}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowManualModal(false);
                setFormErrors({});
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherAttendance;
