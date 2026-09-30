import React, { useEffect, useState } from 'react';
import { lostFoundService } from '../services/lostFoundService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { HelpCircle, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminLostFound = () => {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await lostFoundService.getItems({
        page,
        limit: 10,
        type: 'All',
        q: searchQuery
      });
      if (res.success) {
        setItems(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch lost & found notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await lostFoundService.deleteItem(deleteTarget._id);
      showSuccess(`Notice "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      showError(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await lostFoundService.updateStatus(item._id, newStatus);
      showSuccess('Status updated');
      fetchItems();
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Item Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Reported by: {row.reportedBy?.name || 'Student'} ({row.reportedBy?.email})
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className={`status-badge ${row.type === 'lost' ? 'absent' : 'present'}`}>
          {row.type.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="status-badge student">{row.category}</span>
    },
    {
      header: 'Campus Location',
      accessor: 'location'
    },
    {
      header: 'Date Noticed',
      accessor: 'date',
      render: (row) => formatDate(row.date)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <select
          className="form-select"
          style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
          value={row.status}
          onChange={(e) => handleStatusChange(row, e.target.value)}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteTarget(row)}
          title="Delete notice"
        >
          <Trash2 size={13} />
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <HelpCircle size={24} color="var(--primary)" /> Lost & Found Administration
          </h2>
          <p className="page-subtitle">
            Moderate lost and found notices and resolve reported items
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notices by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyTitle="No notices to moderate"
          emptyMessage="No lost or found reports currently on record."
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
        title="Confirm Notice Deletion"
        message={`Are you sure you want to delete lost & found report "${deleteTarget?.title}"?`}
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};

export default AdminLostFound;
