import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { GraduationCap, Search, Copy, Check, Mail, Phone } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';

const TeacherStudents = () => {
  const { showSuccess, showError } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/students', {
        params: { department: selectedDept, q: searchQuery }
      });
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load students directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDept]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showSuccess('Student ID copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <GraduationCap size={24} color="var(--primary)" /> Student Directory & Profiles
          </h2>
          <p className="page-subtitle">
            Inspect enrolled campus students, verification IDs, and academic information
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            onChange={(e) => setSelectedDept(e.target.value)}
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

      {/* Students Grid */}
      {loading ? (
        <Loader message="Loading student records..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="There are currently no students matching your query in this department."
        />
      ) : (
        <div className="grid-cols-3">
          {students.map((st) => (
            <Card key={st._id} style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                {st.profileImage ? (
                  <img
                    src={st.profileImage}
                    alt={st.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    {getInitials(st.name)}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                    {st.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Roll No: {st.rollNumber || 'Not set'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: '0.78125rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div>Department: <strong>{st.department}</strong></div>
                <div>Year: <strong>{st.year || '1st Year'}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} color="var(--muted)" /> {st.email}
                </div>
                {st.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} color="var(--muted)" /> {st.phone}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Enrolled: {formatDate(st.createdAt)}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopyId(st._id)}
                  title="Copy Student ID for course enrollment"
                >
                  {copiedId === st._id ? (
                    <>
                      <Check size={13} color="var(--success)" /> Copied ID
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
