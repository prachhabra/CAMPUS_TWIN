import React, { useEffect, useState } from 'react';
import { confessionService } from '../services/confessionService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { MessageSquareQuote, Check, X, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminConfessions = () => {
  const { showSuccess, showError } = useToast();

  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const res = await confessionService.getAdminList({
        page,
        limit: 10,
        status: statusFilter
      });
      if (res.success) {
        setConfessions(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch confessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await confessionService.updateStatus(id, newStatus);
      showSuccess(`Confession marked as ${newStatus}`);
      fetchConfessions();
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await confessionService.delete(deleteTarget._id);
      showSuccess('Confession deleted');
      setDeleteTarget(null);
      fetchConfessions();
    } catch (err) {
      showError('Failed to delete confession');
    }
  };

  const columns = [
    {
      header: 'Confession Content',
      accessor: 'content',
      render: (row) => (
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: '0.875rem', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{row.content}"
          </p>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="status-badge student">{row.category}</span>
    },
    {
      header: 'Author (Admin Audit Only)',
      accessor: 'author',
      render: (row) => (
        <div style={{ fontSize: '0.78125rem' }}>
          <div style={{ fontWeight: 600 }}>{row.author?.name || 'Anonymous User'}</div>
          <div style={{ color: 'var(--muted)' }}>{row.author?.rollNumber || row.author?.email}</div>
        </div>
      )
    },
    {
      header: 'Likes',
      accessor: 'likes',
      render: (row) => row.likes?.length || 0
    },
    {
      header: 'Moderation Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Submitted',
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {row.status !== 'approved' && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleUpdateStatus(row._id, 'approved')}
              title="Approve & Publish to Wall"
            >
              <Check size={13} />
            </button>
          )}
          {row.status !== 'rejected' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleUpdateStatus(row._id, 'rejected')}
              title="Reject"
            >
              <X size={13} />
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setDeleteTarget(row)}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <MessageSquareQuote size={24} color="var(--primary)" /> Anonymous Confession Moderation
          </h2>
          <p className="page-subtitle">
            Review submissions, filter abusive language, approve for public display, or reject
          </p>
        </div>
      </div>

      <Card>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'pending', 'approved', 'rejected'].map((st) => (
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
          data={confessions}
          loading={loading}
          emptyTitle="No confessions to moderate"
          emptyMessage="No posts currently in this moderation queue."
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Confirm Confession Deletion"
        message="Are you sure you want to permanently delete this confession?"
        isDanger={true}
      />
    </div>
  );
};

export default AdminConfessions;
