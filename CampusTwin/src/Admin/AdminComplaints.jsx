import React, { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';
import { useToast } from '../context/ToastContext';
import { COMPLAINT_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { AlertOctagon, Search, CheckCircle2, MessageSquare } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/helpers';

const AdminComplaints = () => {
  const { showSuccess, showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints({
        page,
        limit: 10,
        status: statusFilter,
        category: categoryFilter
      });
      if (res.success) {
        setComplaints(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, categoryFilter]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);
      await complaintService.updateStatus(selectedComplaint._id, {
        status: resolutionStatus,
        resolutionNote: resolutionNote.trim()
      });
      showSuccess(`Complaint ticket updated to ${resolutionStatus}!`);
      setSelectedComplaint(null);
      setResolutionNote('');
      fetchComplaints();
    } catch (err) {
      showError(err.message || 'Failed to update grievance ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Ticket #',
      accessor: '_id',
      render: (row) => <code>#{row._id.slice(-6).toUpperCase()}</code>
    },
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
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="status-badge student">{row.category}</span>
    },
    {
      header: 'Title / Subject',
      accessor: 'title',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{row.title}</span>
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color:
              row.priority === 'urgent'
                ? 'var(--danger)'
                : row.priority === 'high'
                ? 'var(--warning)'
                : 'var(--muted)'
          }}
        >
          {row.priority.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Filed On',
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setSelectedComplaint(row);
            setResolutionStatus(row.status === 'pending' ? 'in-progress' : row.status);
            setResolutionNote(row.resolutionNote || '');
          }}
        >
          Review Ticket
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <AlertOctagon size={24} color="var(--primary)" /> Campus Grievance Desk Moderation
          </h2>
          <p className="page-subtitle">
            Review, investigate, assign, and officially resolve institutional tickets
          </p>
        </div>
      </div>

      <Card>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'pending', 'in-progress', 'resolved', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  padding: '6px 12px',
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

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={complaints}
          loading={loading}
          emptyTitle="No tickets found"
          emptyMessage="No grievance tickets filed in this category."
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      {/* Review & Resolution Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket Review: #${selectedComplaint._id.slice(-6).toUpperCase()}`}
        >
          <form onSubmit={handleResolve}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="status-badge student">{selectedComplaint.category}</span>
                <StatusBadge status={selectedComplaint.status} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)' }}>
                  {selectedComplaint.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedComplaint.description}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontSize: '0.8125rem'
                }}
              >
                <div>Student: <strong>{selectedComplaint.student?.name}</strong> ({selectedComplaint.student?.email})</div>
                <div>Roll Number: {selectedComplaint.student?.rollNumber || 'N/A'} • {selectedComplaint.student?.department}</div>
                {selectedComplaint.hostel && <div>Hostel/Room: {selectedComplaint.hostel} {selectedComplaint.room && `(Room ${selectedComplaint.room})`}</div>}
              </div>

              <FormField label="Update Status" required>
                <select
                  className="form-select"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FormField>

              <FormField label="Official Resolution Note / Action Taken">
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Explain steps taken to resolve the issue (visible to student)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Save Resolution'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminComplaints;
