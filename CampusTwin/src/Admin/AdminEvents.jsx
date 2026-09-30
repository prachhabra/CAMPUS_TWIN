import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { Calendar, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminEvents = () => {
  const { showSuccess, showError } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({ page, limit: 10, q: searchQuery });
      if (res.success) {
        setEvents(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await eventService.deleteEvent(deleteTarget._id);
      showSuccess(`Event "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      showError(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (event, newStatus) => {
    try {
      await eventService.updateEvent(event._id, { status: newStatus });
      showSuccess(`Event status changed to ${newStatus}`);
      fetchEvents();
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Event Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{row.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Organized by {row.organizer || 'Council'}
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
      header: 'Date & Time',
      accessor: 'date',
      render: (row) => `${formatDate(row.date)} at ${row.time}`
    },
    {
      header: 'Venue',
      accessor: 'venue'
    },
    {
      header: 'RSVP Count',
      accessor: 'registeredStudents',
      render: (row) => (
        <strong>
          {row.registeredStudents?.length || 0} / {row.registrationLimit}
        </strong>
      )
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
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
          title="Delete event"
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
            <Calendar size={24} color="var(--primary)" /> Campus Events Moderation
          </h2>
          <p className="page-subtitle">
            Oversee and moderate institutional fests, hackathons, and guest lectures
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events by title or venue..."
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
          data={events}
          loading={loading}
          emptyTitle="No events to moderate"
          emptyMessage="No campus events have been scheduled."
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
        title="Confirm Event Deletion"
        message={`Are you sure you want to delete event "${deleteTarget?.title}"?`}
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};

export default AdminEvents;
