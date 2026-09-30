import React, { useEffect, useState } from 'react';
import { placementService } from '../services/placementService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PLACEMENT_STATUSES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Pagination from '../components/Pagination';
import { Briefcase, Plus, Search, CheckSquare, Trash2, Edit2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const StudentPlacement = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'Applied',
    package: '',
    interviewRound: 'Application Submitted',
    notes: ''
  });

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await placementService.getPlacements({
        page,
        limit: 10,
        status: selectedStatus,
        q: searchQuery
      });
      if (res.success) {
        setPlacements(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch placements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [page, selectedStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPlacements();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      showError('Please provide company name and job role');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await placementService.updatePlacement(editingItem._id, formData);
        showSuccess('Application entry updated!');
      } else {
        await placementService.createPlacement(formData);
        showSuccess('Job application logged to tracker! (+10 Campus Points)');
      }
      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        company: '',
        role: '',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        package: '',
        interviewRound: 'Application Submitted',
        notes: ''
      });
      fetchPlacements();
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      company: item.company,
      role: item.role,
      applicationDate: item.applicationDate ? item.applicationDate.split('T')[0] : '',
      status: item.status,
      package: item.package || '',
      interviewRound: item.interviewRound || '',
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await placementService.deletePlacement(id);
      showSuccess('Application entry deleted');
      fetchPlacements();
    } catch (err) {
      showError(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Briefcase size={24} color="var(--primary)" /> Placement & Career Tracker
          </h2>
          <p className="page-subtitle">
            Track off-campus and on-campus recruitment pipelines, rounds, and offers
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setFormData({
              company: '',
              role: '',
              applicationDate: new Date().toISOString().split('T')[0],
              status: 'Applied',
              package: '',
              interviewRound: 'Application Submitted',
              notes: ''
            });
            setShowAddModal(true);
          }}
        >
          <Plus size={18} /> Track New Application
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by company or role title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            {PLACEMENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Applications Table */}
      <Card>
        {loading ? (
          <Loader message="Loading career applications..." />
        ) : placements.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No placement applications tracked"
            description="Start logging campus drives, interviews, and company applications."
            action={
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} /> Track First Application
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Applied On</th>
                  <th>Current Round</th>
                  <th>Package / CTC</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.company}</td>
                    <td>{p.role}</td>
                    <td>{formatDate(p.applicationDate)}</td>
                    <td>{p.interviewRound || 'Round 1'}</td>
                    <td>{p.package || '—'}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p._id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Update Application Progress' : 'Track Job Application'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Company Name" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Google / Microsoft / Cisco"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Job Role / Designation" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Software Development Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Application Date" required>
              <input
                type="date"
                className="form-input"
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Application Status" required>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {PLACEMENT_STATUSES.filter((s) => s !== 'All').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Current Interview Round">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Technical Round 2 / HR Round"
                value={formData.interviewRound}
                onChange={(e) => setFormData({ ...formData, interviewRound: e.target.value })}
              />
            </FormField>

            <FormField label="Compensation / Package (e.g. LPA)">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 14 LPA"
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Notes & Interview Learnings (Optional)">
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Key questions asked, system design topics, or next follow-up date..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Save Updates' : 'Add to Pipeline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentPlacement;
