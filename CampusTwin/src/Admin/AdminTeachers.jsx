import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { Briefcase, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminTeachers = () => {
  const { showSuccess, showError } = useToast();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          role: 'teacher',
          department: selectedDept,
          q: searchQuery,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setTeachers(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch faculty roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, selectedDept]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${deleteTarget._id}`);
      showSuccess(`Faculty account ${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      fetchTeachers();
    } catch (err) {
      showError(err.message || 'Failed to delete faculty account');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Faculty Member',
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => <strong>{row.employeeId || 'N/A'}</strong>
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Contact Phone',
      accessor: 'phone',
      render: (row) => row.phone || '—'
    },
    {
      header: 'Joined On',
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
          title="Delete faculty account"
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
            <Briefcase size={24} color="var(--primary)" /> Faculty Roster Administration
          </h2>
          <p className="page-subtitle">
            Inspect verified professors, department heads, and faculty instructors
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search faculty by name, employee ID, or email..."
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
          data={teachers}
          loading={loading}
          emptyTitle="No faculty members registered"
          emptyMessage="Faculty members who register will appear in this administrative roster."
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
        title="Confirm Faculty Account Deletion"
        message={`Are you sure you want to permanently delete faculty member "${deleteTarget?.name}"?`}
        isDanger={true}
        loading={deleting}
      />
    </div>
  );
};

export default AdminTeachers;
