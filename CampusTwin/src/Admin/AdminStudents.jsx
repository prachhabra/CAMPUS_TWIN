import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { GraduationCap, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminStudents = () => {
  const { showSuccess, showError } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          role: 'student',
          department: selectedDept,
          q: searchQuery,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setStudents(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedDept]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${deleteTarget._id}`);
      showSuccess(`Student account ${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      showError(err.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Roll Number',
      accessor: 'rollNumber',
      render: (row) => <strong>{row.rollNumber || 'N/A'}</strong>
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Year',
      accessor: 'year',
      render: (row) => row.year || '1st Year'
    },
    {
      header: 'Points',
      accessor: 'points',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{row.points || 0}</span>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteTarget(row)}
          title="Delete student account"
        >
          <Trash2 size={13} /> Delete
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <GraduationCap size={24} color="var(--primary)" /> Student Records Administration
          </h2>
          <p className="page-subtitle">
            Search, inspect, and manage institutional student credentials
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by student name, roll number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 180 }}
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
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
          data={students}
          loading={loading}
          emptyTitle="No students registered"
          emptyMessage="Student accounts registered through the portal will appear here."
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
        title="Confirm Student Account Deletion"
        message={`Are you sure you want to permanently delete student "${deleteTarget?.name}"? All associated attendance and records will be impacted.`}
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};

export default AdminStudents;
