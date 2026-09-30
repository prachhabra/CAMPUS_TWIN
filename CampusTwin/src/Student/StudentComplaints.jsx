import React, { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { COMPLAINT_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Pagination from '../components/Pagination';
import { AlertOctagon, Plus, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/helpers';

const StudentComplaints = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Hostel',
    title: '',
    description: '',
    hostel: '',
    room: '',
    priority: 'medium'
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showError('Please provide ticket title and description');
      return;
    }

    try {
      setSubmitting(true);
      await complaintService.createComplaint(formData);
      showSuccess('Grievance ticket submitted successfully!');
      setShowCreateModal(false);
      setFormData({
        category: 'Hostel',
        title: '',
        description: '',
        hostel: '',
        room: '',
        priority: 'medium'
      });
      fetchComplaints();
    } catch (err) {
      showError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setCommenting(true);
      const res = await complaintService.addComment(selectedComplaint._id, commentText.trim());
      showSuccess('Message sent');
      setCommentText('');
      setSelectedComplaint(res.data);
      fetchComplaints();
    } catch (err) {
      showError(err.message || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <AlertOctagon size={24} color="var(--primary)" /> Grievance & Service Desk
          </h2>
          <p className="page-subtitle">
            File and monitor campus facility, hostel, academic, and IT support tickets
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> File New Grievance
        </button>
      </div>

      {/* Filters Bar */}
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

      {/* Complaints List */}
      {loading ? (
        <Loader message="Loading grievance records..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title="No grievances reported"
          description="You have no open or past complaint tickets in this category."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> File a Ticket
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map((c) => (
            <Card
              key={c._id}
              style={{
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onClick={() => setSelectedComplaint(c)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span className="status-badge student">{c.category}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          c.priority === 'urgent'
                            ? 'var(--danger)'
                            : c.priority === 'high'
                            ? 'var(--warning)'
                            : 'var(--muted)'
                      }}
                    >
                      {c.priority.toUpperCase()} PRIORITY
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      #{c._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)' }}>
                    {c.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      marginTop: 4,
                      lineHeight: 1.4,
                      maxWidth: 700
                    }}
                  >
                    {c.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      fontSize: '0.75rem',
                      color: 'var(--muted)',
                      marginTop: 10
                    }}
                  >
                    <span>Filed: {formatDate(c.createdAt)}</span>
                    {c.hostel && <span>Hostel: {c.hostel} {c.room && `(Room ${c.room})`}</span>}
                    {c.comments?.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}>
                        <MessageSquare size={12} /> {c.comments.length} updates
                      </span>
                    )}
                  </div>
                </div>

                <StatusBadge status={c.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={10}
        onPageChange={setPage}
      />

      {/* File Complaint Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="File Grievance / Service Request"
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Category" required>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {COMPLAINT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Priority Level" required>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </FormField>
          </div>

          <FormField label="Issue Summary / Title" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. WiFi outage in Block B 3rd Floor"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Hostel / Building Block (Optional)">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aryabhata Hall"
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
              />
            </FormField>

            <FormField label="Room / Lab Number (Optional)">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Room 314"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Detailed Description" required>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the issue, frequency, impact, and when it started..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Register Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complaint Detail & Comment Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket #${selectedComplaint._id.slice(-6).toUpperCase()}: ${selectedComplaint.title}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="status-badge student">{selectedComplaint.category}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)' }}>
                  {selectedComplaint.priority.toUpperCase()}
                </span>
              </div>
              <StatusBadge status={selectedComplaint.status} />
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {selectedComplaint.description}
            </p>

            {selectedComplaint.resolutionNote && (
              <div
                style={{
                  padding: 14,
                  backgroundColor: 'var(--success-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #b7eb8f',
                  fontSize: '0.8125rem'
                }}
              >
                <strong>Official Resolution Note:</strong> {selectedComplaint.resolutionNote}
              </div>
            )}

            {/* Comments Thread */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 10 }}>
                Updates & Dialogue ({selectedComplaint.comments?.length || 0})
              </h4>

              <div
                style={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                {(!selectedComplaint.comments || selectedComplaint.comments.length === 0) ? (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                    No messages yet on this ticket thread.
                  </span>
                ) : (
                  selectedComplaint.comments.map((comm, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface-alt)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--primary)'
                        }}
                      >
                        <span>{comm.user?.name || 'Administrator'}</span>
                        <span style={{ color: 'var(--muted)' }}>{formatDateTime(comm.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text)', marginTop: 4 }}>
                        {comm.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Post an update or reply to administrator..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={commenting}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={commenting || !commentText.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentComplaints;
