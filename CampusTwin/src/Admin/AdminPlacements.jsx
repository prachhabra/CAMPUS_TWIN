import React, { useEffect, useState } from 'react';
import { placementService } from '../services/placementService';
import { useToast } from '../context/ToastContext';
import { PLACEMENT_STATUSES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { Briefcase, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminPlacements = () => {
  const { showSuccess, showError } = useToast();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);

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
      showError(err.message || 'Failed to fetch placement records');
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await placementService.deletePlacement(deleteTarget._id);
      showSuccess('Placement entry deleted');
      setDeleteTarget(null);
      fetchPlacements();
    } catch (err) {
      showError('Failed to delete');
    }
  };

  const columns = [
    {
      header: 'Student Scholar',
      accessor: 'student',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.student?.name || 'Student'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Roll No: {row.student?.rollNumber || 'N/A'} • {row.student?.department}
          </div>
        </div>
      )
    },
    {
      header: 'Company & Role',
      accessor: 'company',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.company}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{row.role}</div>
        </div>
      )
    },
    {
      header: 'Applied Date',
      accessor: 'applicationDate',
      render: (row) => formatDate(row.applicationDate)
    },
    {
      header: 'Interview Round',
      accessor: 'interviewRound',
      render: (row) => row.interviewRound || 'Round 1'
    },
    {
      header: 'CTC / Package',
      accessor: 'package',
      render: (row) => row.package || '—'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteTarget(row)}
          title="Delete record"
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
            <Briefcase size={24} color="var(--primary)" /> Campus Placement & Career Records
          </h2>
          <p className="page-subtitle">
            Audit institutional placement pipelines, company selections, and CTC packages
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by company or role..."
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

      <Card>
        <Table
          columns={columns}
          data={placements}
          loading={loading}
          emptyTitle="No placement applications tracked"
          emptyMessage="Student placement applications will be visible here."
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
        title="Confirm Placement Record Deletion"
        message="Are you sure you want to delete this placement application entry?"
        isDanger={true}
      />
    </div>
  );
};

export default AdminPlacements;
