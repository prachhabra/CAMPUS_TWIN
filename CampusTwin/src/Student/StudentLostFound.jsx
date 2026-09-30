import React, { useEffect, useState } from 'react';
import { lostFoundService } from '../services/lostFoundService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LOST_FOUND_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Pagination from '../components/Pagination';
import { HelpCircle, Plus, Search, MapPin, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const StudentLostFound = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await lostFoundService.getItems({
        page,
        limit: 9,
        type: typeFilter,
        category: categoryFilter,
        q: searchQuery
      });
      if (res.success) {
        setItems(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to load lost & found notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, typeFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await lostFoundService.createItem(formData);
      showSuccess('Lost & Found report submitted successfully!');
      setShowReportModal(false);
      setFormData({
        title: '',
        description: '',
        type: 'lost',
        category: 'Electronics',
        location: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchItems();
    } catch (err) {
      showError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      await lostFoundService.updateStatus(id, 'resolved');
      showSuccess('Item marked as resolved / claimed');
      fetchItems();
      if (selectedItem) setSelectedItem(null);
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await lostFoundService.deleteItem(id);
      showSuccess('Notice deleted');
      fetchItems();
      if (selectedItem) setSelectedItem(null);
    } catch (err) {
      showError(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <HelpCircle size={24} color="var(--primary)" /> Lost & Found Board
          </h2>
          <p className="page-subtitle">
            Report misplaced belongings or help reconnect found items with owners
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
          <Plus size={18} /> Report Lost / Found Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by item name, location, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--background)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              gap: 4
            }}
          >
            {['All', 'lost', 'found'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: typeFilter === t ? 'var(--surface)' : 'transparent',
                  color: typeFilter === t ? 'var(--primary)' : 'var(--muted)',
                  boxShadow: typeFilter === t ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 150 }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            {LOST_FOUND_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <Loader message="Loading lost & found reports..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No lost or found items reported"
          description="Everything seems to be safely accounted for right now."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowReportModal(true)}>
              <Plus size={16} /> Report an Item
            </button>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {items.map((item) => {
            const isOwner = (item.reportedBy?._id || item.reportedBy)?.toString() === user?._id?.toString();

            return (
              <Card
                key={item._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 20
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <span
                      className={`status-badge ${item.type === 'lost' ? 'absent' : 'present'}`}
                    >
                      {item.type.toUpperCase()}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: 8
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="var(--primary)" /> Location: {item.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="var(--primary)" /> Date: {formatDate(item.date)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedItem(item)}
                  >
                    View Details
                  </button>

                  {isOwner && item.status === 'open' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleMarkResolved(item._id)}
                    >
                      <CheckCircle2 size={14} /> Resolved
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={9}
        onPageChange={setPage}
      />

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Lost or Found Item"
      >
        <form onSubmit={handleReport}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Report Type" required>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="lost">Lost Item (I misplaced something)</option>
                <option value="found">Found Item (I discovered an item)</option>
              </select>
            </FormField>

            <FormField label="Category" required>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {LOST_FOUND_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Item Name / Title" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Blue Hydro Flask / Scientific Calculator fx-991"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Campus Location" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Central Library 2nd Floor"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Date Noticed" required>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Description & Identifying Details" required>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide color, distinct stickers, scratches, or contact instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className={`status-badge ${selectedItem.type === 'lost' ? 'absent' : 'present'}`}>
                {selectedItem.type.toUpperCase()}
              </span>
              <span className="status-badge student">{selectedItem.category}</span>
              <StatusBadge status={selectedItem.status} />
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {selectedItem.description}
            </p>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--background)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.8125rem'
              }}
            >
              <div><strong>Location:</strong> {selectedItem.location}</div>
              <div><strong>Date:</strong> {formatDate(selectedItem.date)}</div>
              <div><strong>Reported By:</strong> {selectedItem.reportedBy?.name || 'Campus Student'}</div>
            </div>

            {((selectedItem.reportedBy?._id || selectedItem.reportedBy)?.toString() === user?._id?.toString() || user?.role === 'admin') && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                {selectedItem.status === 'open' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleMarkResolved(selectedItem._id)}
                  >
                    <CheckCircle2 size={14} /> Mark as Resolved
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(selectedItem._id)}
                >
                  <Trash2 size={14} /> Delete Notice
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentLostFound;
